---
sidebar_position: 5
title: Scopes
---

# Scopes

Scopes control what information your app can access.

---

## Available scopes

| Scope | Description |
|-------|-------------|
| `openid` | Required. Enables the ID token and `sub` claim in the userinfo response. |
| `profile` | Reserved for future use. Will expose additional profile fields. |

---

## Requesting scopes

Include scopes as a space-separated list in the authorization request:

```
?scope=openid
```

---

## Consent

When a user authorizes your app for the first time, they see a consent screen listing the requested scopes. On subsequent logins with the same scope set, consent is remembered and the screen is skipped.

If your app requests additional scopes in a future login, the consent screen will appear again for the new scopes.

