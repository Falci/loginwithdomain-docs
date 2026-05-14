---
slug: /
sidebar_position: 1
title: Introduction
---

# Login With Domain

**Login With Domain (LWD)** is an open authentication protocol built around a simple idea: your domain is your username — one identity you own and carry everywhere.

Instead of creating a new account on every app you use, you register once with your domain and sign in to any LWD-integrated app with the same identity. `alice.com` is `alice.com` on every service, forever.

---

## How it works in one paragraph

When you register with LWD, your domain gets two DNS records: one that points to a **Signing Provider** (the server that handles authentication on your behalf), and one that stores a **public key hash** tied to your account. When an app wants to verify you, it issues a random **challenge** string. Your Signing Provider signs that challenge with your private key. Anyone can then verify the signature by checking your public key hash in DNS — no shared secret, no central authority.

---

## Key concepts

| Concept | What it means |
|---------|---------------|
| **Identity** | Your domain name (e.g. `alice.com` or `alice@company.com`) |
| **Signing Provider (SP)** | The server that performs signing on your behalf |
| **DNS Record** | Where your public key hash is published |
| **Challenge** | A random string issued per authentication attempt |
| **Signature** | Cryptographic proof that you control your domain |

---

## Why domains?

- **One identity, everywhere.** Your domain is your username across every app that supports LWD. No more "that email is already taken" or juggling dozens of accounts.
- **You own it.** A domain is yours — not tied to any platform, not subject to account termination. If you move your DNS, your identity moves with you.
- **Apps get cryptographic proof.** The optional [`validation_data`](/oauth/validation-data) in the OAuth token response lets relying parties independently verify domain ownership — no need to trust LWD's word.

---

## For end users

→ [How to sign up](/guides/signup)  
→ [How to log in](/guides/login)

## For developers

→ [Integrating OAuth](/guides/integrate-oauth)  
→ [OAuth overview](/oauth/overview)  
→ [The `validation_data` extension](/oauth/validation-data)

## Protocol deep-dive

→ [Protocol overview](/protocol/overview)  
→ [DNS records format](/protocol/dns-records)  
→ [The challenge code](/protocol/challenge-code)
