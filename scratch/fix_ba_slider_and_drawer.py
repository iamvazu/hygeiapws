import re

with open('website/experience.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS for mobile drawer and slider touch support
old_drawer_css = """.mobile-nav-drawer {
      display: none;
      position: fixed;
      top: 90px;
      left: 16px;
      right: 16px;
      background: rgba(7, 13, 20, 0.98);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 180, 216, 0.3);
      border-radius: 20px;
      padding: 24px;
      z-index: 105;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    }"""

new_drawer_css = """.mobile-nav-drawer {
      display: none;
      position: fixed;
      top: 85px;
      left: 14px;
      right: 14px;
      background: rgba(6, 12, 19, 0.98);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 20px;
      padding: 20px 24px;
      z-index: 9999;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 209, 255, 0.15);
    }"""

content = content.replace(old_drawer_css, new_drawer_css)

old_ba_container = """.ba-slider-container {
      position: relative;
      width: 100%;
      height: 480px;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--slate-border);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      user-select: none;
    }"""

new_ba_container = """.ba-slider-container {
      position: relative;
      width: 100%;
      height: 480px;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--slate-border);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      cursor: ew-resize;
    }"""

content = content.replace(old_ba_container, new_ba_container)

# 2. Update initBeforeAfterSlider script with full touch & overlay pinning
old_ba_script = """    // =========================================================================
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
    })();"""

new_ba_script = """    // =========================================================================
    // BEFORE & AFTER TRANSFORMATION SLIDER (DESKTOP, MOBILE & TABLET TOUCH)
    // =========================================================================
    (function initBeforeAfterSlider() {
      const container = document.getElementById('baSliderContainer');
      const handle = document.getElementById('baHandle');
      const afterLayer = document.getElementById('baAfterLayer');
      const imgOverlay = document.getElementById('baImgOverlay');
      if (!container || !handle || !afterLayer) return;

      let isDragging = false;

      function syncOverlayWidth() {
        if (container && imgOverlay) {
          imgOverlay.style.width = `${container.offsetWidth}px`;
        }
      }

      function setSliderPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        handle.style.left = `${percent}%`;
        afterLayer.style.width = `${percent}%`;
        syncOverlayWidth();
      }

      function onPointerDown(e) {
        isDragging = true;
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        setSliderPosition(clientX);
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        setSliderPosition(clientX);
        if (e.cancelable) e.preventDefault();
      }

      function onPointerUp() {
        isDragging = false;
      }

      // Sync on load and window resize
      syncOverlayWidth();
      window.addEventListener('resize', syncOverlayWidth);

      // Mouse Listeners
      container.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      // Touch Listeners (Mobile & Tablet)
      container.addEventListener('touchstart', onPointerDown, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
    })();"""

content = content.replace(old_ba_script, new_ba_script)

with open('website/experience.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Before & After touch slider and mobile drawer!')
