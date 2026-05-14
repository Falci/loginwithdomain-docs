---
sidebar_position: 4
title: UserInfo Endpoint
---

# UserInfo Endpoint

```
GET https://auth.loginwithdomain.com/oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

Returns the authenticated user's claims.

---

## Response

```json
{
  "sub": "alice.example.com"
}
```

| Field | Description |
|-------|-------------|
| `sub` | The user's domain identifier. This is the canonical identity. |

The `sub` claim is the domain as entered by the user (lowercased), e.g. `alice.com` or `alice@company.com`.

---

## Notes

- The `sub` claim is the only guaranteed field. Additional claims may be added in future protocol versions under the `profile` scope.
- Access tokens expire after 1 hour. Use a refresh token to get a new one.
- A 401 response means the token is missing, expired, or invalid.
