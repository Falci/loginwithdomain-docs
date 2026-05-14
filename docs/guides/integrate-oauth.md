---
sidebar_position: 3
title: Integrate OAuth
---

# Integrate OAuth

This guide shows how to add "Login With Domain" to your application using the OAuth 2.0 Authorization Code flow with PKCE.

---

## Prerequisites

- A registered OAuth app (see your LWD dashboard for `client_id` and `client_secret`)
- A `redirect_uri` that is registered with your app

---

## 1 — Redirect to authorize

When the user clicks "Login", redirect them to:

```
https://auth.loginwithdomain.com/oauth/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=openid
  &state=RANDOM_STATE
  &code_challenge=CODE_CHALLENGE
  &code_challenge_method=S256
```

Generate the PKCE parameters:

```js
import { randomBytes, createHash } from "crypto";

const codeVerifier = randomBytes(32).toString("base64url");
const codeChallenge = createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");

// Store codeVerifier in session — you'll need it in step 3
session.codeVerifier = codeVerifier;
```

---

## 2 — Handle the callback

After the user authenticates and consents, LWD redirects to your `redirect_uri`:

```
https://yourapp.com/callback?code=AUTH_CODE&state=STATE
```

Validate the `state` matches what you stored before redirecting, then extract the `code`.

---

## 3 — Exchange the code for tokens

```js
const response = await fetch("https://auth.loginwithdomain.com/oauth/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: "https://yourapp.com/callback",
    code_verifier: session.codeVerifier,
  }),
});

const tokens = await response.json();
// tokens.access_token, tokens.refresh_token, tokens.validation_data?
```

---

## 4 — Get the user's identity

```js
const userinfo = await fetch("https://auth.loginwithdomain.com/oauth/userinfo", {
  headers: { Authorization: `Bearer ${tokens.access_token}` },
}).then((r) => r.json());

console.log(userinfo.sub); // "alice.com"
```

The `sub` claim is your user's permanent, unique identifier — their domain.

---

## 5 — (Optional) Verify `validation_data`

If you enabled `includeValidationData` and used PKCE, the token response contains cryptographic proof of domain ownership that you can verify independently:

```js
import { createHash } from "crypto";
import { promises as dns } from "dns";

const { validation_data } = tokens;

if (validation_data) {
  const { fqdn, public_key, signed_payload, signature } = validation_data;

  // Parse the payload
  const hashIdx = fqdn.lastIndexOf("#");
  const identifier = fqdn.slice(0, hashIdx);
  const deviceId   = fqdn.slice(hashIdx + 1);
  const dotIdx     = signed_payload.indexOf(".");
  const authenticatorData = Buffer.from(signed_payload.slice(0, dotIdx),  "base64url");
  const clientDataJSON    = Buffer.from(signed_payload.slice(dotIdx + 1), "base64url");
  const publicKeyBytes    = Buffer.from(public_key, "base64url");

  // 1. Verify PKCE binding — the assertion was for THIS request
  const clientData = JSON.parse(clientDataJSON.toString("utf-8"));
  const expectedChallenge = createHash("sha256")
    .update(codeVerifier, "utf-8")   // the verifier you sent in step 3
    .digest("base64url");
  assert(clientData.challenge === expectedChallenge, "Challenge mismatch");

  // 2. Verify the public key is in DNS for the claimed domain
  const [user, domain] = identifier.includes("@") ? identifier.split("@") : [null, identifier];
  const dnsName = user ? `${deviceId}.${user}._lwd.${domain}` : `${deviceId}._lwd.${domain}`;
  const records = await dns.resolveTxt(dnsName);
  const fields = Object.fromEntries(
    records.flat().join("").split(";").map((s) => s.trim().split("=").map((p) => p.trim()))
  );
  const pkHash = createHash("sha256").update(publicKeyBytes).digest("hex");
  assert(pkHash === fields.pk, "Public key does not match DNS");

  // 3. Confirm identity matches the token subject
  assert(identifier === userinfo.sub, "FQDN does not match sub");
}
```

For full WebAuthn signature verification (step 4), see the complete tutorial in [`validation_data`](/oauth/validation-data).

---

## Refreshing tokens

```js
const response = await fetch("https://auth.loginwithdomain.com/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: clientId,
  }),
});

const newTokens = await response.json();
```

Both the access token and refresh token are rotated on every refresh call.

---

## Summary

| Step | Endpoint |
|------|----------|
| Start login | `GET /oauth/authorize` |
| Exchange code | `POST /oauth/token` |
| Get user identity | `GET /oauth/userinfo` |
| Refresh tokens | `POST /oauth/token` (grant_type=refresh_token) |
