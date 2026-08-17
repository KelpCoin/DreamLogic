# DreamLedger / MTG Commerce Engine

DreamLedger is the executable commerce pilot for KelpCoin's MTG market. The current production wedge is `COMMANDER-DECK-DIAGNOSTIC-001` at NZD 25, with Stripe Checkout and signed webhook proof as the payment contract.

## MTG catalog

The `/mtg` surface is a dedicated MTG-only catalog. It loads published commerce records from `/api/offers`, filters to the `MTG` silo, and renders them as a horizontal, swipeable carousel with snap scrolling.

Each sellable record can expose a secure Stripe checkout button through `/api/offer-checkout/create`. Records that are not approved for checkout remain visible but cannot be purchased.

## Current offer

`COMMANDER-DECK-DIAGNOSTIC-001`

Price: NZD 25

Customer supplies a Commander decklist. The diagnostic focuses on the biggest weaknesses, first cuts, and highest-value upgrades.

## Runtime

- Node 20+
- Express
- Stripe SDK
- QRCode
- Render target hosting
- GitHub Actions CI/CD

The deployment path is designed to verify the application before invoking the Render deployment hook. `main` is the production branch.

## Commerce contract

The MTG page is intentionally siloed. Non-MTG products and future ecosystems are excluded from `/mtg`.

Checkout uses server-side Stripe integration. The browser requests a checkout session from `/api/offer-checkout/create`; fulfillment truth comes from signed Stripe webhooks rather than from the browser return URL.

Required production configuration:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_NZ`
- `STRIPE_PRICE_US`
- `STRIPE_PRICE_EU`
- `STRIPE_PRICE_INTL`
- Render deployment hook configured in GitHub Actions

## Proof rule

No fake payment. No test transaction presented as revenue.

A first-payment proof is valid only after a signed Stripe webhook is verified and the Checkout Session is in a paid/non-unpaid state.

`Proof/Fossils/FIRST_PAYMENT_PROOF.json`

The free Render web-service filesystem is ephemeral, so a runtime fossil is not treated as durable archival evidence without a persistent sink.

## Quick verification

Local:

`npm ci && npm run build && npm run verify`

Live:

`curl https://dreamledger.org/healthz`

`curl https://dreamledger.org/api/offers`

`curl -X POST https://dreamledger.org/api/offer-checkout/create -H "Content-Type: application/json" -d '{"offer_id":"COMMANDER-DECK-DIAGNOSTIC-001","region":"NZ"}'`

Before production Stripe secrets and regional price IDs are configured, checkout may correctly return HTTP 503. That is a configuration gate, not simulated revenue.

## Canonical doorway

`https://qr.dreamledger.org/DL1`

The QR doorway routes to the appropriate regional commerce surface while retaining one canonical entry point.

## Deployment

Render is the current execution host. GitHub Actions verifies the repository before calling the configured Render deployment hook. The production health check is `/healthz`; build command is `npm run build`; start command is `npm start`.

## Commercial truth

Repository code is not revenue. A reachable checkout is not a payment. Revenue remains NZD 0 until an independently verified Stripe payment receipt exists.

The immediate objective is simple: populate the MTG catalog with real sellable EDH inventory, prove checkout, capture the first verified payment, then scale distribution from evidence.
