---
sidebar_position: 2
title: Log In
---

# Log In

Logging in with LWD works differently depending on the context: directly on `loginwithdomain.com`, or via an OAuth-integrated app.

---

## Logging in to an app (OAuth)

When an app uses LWD for authentication, you'll be redirected to LWD's authorization page.

1. **Enter your domain** — type `alice.com` or `alice@company.com`.
2. **LWD looks up your SP** — it checks `_lwd.yourdomain.com` in DNS to find your Signing Provider.
3. **Authenticate with your SP** — if your SP is LWD, enter your password. If your SP is external, you're redirected there.
4. **Review the consent screen** — on first login to an app, you'll see what data the app is requesting.
5. **Redirected back to the app** — you're authenticated.

---

## Logging in with a passkey

If you've registered a passkey for your domain, you can use it instead of your password:

1. Click **"Use passkey"** on the login screen.
2. Your browser or device prompts for biometric or PIN verification.
3. You're authenticated.

Passkeys are device-local and can be added from your dashboard settings.

---

## What the app receives

After login, the app gets an access token. When it calls the userinfo endpoint, it receives:

```json
{ "sub": "alice.com" }
```

If the app requested `validation_data`, the token response also includes cryptographic proof of your domain ownership.

---

## External Signing Providers

If your domain's SP record points to a Signing Provider other than `loginwithdomain.com`, you'll be redirected to that SP during login. The SP handles credential verification and signs the challenge. The experience may look different, but the protocol is the same.
