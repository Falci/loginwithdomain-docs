---
sidebar_position: 6
title: Cryptography
---

# Cryptography

LWD's authentication proofs rely on two well-established primitives: **Ed25519** for signing and **SHA-256** for the public key fingerprint stored in DNS.

---

## Key pair

Each registered identity has an Ed25519 key pair. The LWD Signing Provider holds and uses the key pair on the user's behalf.

- The **public key** is 32 bytes (64 hex characters).
- Only the **SHA-256 hash** of the public key is published in DNS — never the key itself.

---

## Public key hash

The device record stores:

```
pk = SHA-256(public_key)   → 32 bytes → 64 hex characters
```

This hash is what gets written to the DNS TXT record:

```
v=lwd1; pk=3f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2
```

Storing the hash rather than the raw public key means:
- DNS records are compact.
- You can verify a presented public key without trusting any intermediary: compute the hash and compare.

---

## Signing

To sign a challenge, the SP computes an Ed25519 signature over the raw UTF-8 bytes of the challenge string:

```
signature = Ed25519.sign(UTF-8(challenge), privateKey)
```

The result is 64 bytes, hex-encoded (128 hex characters).

---

## Verification

Anyone can verify independently:

```
Ed25519.verify(UTF-8(challenge), signature, publicKey)
AND
SHA-256(publicKey) == pk_from_dns
```

Both checks must pass. The first confirms the signature is valid for the presented key. The second confirms the key is the one registered in DNS — not a key the attacker generated themselves.

---

## Device ID

Each identity can have **one or more device IDs** — one per registered device or passkey. Each device has its own key pair, its own device record in DNS, and its own 16-character hex device ID. The SP manages device IDs for each identity.

The device ID appears in:
- The name of the DNS device record (`{deviceId}._lwd.{domain}`)
- The `device_id` parameter returned by the SP
- The `fqdn` field in [`validation_data`](/oauth/validation-data) (after the `#`)

---

## Algorithm summary

| Purpose | Algorithm |
|---------|-----------|
| Signing | Ed25519 |
| Public key fingerprint | SHA-256 |
| Device ID derivation | SHA-256 (deterministic, first 16 hex chars) |
