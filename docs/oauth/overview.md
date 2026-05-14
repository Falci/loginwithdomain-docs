---
sidebar_position: 1
title: Overview
---

# OAuth Integration Overview

LWD is a fully compliant **OpenID Connect (OIDC) provider** built on top of the LWD domain authentication protocol. Any app that supports OAuth 2.0 Authorization Code flow can integrate with LWD.

---

## Discovery

The OpenID Connect discovery document is available at:

```
GET https://auth.loginwithdomain.com/.well-known/openid-configuration
```

---

## Endpoints

| Endpoint | Path |
|----------|------|
| Authorization | `/oauth/authorize` |
| Token | `/oauth/token` |
| UserInfo | `/oauth/userinfo` |

---

## What you get

After a successful OAuth flow, your app receives:

- An **access token** — present it to the userinfo endpoint to get the user's identity.
- A **refresh token** — exchange it for a new access token when the current one expires.
- The user's **`sub` claim** — their domain identifier (e.g. `alice.com`).
- Optionally, **`validation_data`** — a cryptographic proof that the user controls their domain, signed by their Signing Provider and verifiable against DNS.

---

## Supported flows

| Flow | Support |
|------|---------|
| Authorization Code | ✓ |
| Authorization Code + PKCE | ✓ (recommended for public clients) |
| Refresh Token | ✓ |
| Implicit | ✗ |
| Client Credentials | ✗ |

---

## Registering an app

Apps must be registered through the LWD dashboard. You'll receive a `client_id` and `client_secret`. During registration you specify the allowed `redirect_uri` values.

→ See [Integrate OAuth](/guides/integrate-oauth) for a step-by-step guide.
