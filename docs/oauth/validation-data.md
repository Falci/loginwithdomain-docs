---
sidebar_position: 6
title: validation_data
---

# `validation_data`

`validation_data` is an LWD extension to the standard OAuth token response. It carries a cryptographic proof that the user controls the domain they authenticated with — verifiable entirely from public data, with no need to trust LWD.

---

## When it's included

`validation_data` appears in the token response only when **all** of these are true:

1. Your OAuth app has `includeValidationData` enabled (request this during app registration).
2. The authorization request used PKCE (`code_challenge` + `code_challenge_method=S256`).

---

## Structure

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "openid",
  "validation_data": {
    "fqdn": "alice.com#a1b2c3d4e5f6a7b8",
    "public_key": "pQECAyYgASFYIK...",
    "hash_algo": "passkey-webauthn-v1",
    "signed_payload": "SZYN5YgOjGh0NBgdF....eyJ0eXBlIjoid2ViYXV0...",
    "signature": "MEUCIQDa3f..."
  }
}
```

| Field | Format | Description |
|-------|--------|-------------|
| `fqdn` | `{identifier}#{deviceId}` | The user's identity and the device that signed |
| `public_key` | base64url-encoded COSE key | The passkey's public key |
| `hash_algo` | string | Always `"passkey-webauthn-v1"` |
| `signed_payload` | `{authenticatorData}.{clientDataJSON}` | Two base64url strings joined with `.` |
| `signature` | base64url-encoded bytes | WebAuthn assertion signature |

`signed_payload` splits on the first `.` into:
- `authenticatorData` — authenticator metadata bytes (base64url)
- `clientDataJSON` — the browser's signed JSON object (base64url)

---

## Step-by-step verification

This tutorial shows how to verify `validation_data` in Node.js 18+. No LWD-specific libraries required — only standard cryptography and a DNS lookup.

### Prerequisites

```bash
npm install cbor-x
```

`cbor-x` is used to decode the COSE public key. Everything else uses Node built-ins.

### 0 — Parse the payload

```js
import { createHash } from "crypto";
import { decode as decodeCBOR } from "cbor-x";

const { fqdn, public_key, hash_algo, signed_payload, signature } = validation_data;

// Split fqdn into identifier and deviceId
const hashIdx = fqdn.lastIndexOf("#");
const identifier = fqdn.slice(0, hashIdx);   // e.g. "alice.com" or "alice@company.com"
const deviceId   = fqdn.slice(hashIdx + 1);  // e.g. "a1b2c3d4e5f6a7b8"

// Split signed_payload into its two base64url components
const dotIdx = signed_payload.indexOf(".");
const authenticatorData = Buffer.from(signed_payload.slice(0, dotIdx), "base64url");
const clientDataJSON    = Buffer.from(signed_payload.slice(dotIdx + 1), "base64url");

const publicKeyBytes = Buffer.from(public_key, "base64url");
const signatureBytes = Buffer.from(signature,   "base64url");
```

---

### 1 — Verify the PKCE binding

This step proves the passkey assertion was produced specifically for **your** authorization request and cannot be replayed across flows.

```js
// Decode the clientDataJSON and inspect the challenge
const clientData = JSON.parse(clientDataJSON.toString("utf-8"));

// Your code_challenge = base64url(sha256(code_verifier))
const expectedChallenge = createHash("sha256")
  .update(Buffer.from(codeVerifier, "utf-8"))  // the verifier you sent in /oauth/token
  .digest("base64url");

// clientData.challenge is base64url(sha256(code_verifier)) — they must match
if (clientData.challenge !== expectedChallenge) {
  throw new Error("Challenge mismatch: assertion is not bound to this OAuth request");
}

// Also confirm the ceremony happened at LWD's origin
if (clientData.type !== "webauthn.get") {
  throw new Error("Unexpected clientData type");
}
if (clientData.origin !== "https://auth.loginwithdomain.com") {
  throw new Error("Unexpected origin");
}
```

:::tip Why this matters
Without this check, a stolen `validation_data` from a different session could be replayed against your token. Binding the passkey challenge to your PKCE verifier closes that window.
:::

---

### 2 — Verify the DNS binding

This step proves the public key is legitimately registered under the claimed domain. Anyone can run this lookup — no LWD involvement needed.

```js
import { promises as dns } from "dns";

// Derive the DNS name from the identifier
const [user, domain] = identifier.includes("@")
  ? identifier.split("@")
  : [null, identifier];

const dnsName = user
  ? `${deviceId}.${user}._lwd.${domain}`
  : `${deviceId}._lwd.${domain}`;

// Look up the TXT record
const records = await dns.resolveTxt(dnsName);
const txtValue = records.flat().join("");

// Parse the lwd1 record fields  (e.g. "v=lwd1; pk=abc123...")
const fields = Object.fromEntries(
  txtValue.split(";").map((s) => s.trim().split("=").map((p) => p.trim()))
);
if (fields.v !== "lwd1" || !fields.pk) {
  throw new Error("Invalid or missing LWD DNS record");
}

// Verify the public key hash matches the DNS record
const pkHash = createHash("sha256").update(publicKeyBytes).digest("hex");

if (pkHash !== fields.pk) {
  throw new Error("Public key does not match DNS record");
}
```

After this step you know: whoever controls `alice.com`'s DNS deliberately published this public key for this device.

---

### 3 — Verify the WebAuthn signature

This step proves the user held the private key at the time of authentication.

