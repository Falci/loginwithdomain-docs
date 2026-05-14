---
sidebar_position: 2
title: Identifiers
---

# Identifiers

An LWD identifier is either a bare domain or a user-at-domain address. Both are valid in any context where you'd enter your "username".

---

## Formats

### Domain identity

```
alice.com
company.io
```

The entire domain is the identity. This is the simplest form: one domain, one user.

### User-at-domain identity

```
alice@company.com
bob@example.org
```

Multiple users can each have their own identity under a single domain. The part before `@` is the local user, and the part after is the domain.

---

## DNS name derivation

The identifier format determines where DNS records live:

| Identifier | SP record | Device record |
|-----------|-----------|---------------|
| `alice.com` | `_lwd.alice.com` | `{deviceId}._lwd.alice.com` |
| `alice@company.com` | `_lwd.company.com` | `{deviceId}.alice._lwd.company.com` |

The SP record is always at `_lwd.{domain}`, shared by all users of that domain. Device records are per-user when the `@` form is used.

---

## FQDN format

After authentication, identities are expressed as a **Fully Qualified Domain Name** that includes the device ID:

```
alice.com#a1b2c3d4e5f6a7b8
alice@company.com#a1b2c3d4e5f6a7b8
```

The part after `#` is the 16-character hex device ID. This FQDN appears in the `fqdn` field of [`validation_data`](/oauth/validation-data).

---

## Case sensitivity

Identifiers are always lowercased before processing. `Alice.COM` and `alice.com` refer to the same identity.
