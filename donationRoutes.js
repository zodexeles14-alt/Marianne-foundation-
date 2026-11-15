const express = require('express');
const router = express.Router();
const db = require('../models/db');
const obipay = require('../services/obipayService');

router.post('/donations/initiate', async (req, res) => {
  try {
    const { donorName, donorEmail, donorPhoneContact, donorAddress, paymentMethod, accountNumber, phoneNumber, network, amount, currency = 'UGX', program, message } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] || `idem-${Date.now()}`;

    if (!donorName || !phoneNumber || !network || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields: donorName, phoneNumber, network, amount' });
    }

    const reference = `MF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const newTx = {
      reference,
      donorName,
      donorEmail: donorEmail || '',
      donorPhoneContact: donorPhoneContact || phoneNumber,
      donorAddress: donorAddress || '',
      paymentMethod: paymentMethod || 'ObiPay Mobile Money',
      accountNumber: accountNumber || '',
      phoneNumber,
      network,
      amount: Number(amount),
      currency,
      program: program || 'General Fund',
      message: message || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveTransaction(newTx);

    const obpayResult = await obipay.initiateCollection({
      amount: Number(amount),
      phoneNumber,
      network,
      currency,
      reference,
      description: `Marianne Foundation - ${program}`,
      idempotencyKey
    });

    res.status(201).json({
      success: true,
      message: 'Mobile money collection prompt initiated. Please check your phone.',
      transaction: newTx,
      gateway: obpayResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/transactions/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    let tx = db.getTransactionByReference(reference);

    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (tx.status === 'PENDING' && req.query.sync === 'true') {
      const liveStatus = await obipay.verifyTransaction(reference);
      if (liveStatus && liveStatus.status && liveStatus.status !== tx.status) {
        tx = db.updateTransactionStatus(reference, liveStatus.status, liveStatus);
      }
    }

    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/webhook/obipay', (req, res) => {
  try {
    const event = req.body;
    const reference = event.reference || event.data?.reference;
    const status = event.status || event.data?.status;

    if (reference && status) {
      db.updateTransactionStatus(reference, status, event);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ received: false, error: err.message });
  }
});

module.exports = router;
