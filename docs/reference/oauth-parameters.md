---
sidebar_position: 2
title: OAuth Parameters Reference
---

# OAuth Parameters Reference

## Authorization endpoint

```
GET https://auth.loginwithdomain.com/oauth/authorize
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | yes | Your registered client ID |
| `redirect_uri` | yes | Must exactly match a registered URI |
| `response_type` | yes | Always `code` |
| `scope` | yes | Space-separated scope list (e.g. `openid`) |
| `state` | recommended | Opaque CSRF-prevention value |
| `code_challenge` | recommended | Base64URL SHA-256 of code verifier (PKCE) |
| `code_challenge_method` | if PKCE | Always `S256` |

---

## Token endpoint

```
POST https://auth.loginwithdomain.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

### Authorization Code grant

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | yes | `authorization_code` |
| `code` | yes | Authorization code from callback |
| `redirect_uri` | yes | Must match the authorization request |
| `client_id` | yes* | Via body or Basic auth |
| `client_secret` | yes* | Via body or Basic auth |
| `code_verifier` | if PKCE | Original PKCE verifier string |

*Client credentials can be sent as `Authorization: Basic BASE64(client_id:client_secret)` instead of body params.

### Refresh Token grant

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | yes | `refresh_token` |
| `refresh_token` | yes | The refresh token |
| `client_id` | yes | Your client ID |

---

## Token response

| Field | Description |
|-------|-------------|
| `access_token` | Bearer token. Valid for 3600 seconds. |
| `token_type` | Always `bearer` |
| `expires_in` | `3600` |
| `refresh_token` | Token for refresh grant |
| `scope` | Granted scopes |
| `validation_data` | *(Optional)* Cryptographic domain proof |

### `validation_data` fields

| Field | Description |
|-------|-------------|
| `fqdn` | `{identifier}#{deviceId}` |
| `public_key` | Hex-encoded Ed25519 public key |
| `hash_algo` | `sha256` |
| `signed_payload` | The challenge that was signed (hex) |
| `signature` | Hex-encoded Ed25519 signature |

---

## UserInfo endpoint

```
GET https://auth.loginwithdomain.com/oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

| Field | Description |
|-------|-------------|
| `sub` | The user's domain identifier |

---

## Error codes

| Code | HTTP status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Missing or malformed parameters |
| `invalid_client` | 400 | Unknown `client_id` or wrong `client_secret` |
| `invalid_grant` | 400 | Unknown, expired, or mismatched code; PKCE failure |
| `access_denied` | — | User denied consent (returned as redirect parameter) |
| `unsupported_grant_type` | 400 | Grant type not supported |

---

## Scopes

| Scope | Description |
|-------|-------------|
| `openid` | Required. Enables `sub` claim in userinfo. |
| `profile` | Reserved. |

---

## Discovery

```
GET https://auth.loginwithdomain.com/.well-known/openid-configuration
```
