with open('website/experience.html', 'r', encoding='utf-8') as f:
    content = f.read()

interactive_scripts = """
    // =========================================================================
    // MOBILE DRAWER TOGGLE
    // =========================================================================
    window.toggleDrawer = function() {
      const drawer = document.getElementById('mobileDrawer');
      if (drawer) drawer.classList.toggle('open');
    };

    // Close drawer when clicking any drawer link
    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        const drawer = document.getElementById('mobileDrawer');
        if (drawer) drawer.classList.remove('open');
      });
    });

    // =========================================================================
    // 3-TAB INTERACTIVE CALCULATOR ENGINE
    // =========================================================================
    let currentBinCount = 2;

    window.switchCalc = function(type) {
      const tabBtns = document.querySelectorAll('.calc-tab-btn');
      tabBtns.forEach(btn => btn.classList.remove('active'));
      const pBin = document.getElementById('calcPanelBin');
      const pRes = document.getElementById('calcPanelRes');
      const pComm = document.getElementById('calcPanelComm');

      if (pBin) pBin.classList.remove('active');
      if (pRes) pRes.classList.remove('active');
      if (pComm) pComm.classList.remove('active');

      if (type === 'bin') {
        if (tabBtns[0]) tabBtns[0].classList.add('active');
        if (pBin) pBin.classList.add('active');
      } else if (type === 'residential') {
        if (tabBtns[1]) tabBtns[1].classList.add('active');
        if (pRes) pRes.classList.add('active');
        updateResPrice();
      } else if (type === 'commercial') {
        if (tabBtns[2]) tabBtns[2].classList.add('active');
        if (pComm) pComm.classList.add('active');
        updateCommPrice();
      }
    };

    window.adjustBins = function(delta) {
      currentBinCount = Math.max(1, Math.min(10, currentBinCount + delta));
      const disp = document.getElementById('binCountDisplay');
      if (disp) disp.textContent = currentBinCount;
      updateBinPrice();
    };

    window.updateBinPrice = function() {
      const plan = document.getElementById('binPlanSelect')?.value || 'monthly';
      let total = 0;
      let detail = '';

      if (plan === 'monthly') {
        total = 35 + Math.max(0, currentBinCount - 2) * 12;
        detail = `Monthly recurring auto-clean for ${currentBinCount} bins with 200° thermal steam & eco-deodorizer.`;
        const out = document.getElementById('binPriceOutput');
        if (out) out.innerHTML = `$${total}<span style="font-size:16px;color:#CBD5E1;font-weight:600;"> / month</span>`;
      } else {
        total = 65 + Math.max(0, currentBinCount - 2) * 20;
        detail = `One-time intensive deep sanitization for ${currentBinCount} bins.`;
        const out = document.getElementById('binPriceOutput');
        if (out) out.innerHTML = `$${total}<span style="font-size:16px;color:#CBD5E1;font-weight:600;"> one-time</span>`;
      }

      const detEl = document.getElementById('binPriceDetail');
      if (detEl) detEl.textContent = detail;
    };

    window.setResPreset = function(sqft) {
      const slider = document.getElementById('resSqftSlider');
      if (slider) {
        slider.value = sqft;
        updateResPrice();
      }
    };

    window.updateResPrice = function() {
      const service = document.getElementById('resServiceSelect')?.value || 'driveway';
      const sqft = parseInt(document.getElementById('resSqftSlider')?.value || '600', 10);
      const isSealant = document.getElementById('resSealantCheck')?.checked || false;

      const disp = document.getElementById('resSqftDisplay');
      if (disp) disp.textContent = `${sqft.toLocaleString()} sq ft`;

      let baseRate = 0.22;
      let serviceLabel = 'Driveway & Walkway';
      if (service === 'patio') { baseRate = 0.28; serviceLabel = 'Paver Patio & Pool Deck'; }
      else if (service === 'house') { baseRate = 0.24; serviceLabel = 'House Exterior Soft Wash'; }
      else if (service === 'fence') { baseRate = 0.30; serviceLabel = 'Wood Fence & Deck Restoration'; }

      let rawLow = sqft * baseRate * 0.9;
      let rawHigh = sqft * baseRate * 1.25;

      if (isSealant) {
        rawLow *= 1.20;
        rawHigh *= 1.20;
      }

      rawLow = Math.max(120, Math.round(rawLow));
      rawHigh = Math.max(160, Math.round(rawHigh));

      const out = document.getElementById('resPriceOutput');
      if (out) out.textContent = `$${rawLow} – $${rawHigh}`;

      const det = document.getElementById('resPriceDetail');
      if (det) {
        det.textContent = `Estimated for ${sqft.toLocaleString()} sq ft ${serviceLabel}${isSealant ? ' + Hydrophobic Stain Sealant' : ''} with plant-safe detergents.`;
      }
    };

    window.updateCommPrice = function() {
      const sqft = parseInt(document.getElementById('sqftSlider')?.value || '5000', 10);
      const surface = document.getElementById('commSurfaceSelect')?.value || 'flatwork';
      const night = document.getElementById('commNightSelect')?.value || 'standard';

      const disp = document.getElementById('sqftDisplay');
      if (disp) disp.textContent = `${sqft.toLocaleString()} sq ft`;

      let ratePerSqFt = 0.16;
      if (surface === 'garage') ratePerSqFt = 0.18;
      else if (surface === 'dumpster') ratePerSqFt = 0.24;
      else if (surface === 'facade') ratePerSqFt = 0.22;

      let multiplier = 1.0;
      if (sqft > 20000) multiplier = 0.75;
      else if (sqft > 10000) multiplier = 0.85;

      let nightAdd = (night === 'overnight') ? 1.18 : 1.0;

      let rawLow = sqft * ratePerSqFt * multiplier * nightAdd * 0.9;
      let rawHigh = sqft * ratePerSqFt * multiplier * nightAdd * 1.25;

      rawLow = Math.max(350, Math.round(rawLow / 25) * 25);
      rawHigh = Math.max(500, Math.round(rawHigh / 25) * 25);

      const out = document.getElementById('commPriceOutput');
      if (out) out.textContent = `$${rawLow.toLocaleString()} - $${rawHigh.toLocaleString()}`;

      const det = document.getElementById('commPriceDetail');
      if (det) {
        det.textContent = `Estimated for ${sqft.toLocaleString()} sq ft with 100% Cal/EPA water recovery & DVBE compliance.`;
      }
    };

    // =========================================================================
    // BEFORE & AFTER TRANSFORMATION SLIDER (MOUSE + TOUCH / MOBILE / TABLET)
    // =========================================================================
    (function initBeforeAfterSlider() {
      const container = document.getElementById('baSliderContainer');
      const handle = document.getElementById('baHandle');
      const afterLayer = document.getElementById('baAfterLayer');
      if (!container || !handle || !afterLayer) return;

      let isDragging = false;

      function setSliderPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        handle.style.left = `${percent}%`;
        afterLayer.style.width = `${percent}%`;
      }

      function onPointerDown(e) {
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setSliderPosition(clientX);
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setSliderPosition(clientX);
        if (e.cancelable) e.preventDefault();
      }

      function onPointerUp() {
        isDragging = false;
      }

      // Mouse Listeners
      container.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      // Touch Listeners (Mobile & Tablet)
      container.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
    })();
"""

# Insert interactive scripts right before </script> in experience.html
content = content.replace("    })();\n  </script>", "    })();\n" + interactive_scripts + "\n  </script>")

with open('website/experience.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully restored all mobile drawer, calculator, and touch-enabled Before/After slider scripts!')
