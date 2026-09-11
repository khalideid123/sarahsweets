(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const modal = document.querySelector('[data-order-modal]');
  const openButtons = document.querySelectorAll('[data-open-order]');
  const closeButtons = document.querySelectorAll('[data-close-order]');
  const occasionButtons = document.querySelectorAll('[data-occasion]');
  const orderForm = document.querySelector('#order-form');
  const preview = document.querySelector('[data-order-preview]');
  const copyButton = document.querySelector('[data-copy-brief]');
  const copyStatus = document.querySelector('[data-copy-status]');
  const occasionSelect = document.querySelector('#occasion');

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const willOpen = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
  });

  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  let lastFocused = null;
  const getFocusable = () => modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])');

  const buildBrief = () => {
    const data = new FormData(orderForm);
    const occasion = data.get('occasion') || 'Not selected yet';
    const date = data.get('date') || 'Flexible / not set';
    const quantity = data.get('quantity') || 'Not sure yet';
    const idea = (data.get('idea') || '').trim() || "Open to Sarah's suggestions";
    return [
      "Hi Sarah! I'd love to ask about a custom order.",
      '',
      `Occasion: ${occasion}`,
      `Event date: ${date}`,
      `Approx. quantity: ${quantity}`,
      `Ideas / details: ${idea}`
    ].join('\n');
  };

  const updateOrderPreview = () => {
    const hasInput = [...new FormData(orderForm).values()].some(value => String(value).trim());
    preview.textContent = hasInput ? buildBrief() : 'Your order brief will appear here as you add details.';
  };

  const openModal = (occasion = '') => {
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (occasion) occasionSelect.value = occasion;
    updateOrderPreview();
    requestAnimationFrame(() => getFocusable()[0]?.focus());
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    copyStatus.textContent = '';
    lastFocused?.focus();
  };

  openButtons.forEach(button => button.addEventListener('click', () => { closeMenu(); openModal(); }));
  closeButtons.forEach(button => button.addEventListener('click', closeModal));
  occasionButtons.forEach(button => button.addEventListener('click', () => openModal(button.dataset.occasion)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    if (event.key === 'Tab' && modal.classList.contains('open')) {
      const focusable = [...getFocusable()];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  orderForm.addEventListener('input', updateOrderPreview);
  orderForm.addEventListener('change', updateOrderPreview);

  copyButton.addEventListener('click', async () => {
    const brief = buildBrief();
    try {
      await navigator.clipboard.writeText(brief);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = brief;
      helper.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    copyStatus.textContent = 'Copied — paste this into your Instagram message to Sarah.';
    copyButton.textContent = 'Copied!';
    setTimeout(() => copyButton.textContent = 'Copy order brief', 1800);
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 4) * 65, 195)}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  document.querySelectorAll('.faq-list details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
