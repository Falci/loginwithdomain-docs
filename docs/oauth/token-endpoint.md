---
sidebar_position: 3
title: Token Endpoint
---

# Token Endpoint

```
POST https://auth.loginwithdomain.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

---

## Authorization Code grant

Exchange an authorization code for access and refresh tokens.

**Request:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic BASE64(client_id:client_secret)

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=https://yourapp.com/callback
&code_verifier=PKCE_VERIFIER
```

Client authentication can be done via:
- **HTTP Basic auth** (recommended): `Authorization: Basic BASE64(client_id:client_secret)`
- **Body parameters**: `client_id` and `client_secret` in the form body

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | yes | `authorization_code` |
| `code` | yes | The authorization code from the callback |
| `redirect_uri` | yes | Must match the value used in the authorization request |
| `code_verifier` | if PKCE used | The original PKCE verifier string |

**Response:**

```json
{
  "access_token": "a3f1b2c3d4e5...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "b4c5d6e7f8a9...",
  "scope": "openid",
  "validation_data": { ... }
}
```

| Field | Description |
|-------|-------------|
| `access_token` | Bearer token for API calls. Valid for 1 hour. |
| `token_type` | Always `bearer` |
| `expires_in` | Seconds until `access_token` expires (3600) |
| `refresh_token` | Token to get a new access token |
| `scope` | Space-separated scopes that were granted |
| `validation_data` | *(Optional)* Cryptographic proof of domain ownership. See [`validation_data`](/oauth/validation-data). |

---

## Refresh Token grant

Exchange a refresh token for a new access token.

**Request:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=b4c5d6e7f8a9...
&client_id=YOUR_CLIENT_ID
```

**Response:**

```json
{
  "access_token": "new_access_token...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "new_refresh_token...",
  "scope": "openid"
}
```

Both the access token and refresh token are rotated on every refresh.

---

## Error responses

All errors return HTTP 400 with a JSON body:

```json
{
  "error": "invalid_grant",
  "error_description": "Code expired"
}
```

| Error code | Cause |
|------------|-------|
| `invalid_request` | Missing required parameters |
| `invalid_client` | Unknown `client_id` or wrong `client_secret` |
| `invalid_grant` | Unknown, expired, or mismatched code; PKCE failure |
| `unsupported_grant_type` | `grant_type` is not `authorization_code` or `refresh_token` |
