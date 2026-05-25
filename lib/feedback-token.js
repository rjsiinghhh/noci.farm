import crypto from 'crypto';

const TOKEN_SECRET = process.env.FEEDBACK_TOKEN_SECRET || process.env.ADMIN_SECRET_KEY || 'default-secret-change-in-production';
const TOKEN_EXPIRY_DAYS = 30;

/**
 * Generate a secure feedback token for an order
 * @param {string} orderId - The order UUID
 * @param {string} orderNumber - The order number
 * @returns {string} - Base64 encoded token
 */
export function generateFeedbackToken(orderId, orderNumber) {
  const payload = {
    orderId,
    orderNumber,
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');

  const tokenData = {
    payload,
    signature,
  };

  // Encode to base64 for URL safety
  return Buffer.from(JSON.stringify(tokenData)).toString('base64url');
}

/**
 * Verify and decode a feedback token
 * @param {string} token - The token to verify
 * @returns {object|null} - Decoded token data or null if invalid
 */
export function verifyFeedbackToken(token) {
  try {
    // Decode from base64
    const tokenString = Buffer.from(token, 'base64url').toString('utf-8');
    const tokenData = JSON.parse(tokenString);

    const { payload, signature } = tokenData;

    // Verify signature
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('Token signature mismatch');
      return null;
    }

    // Check expiry (30 days)
    const tokenAge = Date.now() - payload.timestamp;
    const expiryMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (tokenAge > expiryMs) {
      console.error('Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}





