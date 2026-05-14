---
sidebar_position: 3
title: DNS Records
---

# DNS Records

LWD uses two types of DNS TXT records. Both follow the same key-value format and both start with `v=lwd1`.

---

## Record format

```
v=lwd1; key1=value1; key2=value2
```

Fields are separated by semicolons. Whitespace around the `=` and `;` is ignored. Unrecognised fields are silently ignored, which allows future protocol versions to add fields without breaking older parsers.

The version tag `v=lwd1` is always the first field and must appear verbatim.

---

## SP record

**Where:** `_lwd.{domain}` (TXT)  
**Purpose:** Tells the world which Signing Provider handles authentication for this domain.

```
_lwd.example.com   TXT   "v=lwd1; sp=https://sp.loginwithdomain.com"
```

| Field | Required | Description |
|-------|----------|-------------|
| `v` | yes | Protocol version. Always `lwd1`. |
| `sp` | yes | URL of the Signing Provider. Authentication requests are directed here. |

The SP URL points to the base path of the SP; the `/sp/auth` endpoint is expected to exist under it.

---

## Device record

**Where:** `{deviceId}._lwd.{domain}` or `{deviceId}.{user}._lwd.{domain}` (TXT)  
**Purpose:** Stores the SHA-256 hash of the public key for one device/account.

```
a1b2c3d4e5f6a7b8._lwd.example.com   TXT   "v=lwd1; pk=3f2a1b4c..."
```

For user-at-domain identifiers:

```
a1b2c3d4e5f6a7b8.alice._lwd.example.com   TXT   "v=lwd1; pk=3f2a1b4c..."
```

| Field | Required | Description |
|-------|----------|-------------|
| `v` | yes | Protocol version. Always `lwd1`. |
| `pk` | yes | Hex-encoded SHA-256 hash of the Ed25519 public key (64 hex characters). |

The **device ID** in the record name is a 16-character hex string. An identity can have multiple device records — each registered device (e.g. each passkey) gets its own device ID and its own TXT record. The SP manages which device IDs exist for each identity.

---

## DNS lookup

Any verifier needs to perform a DNS lookup before or during authentication. There is no central API to call — the DNS record *is* the source of truth.

For the SP record, the verifier looks up `_lwd.{domain}`.  
For the device record, it looks up `{deviceId}._lwd.{domain}` (or the user-scoped variant).

---

## Managed DNS (recommended)

Instead of managing these records manually, you can delegate `_lwd.{domain}` to LWD's nameservers:

```
_lwd.example.com   NS   {id}.ns.loginwithdomain.com
```

The `{id}` prefix is a unique token generated per signup session. It ensures that only the user who initiated the signup can complete the delegation — another user cannot intercept the process by pointing their domain to a generic nameserver address.

Once this NS delegation is in place, LWD manages the SP and device TXT records on your behalf. The underlying protocol is identical — the DNS records still exist and are publicly verifiable — but you don't have to touch them directly.

:::tip
This is the recommended setup for most users. It lets LWD handle key rotation and device record management automatically while keeping the protocol fully open.
:::

---

## Example: full DNS setup for `alice.com`

```
; SP record — points to LWD's Signing Provider
_lwd.alice.com   TXT   "v=lwd1; sp=https://sp.loginwithdomain.com"

; Device record — public key hash for alice's account
a1b2c3d4e5f6a7b8._lwd.alice.com   TXT   "v=lwd1; pk=3f2a1b4c5d6e7f8a..."
```

Or with managed DNS (single NS record instead of both TXT records):

```
_lwd.alice.com   NS   {id}.ns.loginwithdomain.com
```
