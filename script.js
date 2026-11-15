document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-links > a');
  const modal = document.getElementById('donateModal');
  const modalTriggers = document.querySelectorAll('[data-modal="donateModal"]');
  const closeModalBtn = document.getElementById('closeModal');
  const supportForm = document.getElementById('supportForm');
  const formFeedback = document.getElementById('formFeedback');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile navigation toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Active link highlight & close mobile drawer on click
  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      navItems.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      navLinks.classList.remove('open');
    });
  });

  // Open Support / Get Involved modal
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  // Close modal helper
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Interactive form submission feedback
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullName').value.trim();
      const interest = document.getElementById('interestType');
      const selectedLabel = interest.options[interest.selectedIndex].text;

      formFeedback.textContent = `Thank you, ${name}! We have received your inquiry regarding "${selectedLabel}" and will reach out shortly.`;
      supportForm.reset();

      setTimeout(() => {
        formFeedback.textContent = '';
        closeModal();
      }, 3200);
    });
  }
});
