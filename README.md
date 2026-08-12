# DreamLedger / BEC-PRIME first-payment engine

This repository is the executable pilot for one economic experiment: get COMMANDER-DECK-DIAGNOSTIC-001 through real Stripe Checkout, observe a signed payment webhook, and write FIRST_PAYMENT_PROOF.json.

## Runtime

Node 20+, Express, Stripe SDK and QRCode. Render is the target web host. Render can auto-deploy from GitHub when the service is connected to the repository. The repository also has a GitHub Actions verification workflow.

## Canonical QR

The one physical doorway is:

`https://qr.dreamledger.org/DL1`

The server routes the code to NZ, US, EU or INTL and detects the preferred browser language. Country detection uses the configured `GEO_COUNTRY_HEADER` when a proxy supplies it, then falls back to Accept-Language. For production geo accuracy, put the domain behind a proxy that supplies a country header such as Cloudflare's CF-IPCountry.

QR PNG: `/api/qr/DL1.png`
QR metadata: `/api/qr/generate`

## Offer

`COMMANDER-DECK-DIAGNOSTIC-001` is the current MTG pilot. NZ price is NZD 25. The server supports regional Stripe Price IDs so checkout can be localized without changing the QR code.

## Required Render secrets

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_NZ`
- `STRIPE_PRICE_US`
- `STRIPE_PRICE_EU`
- `STRIPE_PRICE_INTL`

Set the Stripe webhook endpoint to `/api/stripe/webhook` and subscribe to `checkout.session.completed`. If delayed payment methods are enabled, also handle `checkout.session.async_payment_succeeded`.

Stripe Checkout Sessions produce the hosted checkout URL, and Stripe recommends server-side webhooks for fulfillment rather than trusting the browser return URL.

## Proof rule

No fake payment. No test transaction presented as revenue. A Fossil is written only after the signed Stripe webhook is verified and the Checkout Session has a non-unpaid payment state.

`Proof/Fossils/FIRST_PAYMENT_PROOF.json`

The free Render web-service filesystem is ephemeral. Therefore this file is a live runtime artifact, not durable storage on the free tier. For durable production evidence, add a persistent datastore or a controlled Fossil sink before treating the remote filesystem as archival.

## 60-second verification

Local:

`npm ci && npm run build && npm run verify`

Live:

`curl https://dreamledger.org/healthz`

`curl https://dreamledger.org/api/offers`

`curl -X POST https://dreamledger.org/api/offer-checkout/create -H "Content-Type: application/json" -d '{"offer_id":"COMMANDER-DECK-DIAGNOSTIC-001","region":"NZ"}'`

Before the first live payment, a 503 from checkout is expected until the Stripe secret and regional price IDs are configured. That is an explicit configuration gate, not a simulated success.

## Deployment

Render: connect `KelpCoin/DreamLogic`, branch `main`, enable Auto-Deploy, and use `render.yaml`. Health check is `/healthz`. Build is `npm run build`. Start is `npm start`.

Do not merge this pilot into `main` until the production configuration and payment surface have been manually checked. The current implementation is on an agent branch and is intended for a draft PR review.
