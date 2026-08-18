# DreamLedger / BEC-PRIME Commerce Engine

DreamLedger is an evidence-first commerce engine with isolated product silos, a canonical doorway, server-side checkout, and explicit payment proof. The repository contains the shared commerce substrate plus separate Dreamiez, B2B Marketplace, Kelplantis, and MTG surfaces.

## What this repository does

- Provides a neutral DreamLedger front door at `/`.
- Provides Dreamiez at `/dreamiez/` with its own asset and reward boundary.
- Provides the B2B Marketplace at `/marketplace.html` with authenticated seller intake and approval-gated listings.
- Provides Kelplantis as a separate shared-world asset destination.
- Provides MTG at `/mtg.html` as an isolated commerce silo.
- Provides a canonical QR doorway at `https://qr.dreamledger.org/DL1`.
- Provides server-side Stripe Checkout and signed webhook verification where a silo has an approved payment contract.
- Records payment proof only from verified live Stripe events.

## Silo boundary

Each economic surface declares its silo explicitly. The neutral front door may link to independent silos, but silo-specific catalogues, checkout routes, approval rules, and economic claims must not leak between them.

MTG is one isolated pilot, not the definition of DreamLedger. Its current offer is `COMMANDER-DECK-DIAGNOSTIC-001` at NZD 25. No EDH inventory is fabricated when no real records exist.

## B2B Marketplace

The B2B surface exposes only B2B listings and provides authenticated seller intake. New submissions enter `PENDING_APPROVAL` and remain non-public and non-checkoutable until an explicit approval process changes their state.

## Dreamiez

Dreamiez is an isolated avatar and cosmetic surface. Its current reward loop is cosmetic-only and local to the browser. It does not expose MTG checkout or B2B intake routes.

## Runtime

- Node 20+
- Express
- Stripe SDK
- QRCode
- Render target hosting
- GitHub Actions CI/CD

The production branch is `main`. The build is `npm run build` and the server starts with `npm start`.

## Commerce and proof contract

Checkout availability is a configuration and approval state, not evidence of revenue. A browser return from Stripe is not a payment proof. A first-payment Fossil is valid only after a signed live Stripe webhook is verified and the Checkout Session is in a paid state.

`Proof/Fossils/FIRST_PAYMENT_PROOF.json`

The free Render filesystem is ephemeral. A runtime Fossil is therefore runtime evidence, not durable archival evidence, unless a persistent sink is configured.

## Quick verification

Local:

`npm ci && npm run build && npm run verify`

Live:

`curl https://dreamledger.org/healthz`

`curl https://dreamledger.org/api/offers`

`curl https://dreamledger.org/api/marketplace/catalog`

Before the required production secrets are configured, a checkout endpoint may correctly return HTTP 503. That is a configuration gate, not simulated revenue.

## Canonical doorway

`https://qr.dreamledger.org/DL1`

The QR doorway provides one canonical entry point while routing visitors into the appropriate isolated surface.

## Deployment

Render is the current execution host. GitHub Actions verifies the repository before invoking the configured deployment path. The production health check is `/healthz`.

## Commercial truth

Repository code is not revenue. A reachable page is not a sale. A checkout URL is not a payment. Revenue remains NZD 0 until an independently verified live Stripe payment event exists.

External distribution remains approval-gated. No public launch is implied by this repository state.