The signature covers `authenticatorData || sha256(clientDataJSON)` — the standard WebAuthn assertion verification formula. Most modern passkeys use **ES256** (ECDSA P-256 with SHA-256); the COSE key's `alg` field (-7 for ES256) tells you which algorithm was used.

```js
async function verifyWebAuthnSignature(publicKeyBytes, authenticatorData, clientDataJSON, signatureBytes) {
  // Decode the COSE public key (CBOR map)
  const coseKey = decodeCBOR(publicKeyBytes);
  const alg = coseKey.get(3); // COSE algorithm identifier

  if (alg !== -7) {
    // -7 = ES256. Other algorithms (EdDSA = -8, RS256 = -257) need different handling.
    throw new Error(`Unsupported COSE algorithm ${alg} — only ES256 is shown here`);
  }

  // ES256: ECDSA on P-256 with SHA-256
  const x = coseKey.get(-2); // x coordinate, 32 bytes
  const y = coseKey.get(-3); // y coordinate, 32 bytes

  // Import as a WebCrypto ECDSA key (raw uncompressed point: 0x04 || x || y)
  const ecKey = await globalThis.crypto.subtle.importKey(
    "raw",
    new Uint8Array([0x04, ...x, ...y]),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  // WebAuthn signed data = authenticatorData || sha256(clientDataJSON)
  const clientDataHash = createHash("sha256").update(clientDataJSON).digest();
  const signedData = Buffer.concat([authenticatorData, clientDataHash]);

  // Signature is DER-encoded ECDSA
  const ok = await globalThis.crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    ecKey,
    signatureBytes,
    signedData
  );

  if (!ok) throw new Error("WebAuthn signature is invalid");
}

await verifyWebAuthnSignature(publicKeyBytes, authenticatorData, clientDataJSON, signatureBytes);
```

---

### 4 — Confirm identity matches the token subject

```js
// Fetch the userinfo endpoint with the access token
const userinfo = await fetch("https://auth.loginwithdomain.com/oauth/userinfo", {
  headers: { Authorization: `Bearer ${accessToken}` },
}).then((r) => r.json());

if (identifier !== userinfo.sub) {
  throw new Error("FQDN does not match token subject");
}
```

This guards against a `validation_data` payload from user A being substituted into a session for user B.

---

### Putting it together

```js
async function verifyValidationData(tokens, codeVerifier) {
  const { access_token, validation_data } = tokens;
  if (!validation_data) return; // app doesn't have includeValidationData or no PKCE was used

  // 0 — parse
  const { fqdn, public_key, signed_payload, signature } = validation_data;
  const hashIdx = fqdn.lastIndexOf("#");
  const identifier = fqdn.slice(0, hashIdx);
  const deviceId   = fqdn.slice(hashIdx + 1);
  const dotIdx     = signed_payload.indexOf(".");
  const authenticatorData = Buffer.from(signed_payload.slice(0, dotIdx),  "base64url");
  const clientDataJSON    = Buffer.from(signed_payload.slice(dotIdx + 1), "base64url");
  const publicKeyBytes    = Buffer.from(public_key, "base64url");
  const signatureBytes    = Buffer.from(signature,  "base64url");

  // 1 — PKCE binding
  const clientData = JSON.parse(clientDataJSON.toString("utf-8"));
  const expectedChallenge = createHash("sha256").update(codeVerifier, "utf-8").digest("base64url");
  if (clientData.challenge !== expectedChallenge) throw new Error("Challenge mismatch");
  if (clientData.type !== "webauthn.get")          throw new Error("Wrong ceremony type");
  if (clientData.origin !== "https://auth.loginwithdomain.com") throw new Error("Wrong origin");

  // 2 — DNS binding
  const [user, domain] = identifier.includes("@") ? identifier.split("@") : [null, identifier];
  const dnsName = user ? `${deviceId}.${user}._lwd.${domain}` : `${deviceId}._lwd.${domain}`;
  const records = await dns.resolveTxt(dnsName);
  const fields = Object.fromEntries(
    records.flat().join("").split(";").map((s) => s.trim().split("=").map((p) => p.trim()))
  );
  const pkHash = createHash("sha256").update(publicKeyBytes).digest("hex");
  if (pkHash !== fields.pk) throw new Error("Public key does not match DNS");

  // 3 — WebAuthn signature
  await verifyWebAuthnSignature(publicKeyBytes, authenticatorData, clientDataJSON, signatureBytes);

  // 4 — identity
  const userinfo = await fetch("https://auth.loginwithdomain.com/oauth/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  }).then((r) => r.json());
  if (identifier !== userinfo.sub) throw new Error("FQDN does not match sub");
}
```

---

## What this proves

After all four checks pass you have cryptographic evidence that:

| Check | What it proves |
|-------|----------------|
| PKCE binding | The assertion was signed for **this specific OAuth request**, not replayed |
| DNS binding | The public key is registered in DNS under the claimed domain |
| WebAuthn signature | The user held the passkey's private key at authentication time |
| Identity | The domain in the proof matches the `sub` you'll use as the user ID |

This proof is fully independent of LWD's infrastructure. Even if LWD were compromised, an attacker could not forge `validation_data` that passes DNS verification for a domain they don't control, nor produce a valid WebAuthn signature without the user's device.

---

## Use cases

- **High-assurance login** — financial, legal, or enterprise apps that need more than "LWD says so".
- **Delegated verification** — pass `validation_data` to a backend service that verifies domain ownership without calling LWD at all.
- **Audit trails** — store `signed_payload` and `signature` as a tamper-proof authentication record tied to a specific request.
