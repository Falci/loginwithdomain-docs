---
sidebar_position: 1
title: DNS Records Reference
---

# DNS Records Reference

## Record format

All LWD DNS records are TXT records with semicolon-separated key-value pairs:

```
v=lwd1; key=value; key=value
```

- The `v=lwd1` version tag must appear first.
- Keys and values are trimmed of whitespace.
- Unrecognised keys are silently ignored.

---

## SP record

| Property | Value |
|----------|-------|
| **DNS name** | `_lwd.{domain}` |
| **Type** | `TXT` |
| **Purpose** | Advertise the Signing Provider for this domain |

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `v` | yes | Always `lwd1` |
| `sp` | yes | Base URL of the Signing Provider |

### Example

```
_lwd.example.com   TXT   "v=lwd1; sp=https://sp.loginwithdomain.com"
```

---

## Device record

| Property | Value |
|----------|-------|
| **DNS name** | `{deviceId}._lwd.{domain}` or `{deviceId}.{user}._lwd.{domain}` |
| **Type** | `TXT` |
| **Purpose** | Store the public key hash for an identity |

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `v` | yes | Always `lwd1` |
| `pk` | yes | SHA-256 hash of the Ed25519 public key, hex-encoded (64 chars) |

### Examples

Domain identity (`alice.com`):
```
a1b2c3d4e5f6a7b8._lwd.alice.com   TXT   "v=lwd1; pk=3f2a1b4c..."
```

User-at-domain identity (`alice@company.com`):
```
a1b2c3d4e5f6a7b8.alice._lwd.company.com   TXT   "v=lwd1; pk=3f2a1b4c..."
```

---

## Device ID

The device ID is a **16-character hex string** (8 bytes) derived deterministically from the identifier. The same identifier always produces the same device ID.

---

## NS delegation (managed DNS)

Instead of managing TXT records manually, you can delegate the `_lwd.` subdomain:

```
_lwd.example.com   NS   ns.loginwithdomain.com
```

LWD then manages the SP and device TXT records on your behalf.

---

## Identifier → DNS name mapping

| Identifier | SP record | Device record |
|-----------|-----------|---------------|
| `alice.com` | `_lwd.alice.com` | `{deviceId}._lwd.alice.com` |
| `alice@company.com` | `_lwd.company.com` | `{deviceId}.alice._lwd.company.com` |
