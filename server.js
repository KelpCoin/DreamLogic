const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const QRCode = require('qrcode');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const ROOT = __dirname;
const PROOF_ROOT = process.env.PROOF_ROOT || path.join(ROOT, 'Proof', 'Fossils');
const LOG_ROOT = process.env.LOG_ROOT || path.join(ROOT, 'Proof', 'Scans');
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://dreamledger.org').replace(/\/$/, '');
const QR_BASE_DOMAIN = (process.env.QR_BASE_DOMAIN || 'https://qr.dreamledger.org').replace(/\/$/, '');
const QR_CODE = process.env.QR_CODE || 'DL1';
const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
const DEFAULT_COUNTRY = process.env.DEFAULT_COUNTRY || 'NZ';
const GEO_COUNTRY_HEADER = (process.env.GEO_COUNTRY_HEADER || 'cf-ipcountry').toLowerCase();

const offers = {
  'COMMANDER-DECK-DIAGNOSTIC-001': {
    id: 'COMMANDER-DECK-DIAGNOSTIC-001', name: 'Commander Deck Diagnostic',
    prices: { NZ: { currency: 'nzd', amount: 25 }, US: { currency: 'usd', amount: 15 }, EU: { currency: 'eur', amount: 14 }, INTL: { currency: 'usd', amount: 15 } },
    status: 'published', checkout_available: false, approval_required: true, silo: 'MTG', gauntlet_status: 'PASS'
  }
};

const languageMap = {
  en: { hero: 'A verified commerce doorway, not a generic storefront', sub: 'Discover isolated worlds. Enter a silo. Trust the evidence.', cta: 'Enter the catalogue', proof: 'Evidence first. Claims second.' },
  es: { hero: 'Una puerta comercial verificable, no una tienda generica', sub: 'Descubre mundos aislados. Entra en un silo. Confia en la evidencia.', cta: 'Entrar al catalogo', proof: 'Primero evidencia. Despues afirmaciones.' },
  fr: { hero: 'Une porte commerciale verifiable, pas une vitrine generique', sub: 'Decouvrez des mondes isoles. Entrez dans un silo. Faites confiance aux preuves.', cta: 'Entrer dans le catalogue', proof: 'Les preuves avant les affirmations.' },
  de: { hero: 'Ein verifizierter Commerce-Eingang, kein generischer Shop', sub: 'Isolierte Welten entdecken. Ein Silo betreten. Beweisen vertrauen.', cta: 'Katalog betreten', proof: 'Erst Beweise. Dann Behauptungen.' },
  ja: { hero: '一般的な店舗ではなく、検証可能なコマース入口', sub: '独立した世界を発見し、サイロに入り、証拠を確認します。', cta: 'カタログへ', proof: '証拠を先に。主張は後に。' },
  'zh-CN': { hero: '可验证的商业入口，而不是普通商店', sub: '发现隔离世界，进入独立领域，以证据为准。', cta: '进入目录', proof: '证据优先，主张随后。' },
  'zh-TW': { hero: '可驗證的商業入口，而不是普通商店', sub: '探索隔離世界，進入獨立領域，以證據為準。', cta: '進入目錄', proof: '證據優先，主張隨後。' }
};

function ensureDirs() { fs.mkdirSync(PROOF_ROOT, { recursive: true }); fs.mkdirSync(LOG_ROOT, { recursive: true }); }
function cleanLang(value) { const v = String(value || '').trim(); if (languageMap[v]) return v; const base = v.toLowerCase().split('-')[0]; return Object.keys(languageMap).find(k => k.toLowerCase() === base) || DEFAULT_LANGUAGE; }
function detectCountry(req) { const direct = String(req.headers[GEO_COUNTRY_HEADER] || '').toUpperCase(); if (/^[A-Z]{2}$/.test(direct)) return direct; const accept = String(req.headers['accept-language'] || '').toLowerCase(); if (accept.includes('en-nz')) return 'NZ'; if (accept.includes('en-us')) return 'US'; if (accept.includes('fr-') || accept.includes('de-')) return 'EU'; return DEFAULT_COUNTRY; }
function detectLanguage(req) { return cleanLang(req.query.lang || String(req.headers['accept-language'] || '').split(',')[0]); }
function regionFor(country) { if (country === 'NZ') return 'NZ'; if (country === 'US') return 'US'; if (['AT','BE','CY','DE','DK','ES','FI','FR','GR','IE','IT','LU','MT','NL','PT','SI','SK'].includes(country)) return 'EU'; return 'INTL'; }
function money(region) { return offers['COMMANDER-DECK-DIAGNOSTIC-001'].prices[region]; }
function logScan(row) { ensureDirs(); const file = path.join(LOG_ROOT, `${new Date().toISOString().slice(0,10)}.jsonl`); fs.appendFileSync(file, JSON.stringify(row) + '\n', 'utf8'); }

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) return res.status(503).send('Stripe webhook is not configured');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event; try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.payment_status !== 'unpaid' || event.type === 'checkout.session.async_payment_succeeded') {
      ensureDirs();
      const fossil = { schema_version: 'BEC-FOSSIL-1.0', event: event.type, asset_id: session.metadata?.offer_id || session.client_reference_id || 'UNKNOWN', evidence_level: 1, status: 'PASS', amount: session.amount_total, currency: session.currency, transaction_id: session.id, payment_intent_id: session.payment_intent || null, timestamp_utc: new Date().toISOString() };
      fs.writeFileSync(path.join(PROOF_ROOT, 'FIRST_PAYMENT_PROOF.json'), JSON.stringify(fossil, null, 2) + '\n', 'utf8');
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '1mb' }));
app.use('/static', express.static(path.join(ROOT, 'public')));
app.get('/healthz', (req,res) => res.status(200).json({ status: 'ok', service: 'dreamledger', time_utc: new Date().toISOString() }));
app.get('/api/offers', (req,res) => res.json(Object.values(offers)));
app.get('/api/shared-assets/schema', (req,res) => res.sendFile(path.join(ROOT, 'assets', 'shared-asset-schema.json')));
app.get('/api/qr/:code/stats', (req,res) => res.json({ code: req.params.code, note: 'Scan logs are local to this service unless an external sink is configured.' }));
app.get('/api/proof/first-payment', (req,res) => { const file = path.join(PROOF_ROOT, 'FIRST_PAYMENT_PROOF.json'); if (!fs.existsSync(file)) return res.status(404).json({ status: 'NOT_FOUND', evidence: 'No live payment fossil has been observed.' }); res.type('application/json').send(fs.readFileSync(file, 'utf8')); });

