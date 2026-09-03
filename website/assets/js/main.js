/**
 * HYGEIA POWER WASH SOLUTIONS — MASTER SCRIPT
 * Interactive Before/After Sliders, Mobile Nav, Accordions & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Modern Mobile Menu Drawer & Overlay Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');

  function toggleMobileMenu(forceClose = false) {
    if (!mobileToggle) return;
    
    // Check if drawer exists (modern header) or fallback to navMenu
    const drawer = mobileNavDrawer || document.querySelector('.nav-menu');
    if (!drawer) return;

    const isCurrentlyOpen = drawer.classList.contains('open');
    if (forceClose || isCurrentlyOpen) {
      drawer.classList.remove('open');
      mobileToggle.classList.remove('open');
      if (mobileOverlay) mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('open');
      mobileToggle.classList.add('open');
      if (mobileOverlay) mobileOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => toggleMobileMenu(true));
  }

  // Close drawer when clicking any link inside it
  const allNavLinks = document.querySelectorAll('.mobile-nav-link, .nav-menu a, .mobile-cta-wrap a');
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  // 2. Interactive Before / After Split Slider
  const sliderContainers = document.querySelectorAll('.ba-slider-container');
  sliderContainers.forEach(container => {
    const afterLayer = container.querySelector('.ba-after-layer');
    const overlayImg = container.querySelector('.ba-img-overlay');
    const handle = container.querySelector('.ba-handle');
    if (!afterLayer || !handle) return;

    const updateOverlayWidth = () => {
      if (overlayImg) {
        overlayImg.style.width = `${container.offsetWidth}px`;
      }
    };

    updateOverlayWidth();
    window.addEventListener('resize', updateOverlayWidth);

    let isDragging = false;

    const setSliderPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      afterLayer.style.width = `${percentage}%`;
      handle.style.left = `${percentage}%`;
    };

    // Mouse Events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });
    window.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mousemove', (e) => {
      if (isDragging) setSliderPosition(e.clientX);
    });
    container.addEventListener('click', (e) => setSliderPosition(e.clientX));

    // Touch Events
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
    }, { passive: true });
    window.addEventListener('touchend', () => isDragging = false);
    container.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) {
        setSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });
  });

  // 3. Interactive FAQ Accordions
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      // Optional: close siblings
      faqCards.forEach(c => {
        if (c !== card) c.classList.remove('open');
      });
      card.classList.toggle('open', !isOpen);
    });
  });

  // 4. Hero Interactive Bin Subscription Quick Booking Widget (Only for pages with bin widget)
  const bookingWidget = document.querySelector('.hero-bin .hero-booking-card, .hero-booking-card:has(.plan-toggle-btn)') || 
                        (document.querySelector('.hero-booking-card') && document.querySelector('.hero-booking-card').querySelector('.plan-toggle-btn') ? document.querySelector('.hero-booking-card') : null);
  if (bookingWidget && bookingWidget.querySelector('.plan-toggle-btn')) {
    let currentPlan = 'monthly'; // 'monthly' ($35 base for 2 bins) or 'onetime' ($65 base for 2 bins)
    let binCount = 2;

    const planBtns = bookingWidget.querySelectorAll('.plan-toggle-btn');
    const binMinusBtn = bookingWidget.querySelector('.btn-bin-minus');
    const binPlusBtn = bookingWidget.querySelector('.btn-bin-plus');
    const binValSpan = bookingWidget.querySelector('.counter-value');
    const priceVal = bookingWidget.querySelector('.booking-price-val');
    const pricePeriod = bookingWidget.querySelector('.booking-price-period');
    const includesText = bookingWidget.querySelector('.booking-includes-text');
    const submitBtn = bookingWidget.querySelector('.booking-submit-btn');

    const updatePrice = () => {
      const basePrice = currentPlan === 'monthly' ? 35 : 65;
      const extraBins = Math.max(0, binCount - 2);
      const totalPrice = basePrice + (extraBins * 10);

      if (priceVal) priceVal.textContent = `$${totalPrice}`;
      if (pricePeriod) pricePeriod.textContent = currentPlan === 'monthly' ? '/ month' : 'one-time';
      if (binValSpan) binValSpan.textContent = binCount;
      if (includesText) {
        includesText.textContent = extraBins > 0
          ? `✓ 2 Bins included + ${extraBins} extra ($10/ea)`
          : `✓ 2 Bins included in base price`;
      }
      if (submitBtn) {
        submitBtn.textContent = currentPlan === 'monthly'
          ? `Start My $${totalPrice}/mo Subscription →`
          : `Book $${totalPrice} One-Time Wash →`;
      }
    };

    planBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        planBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPlan = btn.dataset.plan || 'monthly';
        updatePrice();
      });
    });

    if (binMinusBtn) {
      binMinusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (binCount > 1) {
          binCount--;
          updatePrice();
        }
      });
    }

    if (binPlusBtn) {
      binPlusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (binCount < 10) {
          binCount++;
          updatePrice();
        }
      });
    }

    updatePrice();
  }

  // 5. Contact Form File Upload Drag & Drop Preview
  const fileInput = document.querySelector('input[type="file"]');
  const fileDropZone = document.querySelector('.file-upload-zone');
  const fileListPreview = document.querySelector('.file-list-preview');

  if (fileInput && fileDropZone) {
    const handleFiles = (files) => {
      if (!files || files.length === 0) return;
      if (fileListPreview) {
        fileListPreview.innerHTML = '';
        Array.from(files).forEach(file => {
          const sizeKb = (file.size / 1024).toFixed(1);
          const item = document.createElement('div');
          item.innerHTML = `📎 <strong>${file.name}</strong> (${sizeKb} KB)`;
          fileListPreview.appendChild(item);
        });
      }
    };

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
      });
    });

    fileDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        fileInput.files = e.dataTransfer.files;
        handleFiles(e.dataTransfer.files);
      }
    });
  }

  // 6. Cookie Consent Banner
  const cookieBanner = document.querySelector('.cookie-banner');
  if (cookieBanner) {
    const consent = localStorage.getItem('hygeia_cookie_consent');
    if (!consent) {
      setTimeout(() => {
        cookieBanner.classList.add('show');
      }, 1000);
    }

    const acceptBtn = cookieBanner.querySelector('.cookie-btn-accept');
    const declineBtn = cookieBanner.querySelector('.cookie-btn-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('hygeia_cookie_consent', 'accepted');
        cookieBanner.classList.remove('show');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('hygeia_cookie_consent', 'declined');
        cookieBanner.classList.remove('show');
      });
    }
  }

  // 7. Commercial Service Pop-Out Modal Controller
  const commCards = document.querySelectorAll('.comm-service-card');
  const commModal = document.querySelector('.comm-modal-overlay');

  if (commCards.length > 0 && commModal) {
    const modalCloseBtn = commModal.querySelector('.comm-modal-close-btn');
    const modalHeroImg = commModal.querySelector('.comm-modal-hero-img');
    const modalBadge = commModal.querySelector('.comm-modal-hero-badge');
    const modalTitle = commModal.querySelector('.comm-modal-hero-overlay h2');
    const modalPsi = commModal.querySelector('[data-spec="psi"]');
    const modalTemp = commModal.querySelector('[data-spec="temp"]');
    const modalReclaim = commModal.querySelector('[data-spec="reclaim"]');
    const modalSpeed = commModal.querySelector('[data-spec="speed"]');
    const modalDesc = commModal.querySelector('.comm-modal-body-text');
    const modalProcess = commModal.querySelector('.comm-modal-process-text');
    const modalCompliance = commModal.querySelector('.comm-modal-compliance-text');
    const modalTags = commModal.querySelector('.comm-modal-tags');
    const modalQuoteBtn = commModal.querySelector('.comm-modal-quote-btn');

    const openModal = (card) => {
      const data = card.dataset;
      if (modalHeroImg) modalHeroImg.src = data.img || '';
      if (modalBadge) modalBadge.textContent = data.badge || 'Commercial Specification';
      if (modalTitle) modalTitle.textContent = data.title || '';
      if (modalPsi) modalPsi.textContent = data.psi || '3,500 PSI';
      if (modalTemp) modalTemp.textContent = data.temp || '200°F Hot Water';
      if (modalReclaim) modalReclaim.textContent = data.reclaim || '100% Vacuum Boom';
      if (modalSpeed) modalSpeed.textContent = data.speed || 'Overnight Dispatch';
      if (modalDesc) modalDesc.innerHTML = data.desc || '';
      if (modalProcess) modalProcess.innerHTML = data.process || '';
      if (modalCompliance) modalCompliance.innerHTML = data.compliance || '';
      if (modalQuoteBtn) {
        modalQuoteBtn.href = `contact.html?service=${encodeURIComponent(data.title || 'commercial')}`;
      }

      if (modalTags && data.tags) {
        modalTags.innerHTML = '';
        const tagsArr = data.tags.split(',');
        tagsArr.forEach(t => {
          const span = document.createElement('span');
          span.className = 'comm-modal-tag';
          span.textContent = `✓ ${t.trim()}`;
          modalTags.appendChild(span);
        });
      }

      commModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      commModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    commCards.forEach(card => {
      card.addEventListener('click', () => openModal(card));
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
      });
    }

    commModal.addEventListener('click', (e) => {
      if (e.target === commModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && commModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 8. Commercial Hero Facility Selector Logic
  const commHeroWidget = document.querySelector('.hero-commercial .hero-booking-card');
  if (commHeroWidget) {
    const facilityChips = commHeroWidget.querySelectorAll('.chip-btn');
    const facilityInput = commHeroWidget.querySelector('input[name="facility_type"]');
    const submitBtn = commHeroWidget.querySelector('.booking-submit-btn');

    const buttonLabels = {
      'office': 'Request Office & Tech Park RFP →',
      'garage': 'Request Parking Garage Site Walk →',
      'retail': 'Request Retail Center Cleaning RFP →',
      'dumpster': 'Request Dumpster Pad Degreasing Quote →'
    };

    facilityChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        facilityChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const fType = chip.dataset.type || 'office';
        if (facilityInput) facilityInput.value = fType;
        if (submitBtn && buttonLabels[fType]) {
          submitBtn.textContent = buttonLabels[fType];
        }
      });
    });
  }

  // 9. Residential Hero Surface Selector Logic
  const resHeroWidget = document.querySelector('.hero-residential .hero-booking-card');
  if (resHeroWidget) {
    const resChips = resHeroWidget.querySelectorAll('.chip-btn');
    const surfaceInput = resHeroWidget.querySelector('input[name="surfaces"]');
    const submitBtn = resHeroWidget.querySelector('.booking-submit-btn');

    resChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        chip.classList.toggle('active');
        const activeChips = Array.from(resChips).filter(c => c.classList.contains('active'));
        const selected = activeChips.map(c => c.dataset.surface || c.textContent.trim());
        
        if (surfaceInput) surfaceInput.value = selected.join(', ');
        if (submitBtn) {
          if (activeChips.length === 0) {
            submitBtn.textContent = 'Request Free Home Wash Estimate →';
          } else if (activeChips.length === 1) {
            submitBtn.textContent = `Get Estimate for ${selected[0]} →`;
          } else {
            submitBtn.textContent = `Get Estimate for ${activeChips.length} Surfaces →`;
          }
        }
      });
    });
  }
});
