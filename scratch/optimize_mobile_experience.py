import re

with open('website/experience.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS for mobile font-size and card compactness
old_mobile_css = """    @media (max-width: 768px) {
      .top-status-badge span.long-text {
        display: none;
      }
      .experience-nav-wrap {
        top: 40px;
        padding: 0 10px;
      }
      .experience-nav {
        padding: 6px 14px;
      }
      .nav-logo-img {
        height: 32px;
      }
      .logo-pill-housing {
        padding: 4px 14px;
      }
      .btn-cta-glow {
        font-size: 11.5px;
        padding: 6px 14px;
      }
      .story-caption-deck {
        padding: 12px 16px;
        border-radius: 14px;
      }
      .story-title {
        font-size: 17px;
      }
      .story-desc {
        font-size: 12.5px;
        margin-bottom: 8px;
      }
      .footer-main-grid {
        grid-template-columns: 1fr;
      }
      .ba-slider-container {
        height: 320px;
      }
    }"""

new_mobile_css = """    @media (max-width: 768px) {
      .top-status-badge span.long-text {
        display: none;
      }
      .experience-nav-wrap {
        top: 36px;
        padding: 0 8px;
      }
      .experience-nav {
        padding: 5px 12px;
      }
      .nav-logo-img {
        height: 28px;
      }
      .logo-pill-housing {
        padding: 3px 10px;
      }
      .btn-cta-glow {
        font-size: 11px;
        padding: 5px 12px;
      }
      .story-hud {
        bottom: 16px;
      }
      .story-caption-deck {
        padding: 10px 14px;
        border-radius: 12px;
        max-width: 95%;
        margin: 0 auto;
        background: rgba(4, 9, 15, 0.88);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 240, 255, 0.22);
      }
      .story-tag {
        font-size: 8.5px;
        letter-spacing: 0.6px;
        margin-bottom: 2px;
      }
      .story-title {
        font-size: 14.5px;
        line-height: 1.2;
        margin-bottom: 3px;
      }
      .story-desc {
        font-size: 11px;
        line-height: 1.35;
        margin-bottom: 6px;
      }
      .spec-badge {
        font-size: 9px;
        padding: 2px 7px;
      }
      .story-btn-pill {
        font-size: 10px;
        padding: 4px 10px;
      }
      .footer-main-grid {
        grid-template-columns: 1fr;
      }
      .ba-slider-container {
        height: 300px;
      }
    }
    
    @media (max-width: 480px) {
      .story-title {
        font-size: 13.5px;
      }
      .story-desc {
        font-size: 10.5px;
        line-height: 1.3;
      }
      .story-caption-deck {
        padding: 8px 12px;
      }
    }"""

content = content.replace(old_mobile_css, new_mobile_css)

# 2. Update Canvas Script for fast progressive loading, zero black screens, and nearest frame fallback
old_script_start = """  <!-- Core Multi-Scene Interactive Script -->
  <script>
    (function() {
      const SCENE1_FRAMES = 120;
      const SCENE2_FRAMES = 120;
      const SCENE3_FRAMES = 120;
      const SCENE4_FRAMES = 120;
      const SCENE5_FRAMES = 120;
      const TOTAL_FRAMES = SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES + SCENE5_FRAMES; // 600 frames total

      const allImages = [];
      let loadedCount = 0;
      let currentFrameIndex = 0;
      let targetFrameIndex = 0;

      const canvas = document.getElementById('scrollCanvas');
      const ctx = canvas.getContext('2d');
      const preloader = document.getElementById('preloader');
      const loaderText = document.getElementById('loaderText');
      const loaderFill = document.getElementById('loaderFill');
      const trackerBar = document.getElementById('trackerBar');
      const storyHud = document.getElementById('storyHud');
      const scrollTracker = document.getElementById('scrollTracker');"""

# Extract the whole script block
script_pattern = r'<!-- Core Multi-Scene Interactive Script -->\s*<script>([\s\S]*?)</script>'

new_script_content = """<!-- Core Multi-Scene Interactive Script -->
  <script>
    (function() {
      const SCENE1_FRAMES = 120;
      const SCENE2_FRAMES = 120;
      const SCENE3_FRAMES = 120;
      const SCENE4_FRAMES = 120;
      const SCENE5_FRAMES = 120;
      const TOTAL_FRAMES = SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES + SCENE5_FRAMES; // 600 frames total

      const allImages = new Array(TOTAL_FRAMES);
      let loadedCount = 0;
      let currentFrameIndex = 0;
      let targetFrameIndex = 0;
      let isInitialReady = false;
      let lastRenderedImg = null;

      const canvas = document.getElementById('scrollCanvas');
      const ctx = canvas.getContext('2d');
      const canvasContainer = document.getElementById('canvasContainer');
      const preloader = document.getElementById('preloader');
      const loaderText = document.getElementById('loaderText');
      const loaderFill = document.getElementById('loaderFill');
      const trackerBar = document.getElementById('trackerBar');
      const storyHud = document.getElementById('storyHud');
      const scrollTracker = document.getElementById('scrollTracker');

      // Preload 5 HD Hero Posters for Zero-Latency Instant Backgrounds
      const actPosters = [
        new Image(),
        new Image(),
        new Image(),
        new Image(),
        new Image()
      ];
      actPosters[0].src = 'assets/img/scene1_hero.jpg';
      actPosters[1].src = 'assets/img/scene2_hero.jpg';
      actPosters[2].src = 'assets/img/scene3_hero.jpg';
      actPosters[3].src = 'assets/img/scene4_hero.jpg';
      actPosters[4].src = 'assets/img/scene5_hero.jpg';

      // Telemetry elements
      const telLabel1 = document.getElementById('telLabel1');
      const telVal1 = document.getElementById('telVal1');
      const telLabel2 = document.getElementById('telLabel2');
      const telVal2 = document.getElementById('telVal2');
      const telLabel3 = document.getElementById('telLabel3');
      const telVal3 = document.getElementById('telVal3');
      const telLabel4 = document.getElementById('telLabel4');
      const telVal4 = document.getElementById('telVal4');

      const cards = [
        document.getElementById('card1'),
        document.getElementById('card2'),
        document.getElementById('card3'),
        document.getElementById('card4'),
        document.getElementById('card5'),
        document.getElementById('card6'),
        document.getElementById('card7'),
        document.getElementById('card8'),
        document.getElementById('card9'),
        document.getElementById('card10')
      ];

      function resizeCanvas() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        renderFrame(currentFrameIndex);
      }
      window.addEventListener('resize', resizeCanvas);

      function padZero(num) {
        return num.toString().padStart(4, '0');
      }

      function dismissPreloader() {
        if (isInitialReady) return;
        isInitialReady = true;
        if (preloader) {
          preloader.style.opacity = '0';
          preloader.style.visibility = 'hidden';
        }
        resizeCanvas();
        startRenderLoop();
      }

      function checkProgress() {
        loadedCount++;
        const percent = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loaderText) loaderText.textContent = `STREAMING 3D 5-ACT ENGINE (${percent}%)`;
        if (loaderFill) loaderFill.style.width = `${percent}%`;

        // FAST START: Once the first 25 frames are ready, launch instantly!
        if (loadedCount >= 25 && !isInitialReady) {
          dismissPreloader();
        }
      }

      // Progressive Batched Image Preloader
      function loadAllFrames() {
        // Scene 1 (Frames 0 to 119)
        for (let i = 1; i <= SCENE1_FRAMES; i++) {
          const idx = i - 1;
          const img = new Image();
          img.src = `assets/frames/scene1/frame_${padZero(i)}.webp`;
          img.onload = () => { allImages[idx] = img; checkProgress(); };
          img.onerror = () => { checkProgress(); };
        }

        // Scene 2 (Frames 120 to 239)
        for (let i = 1; i <= SCENE2_FRAMES; i++) {
          const idx = SCENE1_FRAMES + (i - 1);
          const img = new Image();
          img.src = `assets/frames/scene2/frame_${padZero(i)}.webp`;
          img.onload = () => { allImages[idx] = img; checkProgress(); };
          img.onerror = () => { checkProgress(); };
        }

        // Scene 3 (Frames 240 to 359)
        for (let i = 1; i <= SCENE3_FRAMES; i++) {
          const idx = SCENE1_FRAMES + SCENE2_FRAMES + (i - 1);
          const img = new Image();
          img.src = `assets/frames/scene3/frame_${padZero(i)}.webp`;
          img.onload = () => { allImages[idx] = img; checkProgress(); };
          img.onerror = () => { checkProgress(); };
        }

        // Scene 4 (Frames 360 to 479)
        for (let i = 1; i <= SCENE4_FRAMES; i++) {
          const idx = SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + (i - 1);
          const frameIdx = i * 2;
          const img = new Image();
          img.src = `assets/frames/scene4/frame_${padZero(frameIdx)}.webp`;
          img.onload = () => { allImages[idx] = img; checkProgress(); };
          img.onerror = () => { checkProgress(); };
        }

        // Scene 5 (Frames 480 to 599)
        for (let i = 1; i <= SCENE5_FRAMES; i++) {
          const idx = SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES + (i - 1);
          const frameIdx = i * 2;
          const img = new Image();
          img.src = `assets/frames/scene5/frame_${padZero(frameIdx)}.webp`;
          img.onload = () => { allImages[idx] = img; checkProgress(); };
          img.onerror = () => { checkProgress(); };
        }
      }

      // Safety timeout: dismiss preloader after max 1.5 seconds regardless
      setTimeout(dismissPreloader, 1500);
      loadAllFrames();

      // Find nearest loaded frame if target frame is downloading
      function getBestImageForIndex(targetIdx) {
        if (allImages[targetIdx] && allImages[targetIdx].complete && allImages[targetIdx].naturalWidth > 0) {
          return allImages[targetIdx];
        }

        // Search in a window of +-15 frames
        for (let offset = 1; offset <= 15; offset++) {
          const prev = targetIdx - offset;
          if (prev >= 0 && allImages[prev] && allImages[prev].complete && allImages[prev].naturalWidth > 0) {
            return allImages[prev];
          }
          const next = targetIdx + offset;
          if (next < TOTAL_FRAMES && allImages[next] && allImages[next].complete && allImages[next].naturalWidth > 0) {
            return allImages[next];
          }
        }

        // Return last rendered image if available
        if (lastRenderedImg && lastRenderedImg.complete && lastRenderedImg.naturalWidth > 0) {
          return lastRenderedImg;
        }

        // Fallback to the Act Hero Poster
        const actIndex = Math.min(4, Math.floor(targetIdx / 120));
        if (actPosters[actIndex] && actPosters[actIndex].complete && actPosters[actIndex].naturalWidth > 0) {
          return actPosters[actIndex];
        }

        return actPosters[0];
      }

      function renderFrame(index) {
        const clampedIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(index)));
        const img = getBestImageForIndex(clampedIndex);
        if (!img || !img.complete || img.naturalWidth === 0) return;

        lastRenderedImg = img;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const screenRatio = w / h;

        let renderW, renderH, offsetX, offsetY;

        if (screenRatio > imgRatio) {
          renderW = w;
          renderH = w / imgRatio;
          offsetX = 0;
          offsetY = (h - renderH) / 2;
        } else {
          renderH = h;
          renderW = h * imgRatio;
          offsetX = (w - renderW) / 2;
          offsetY = 0;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      }

      // Scroll Event Listener
      const scrollTrack = document.getElementById('scrollTrack');
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const trackHeight = scrollTrack.offsetHeight;
        const scrollFraction = Math.min(1, Math.max(0, scrollTop / trackHeight));

        targetFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollFraction * TOTAL_FRAMES));

        // Update progress bar
        if (trackerBar) trackerBar.style.height = `${scrollFraction * 100}%`;

        // Hide HUD when entering Content Hub
        if (scrollTop >= trackHeight - 100) {
          if (storyHud) storyHud.classList.add('docked-hidden');
          if (scrollTracker) scrollTracker.style.opacity = '0';
        } else {
          if (storyHud) storyHud.classList.remove('docked-hidden');
          if (scrollTracker) scrollTracker.style.opacity = '1';
        }

        // Dynamic Telemetry across all 5 Acts
        if (scrollFraction < 0.20) {
          if (telLabel1) telLabel1.innerHTML = '<i class="fa-solid fa-fire"></i> Water Temp';
          if (telVal1) telVal1.innerHTML = '200.0 <span>°F</span>';
          if (telLabel2) telLabel2.innerHTML = '<i class="fa-solid fa-gauge-high"></i> Pressure';
          if (telVal2) telVal2.innerHTML = '4,000 <span>PSI</span>';
          if (telLabel3) telLabel3.innerHTML = '<i class="fa-solid fa-water"></i> Output Flow';
          if (telVal3) telVal3.innerHTML = '8.0 <span>GPM</span>';
          if (telLabel4) telLabel4.innerHTML = '<i class="fa-solid fa-shield-virus"></i> Sanitization';
          if (telVal4) telVal4.innerHTML = '99.9 <span>% Kill</span>';
        } else if (scrollFraction < 0.40) {
          if (telLabel1) telLabel1.innerHTML = '<i class="fa-solid fa-rotate"></i> Surface Speed';
          if (telVal1) telVal1.innerHTML = '2,500 <span>RPM</span>';
          if (telLabel2) telLabel2.innerHTML = '<i class="fa-solid fa-gauge-high"></i> Jet Pressure';
          if (telVal2) telVal2.innerHTML = '4,200 <span>PSI</span>';
          if (telLabel3) telLabel3.innerHTML = '<i class="fa-solid fa-chart-line"></i> Coverage Rate';
          if (telVal3) telVal3.innerHTML = '15,000 <span>sq ft/hr</span>';
          if (telLabel4) telLabel4.innerHTML = '<i class="fa-solid fa-sparkles"></i> Surface Finish';
          if (telVal4) telVal4.innerHTML = '100.0 <span>% Streak-Free</span>';
        } else if (scrollFraction < 0.60) {
          if (telLabel1) telLabel1.innerHTML = '<i class="fa-solid fa-fire"></i> Boiler Heat';
          if (telVal1) telVal1.innerHTML = '200.0 <span>°F Steam</span>';
          if (telLabel2) telLabel2.innerHTML = '<i class="fa-solid fa-gauge-high"></i> Hydro Blast';
          if (telVal2) telVal2.innerHTML = '4,500 <span>PSI</span>';
          if (telLabel3) telLabel3.innerHTML = '<i class="fa-solid fa-flask"></i> Degreaser';
          if (telVal3) telVal3.innerHTML = 'Bio <span>List-N</span>';
          if (telLabel4) telLabel4.innerHTML = '<i class="fa-solid fa-recycle"></i> Remediation';
          if (telVal4) telVal4.innerHTML = '100.0 <span>% Sanitized</span>';
        } else if (scrollFraction < 0.80) {
          if (telLabel1) telLabel1.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i> Reach Height';
          if (telVal1) telVal1.innerHTML = '45.0 <span>FT</span>';
          if (telLabel2) telLabel2.innerHTML = '<i class="fa-solid fa-soap"></i> Active Foam';
          if (telVal2) telVal2.innerHTML = 'Bio <span>Soft-Wash</span>';
          if (telLabel3) telLabel3.innerHTML = '<i class="fa-solid fa-droplet"></i> Water Purity';
          if (telVal3) telVal3.innerHTML = '0.0 <span>PPM TDS</span>';
          if (telLabel4) telLabel4.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Glass Clarity';
          if (telVal4) telVal4.innerHTML = '100.0 <span>% Spot-Free</span>';
        } else {
          if (telLabel1) telLabel1.innerHTML = '<i class="fa-solid fa-recycle"></i> Vacuum Suction';
          if (telVal1) telVal1.innerHTML = '100.0 <span>% Reclaim</span>';
          if (telLabel2) telLabel2.innerHTML = '<i class="fa-solid fa-shield-halved"></i> EPA Status';
          if (telVal2) telVal2.innerHTML = 'CAL/EPA <span>Compliant</span>';
          if (telLabel3) telLabel3.innerHTML = '<i class="fa-solid fa-water"></i> Storm Drain';
          if (telVal3) telVal3.innerHTML = '0.0 <span>Runoff</span>';
          if (telLabel4) telLabel4.innerHTML = '<i class="fa-solid fa-award"></i> Certification';
          if (telVal4) telVal4.innerHTML = 'DVBE <span>#2054658</span>';
        }

        // Active Card Thresholds
        let activeCardIdx = 0;
        if (scrollFraction >= 0.90) {
          activeCardIdx = 9;
        } else if (scrollFraction >= 0.80) {
          activeCardIdx = 8;
        } else if (scrollFraction >= 0.70) {
          activeCardIdx = 7;
        } else if (scrollFraction >= 0.60) {
          activeCardIdx = 6;
        } else if (scrollFraction >= 0.50) {
          activeCardIdx = 5;
        } else if (scrollFraction >= 0.40) {
          activeCardIdx = 4;
        } else if (scrollFraction >= 0.30) {
          activeCardIdx = 3;
        } else if (scrollFraction >= 0.20) {
          activeCardIdx = 2;
        } else if (scrollFraction >= 0.10) {
          activeCardIdx = 1;
        } else {
          activeCardIdx = 0;
        }

        cards.forEach((card, idx) => {
          if (card) {
            if (idx === activeCardIdx) {
              card.classList.add('active');
            } else {
              card.classList.remove('active');
            }
          }
        });
      }, { passive: true });

      // Ultra-smooth lerp loop
      function startRenderLoop() {
        function loop() {
          const diff = targetFrameIndex - currentFrameIndex;
          if (Math.abs(diff) > 0.05) {
            currentFrameIndex += diff * 0.22;
            renderFrame(currentFrameIndex);
          }
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    })();"""

content = re.sub(script_pattern, new_script_content + "\n  </script>", content)

with open('website/experience.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully upgraded experience.html with mobile font-size optimizations, zero black screens, and fast progressive streaming!')
