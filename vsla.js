document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vslaForm');
  if (!form) return;

  const submitBtn = document.getElementById('vslaSubmitBtn');
  const statusBox = document.getElementById('vslaStatusBox');
  const API_BASE_URL = 'https://marianne-backend.onrender.com/api/v1';
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const memberName = document.getElementById('memberName').value.trim();
    const memberEmail = document.getElementById('memberEmail').value.trim();
    const groupName = document.getElementById('groupName').value;
    const contributionType = document.getElementById('contributionType').value;
    const network = document.getElementById('network').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const amount = document.getElementById('amount').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'INITIATING MOBILE MONEY...';
    statusBox.className = 'status-box pending';
    statusBox.textContent = 'Please check your phone for the Mobile Money PIN prompt...';

    const idempotencyKey = `vsla-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const response = await fetch(`${API_BASE_URL}/donations/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          donorName: `${memberName} (${groupName})`,
          donorEmail: memberEmail,
          phoneNumber,
          network,
          amount,
          currency: 'UGX',
          program: `VSLA - ${contributionType}`,
          message: `Group: ${groupName}`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate contribution');
      }

      const reference = data.transaction.reference;
      statusBox.textContent = 'Payment prompt sent! Enter your PIN on your phone. Waiting for confirmation...';

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
                statusBox.textContent = `Thank you, ${memberName}! UGX ${amount} successfully contributed to ${groupName}.`;
                form.reset();
              } else {
                statusBox.className = 'status-box error';
                statusBox.textContent = 'Payment failed or was cancelled on your phone.';
              }
              submitBtn.disabled = false;
              submitBtn.textContent = 'CONTRIBUTE VIA MOBILE MONEY';
            }
          }
        } catch (err) {
          console.error(err);
        }
        if (attempts >= 20) {
          clearInterval(timer);
          submitBtn.disabled = false;
          submitBtn.textContent = 'CONTRIBUTE VIA MOBILE MONEY';
        }
      }, 5000);

    } catch (err) {
      statusBox.className = 'status-box error';
      statusBox.textContent = err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'CONTRIBUTE VIA MOBILE MONEY';
    }
  });
});
