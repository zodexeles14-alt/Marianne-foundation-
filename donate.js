document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('comprehensiveDonateForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const statusBox = document.getElementById('statusBox');
  const API_BASE_URL = 'http://localhost:5000/api/v1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const donorName = document.getElementById('donorName').value.trim();
    const donorEmail = document.getElementById('donorEmail').value.trim();
    const donorPhoneContact = document.getElementById('donorPhoneContact').value.trim();
    const donorAddress = document.getElementById('donorAddress').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const network = document.getElementById('network').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const program = document.getElementById('program').value;
    const message = document.getElementById('message').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'INITIATING PAYMENT GATEWAY...';
    statusBox.className = 'status-box pending';
    statusBox.textContent = 'Payment request sent via ObiPay. Please check your phone for the PIN prompt...';

    const idempotencyKey = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const response = await fetch(`${API_BASE_URL}/donations/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          donorName,
          donorEmail,
          donorPhoneContact,
          donorAddress,
          paymentMethod,
          accountNumber,
          network,
          phoneNumber,
          amount,
          currency: 'UGX',
          program,
          message
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment transaction.');
      }

      const reference = data.transaction.reference;
      statusBox.textContent = 'USSD Push prompt sent to your phone. Enter your PIN to complete contribution...';

      // Poll transaction status
      let attempts = 0;
      const timer = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`${API_BASE_URL}/transactions/${encodeURIComponent(reference)}?sync=true`);
          const txData = await res.json();
          if (txData.success && txData.transaction) {
            if (txData.transaction.status !== 'PENDING') {
              clearInterval(timer);
              if (txData.transaction.status === 'SUCCESS') {
                statusBox.className = 'status-box success';
                statusBox.textContent = `Thank you, ${donorName}! Contribution of UGX ${amount} received successfully. Ref: ${reference}`;
                form.reset();
              } else {
                statusBox.className = 'status-box error';
                statusBox.textContent = 'Payment failed or was cancelled on your phone. Please try again.';
              }
              submitBtn.disabled = false;
              submitBtn.textContent = 'INITIATE SECURE PAYMENT';
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
        if (attempts >= 25) {
          clearInterval(timer);
          statusBox.className = 'status-box error';
          statusBox.textContent = 'Transaction verification timed out. Check your mobile money SMS statement.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'INITIATE SECURE PAYMENT';
        }
      }, 5000);

    } catch (err) {
      statusBox.className = 'status-box error';
      statusBox.textContent = err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'INITIATE SECURE PAYMENT';
    }
  });
});