async function qrResponse(req,res) { const url = `${QR_BASE_DOMAIN}/${encodeURIComponent(QR_CODE)}`; const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 2, width: 1200 }); res.json({ code: QR_CODE, canonical_url: url, data_url: dataUrl }); }
app.get('/api/qr/generate', qrResponse); app.post('/api/qr/generate', qrResponse);
app.get('/api/qr/:code.png', async (req,res) => { if (req.params.code !== QR_CODE) return res.status(404).end(); const url = `${QR_BASE_DOMAIN}/${encodeURIComponent(QR_CODE)}`; res.type('png').send(await QRCode.toBuffer(url, { errorCorrectionLevel: 'H', margin: 2, width: 1200 })); });

app.get('/qr/:code', (req,res) => { if (req.params.code !== QR_CODE) return res.status(404).send('Unknown QR code'); const country = detectCountry(req), language = detectLanguage(req), region = regionFor(country); const destination = `${BASE_URL}/${region.toLowerCase()}?lang=${encodeURIComponent(language)}`; try { logScan({ code: QR_CODE, scan_time: new Date().toISOString(), country, city: req.headers['x-city'] || null, region, language, user_agent: req.get('user-agent') || '', destination_url: destination }); } catch (_) {} res.redirect(302, destination); });

app.get('/:region', (req,res,next) => { const region = String(req.params.region || '').toUpperCase(); if (!['NZ','US','EU','INTL'].includes(region)) return next(); const language = detectLanguage(req), t = languageMap[language] || languageMap.en, p = money(region); const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/__DL_HERO__/g, t.hero).replace(/__DL_SUB__/g, t.sub).replace(/__DL_CTA__/g, t.cta).replace(/__DL_PROOF__/g, t.proof).replace(/__DL_REGION__/g, region).replace(/__DL_PRICE__/g, `${p.currency.toUpperCase()} ${p.amount}`).replace(/__DL_LANG__/g, language); res.set('Content-Language', language).send(html); });

app.post('/api/offer-checkout/create', async (req,res) => { try { const offerId = String(req.body?.offer_id || ''), offer = offers[offerId]; if (!offer) return res.status(404).json({ error: 'unknown_offer' }); if (offer.approval_required || !offer.checkout_available) return res.status(403).json({ error: 'offer_not_approved', message: 'Checkout is disabled until the offer is explicitly approved.' }); if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'stripe_not_configured' }); const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY), requested = String(req.body?.region || '').toUpperCase(); const region = ['NZ','US','EU','INTL'].includes(requested) ? requested : regionFor(String(req.body?.country || DEFAULT_COUNTRY).toUpperCase()); const priceKey = `STRIPE_PRICE_${region}`, priceId = process.env[priceKey]; if (!priceId) return res.status(503).json({ error: 'price_not_configured', region, required_env: priceKey }); const session = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price: priceId, quantity: 1 }], client_reference_id: offerId, metadata: { offer_id: offerId, silo: offer.silo, region }, success_url: `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${BASE_URL}/${region.toLowerCase()}?cancelled=1` }); res.json({ url: session.url, session_id: session.id, offer_id: offerId, region }); } catch (err) { console.error(err); res.status(500).json({ error: 'checkout_create_failed', message: 'Checkout session creation failed.' }); } });

app.use((req,res,next) => { if (req.path === '/' || req.path === '/index.html') return res.sendFile(path.join(ROOT, 'index.html')); const pages = ['/audits.html','/proofs.html','/success.html','/ip.html','/engine.html','/revenue.html','/register.html','/dreamiez/register.html','/dreamiez/login.html']; if (pages.includes(req.path)) return res.sendFile(path.join(ROOT, req.path.slice(1))); next(); });
app.use((req,res) => res.status(404).send('Not found'));
app.listen(PORT, () => console.log(`DreamLedger listening on ${PORT}`));
