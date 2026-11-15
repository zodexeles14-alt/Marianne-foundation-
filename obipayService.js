const fetch = require('node-fetch');

const OBIPAY_BASE_URL = process.env.OBIPAY_BASE_URL || 'https://api.obpay.online/v1';
const OBIPAY_SECRET_KEY = process.env.OBIPAY_SECRET_KEY || 'sk_live_marianne_sample';

const initiateCollection = async ({ amount, phoneNumber, network, currency = 'UGX', reference, description, idempotencyKey }) => {
  try {
    const response = await fetch(`${OBIPAY_BASE_URL}/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OBIPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey })
      },
      body: JSON.stringify({
        amount,
        phone_number: phoneNumber,
        network,
        currency,
        reference,
        description
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'ObPay collection initiation failed');
    }
    return data;
  } catch (err) {
    console.error('ObPay API Error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      return {
        success: true,
        reference,
        status: 'PENDING',
        message: 'Mock ObiPay USSD push prompt sent successfully'
      };
    }
    throw err;
  }
};

const verifyTransaction = async (reference) => {
  try {
    const response = await fetch(`${OBIPAY_BASE_URL}/transactions/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OBIPAY_SECRET_KEY}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (err) {
    return null;
  }
};

module.exports = { initiateCollection, verifyTransaction };
