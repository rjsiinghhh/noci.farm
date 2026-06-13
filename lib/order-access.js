import crypto from 'crypto';

// Binds order viewing to the browser that created the payment. At payment-intent
// creation we set an HMAC-signed, HTTP-only cookie granting access to that PI id;
// /api/stripe-order then requires the cookie before returning order PII. This stops
// anyone who merely obtains a (non-enumerable) PaymentIntent id from reading the
// customer's name/email/address.
const ACCESS_SECRET =
  process.env.ADMIN_SECRET_KEY ||
  process.env.FEEDBACK_TOKEN_SECRET ||
  'default-secret-change-in-production';
const ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_GRANTS = 12; // keep recent orders viewable from the same browser

export const ORDER_ACCESS_COOKIE = 'order_access';

export const ORDER_ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: ACCESS_TTL_MS / 1000,
};

const sign = payloadString =>
  crypto.createHmac('sha256', ACCESS_SECRET).update(payloadString).digest('hex');

const decode = cookieValue => {
  if (!cookieValue) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(cookieValue, 'base64url').toString('utf-8'),
    );
    const { payload, signature } = decoded || {};
    if (!payload || !signature) return null;

    const expected = sign(JSON.stringify(payload));
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    if (Date.now() - (payload.ts || 0) > ACCESS_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
};

export const readGrantedPaymentIntents = request => {
  const payload = decode(request.cookies.get(ORDER_ACCESS_COOKIE)?.value);
  return Array.isArray(payload?.pis) ? payload.pis : [];
};

export const hasOrderAccess = (request, paymentIntentId) =>
  Boolean(paymentIntentId) &&
  readGrantedPaymentIntents(request).includes(paymentIntentId);

// Cookie value granting access to `paymentIntentId` plus the browser's previously
// granted (recent) PI ids, so newer purchases don't lock out older confirmations.
export const buildOrderAccessCookieValue = (request, paymentIntentId) => {
  const existing = readGrantedPaymentIntents(request);
  const pis = [
    paymentIntentId,
    ...existing.filter(id => id !== paymentIntentId),
  ].slice(0, MAX_GRANTS);
  const payload = { pis, ts: Date.now() };
  const token = { payload, signature: sign(JSON.stringify(payload)) };
  return Buffer.from(JSON.stringify(token)).toString('base64url');
};
