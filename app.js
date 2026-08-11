// Songhy Gacha Card Web App Logic

document.addEventListener('DOMContentLoaded', () => {
  // Canvas Particles Background
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = -Math.random() * 1.5 - 0.5;
      this.alpha = Math.random() * 0.8 + 0.2;
      const rainbowColors = ['#FF0055', '#FF7700', '#FFDD00', '#00FF66', '#00CCFF', '#9D00FF'];
      this.color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= 0.003;
      if (this.y < 0 || this.alpha <= 0) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Firework Confetti Particle
  class FireworkParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.15;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.01;
      this.color = `hsl(${Math.random() * 40 + 20}, 100%, 60%)`;
      this.size = Math.random() * 4 + 2;
    }

    update() {
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const particles = Array.from({ length: 90 }, () => new Particle());
  let fireworks = [];

  function triggerFireworksBurst(totalParticles = 150, burstCentersCount = 6) {
    for (let b = 0; b < burstCentersCount; b++) {
      // Random X between 15% and 85% of screen width
      const startX = Math.random() * (width * 0.7) + (width * 0.15);
      // Random Y between 15% and 75% of screen height
      const startY = Math.random() * (height * 0.6) + (height * 0.15);
      const count = Math.floor(totalParticles / burstCentersCount);
      for (let i = 0; i < count; i++) {
        fireworks.push(new FireworkParticle(startX, startY));
      }
    }
  }

  function renderLoop() {
    ctx.clearRect(0, 0, width, height);

    // Draw ambient embers
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw active fireworks
    fireworks = fireworks.filter(f => f.alpha > 0);
    fireworks.forEach(f => {
      f.update();
      f.draw();
    });

    requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Web Audio Synthesizer (SFX)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChargingSFX() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 2.0);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.8);
      gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.2);
    } catch(e) {}
  }

  function playExplosionSFX() {
    try {
      const ctx = getAudioContext();
      // Fanfare Chords
      const notes = [329.63, 415.30, 493.88, 659.25, 830.61]; // E major chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + idx * 0.08 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + 1.8);
      });
    } catch(e) {}
  }

  // Gacha Summon Cutscene Flow
  const btnSummon = document.getElementById('btnSummon');
  const summonOrb = document.getElementById('summonOrb');
  const stageContainer = document.getElementById('stageContainer');
  const cutsceneOverlay = document.getElementById('cutsceneOverlay');
  const flashScreen = document.getElementById('flashScreen');
  const cardSection = document.getElementById('cardSection');
  const btnResummon = document.getElementById('btnResummon');
  const btnFirework = document.getElementById('btnFirework');

  function startSummonSequence() {
    // Hide marquee bars and profile grid initially
    document.querySelectorAll('.marquee-container').forEach(el => el.classList.remove('visible'));
    const profileGrid = document.getElementById('profileGrid');
    if (profileGrid) profileGrid.classList.remove('visible');

    // Trigger BGM on user gesture
    playBGM();

    // Directly transition to Card Reveal! (No cutscene overlay delay)
    stageContainer.style.display = 'none';
    cardSection.style.display = 'flex';
    cardSection.classList.add('centering'); // Lock card to dead center of viewport!

    // Trigger screen-filling grand card reveal animation
    const cardWrapper = document.getElementById('cardWrapper');
    if (cardWrapper) {
      cardWrapper.classList.remove('grand-reveal');
      void cardWrapper.offsetWidth; // Force reflow
      cardWrapper.classList.add('grand-reveal');
    }

    // Explosion SFX & Multi-location Fireworks!
    playExplosionSFX();
    triggerFireworksBurst(180, 8);

    // After card finishes shrinking back to normal size in center, move to left & slide in profile grid!
    setTimeout(() => {
      cardSection.classList.remove('centering'); // Move card to left side!
      if (profileGrid) profileGrid.classList.add('visible');
      document.querySelectorAll('.marquee-container').forEach(el => el.classList.add('visible'));
      triggerFireworksBurst(80, 5);
    }, 1900);

    // Remove animation class after keyframes complete to restore 3D mouse tilt interaction!
    setTimeout(() => {
      if (cardWrapper) {
        cardWrapper.classList.remove('grand-reveal');
        cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      }
    }, 2450);
  }

  // Interactive Booster Pack Tear Gesture Engine
  const gachaPack = document.getElementById('gachaPack');
  const packTopFlap = document.getElementById('packTopFlap');
  const tearProgressFill = document.getElementById('tearProgressFill');
  let isTearing = false;
  let tearStartX = 0;
  let tearStartY = 0;
  let tearProgress = 0;
  let hasTorn = false;

  function handleTearStart(e) {
    if (hasTorn) return;
    isTearing = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    tearStartX = clientX;
    tearStartY = clientY;
    tearProgress = 0;
  }

  let lastTearAudioTime = 0;
  function playTearSFX() {
    try {
      const now = Date.now();
      if (now - lastTearAudioTime < 65) return;
      lastTearAudioTime = now;

      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140 + Math.random() * 250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch(e) {}
  }

  function handleTearMove(e) {
    if (!isTearing || hasTorn) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = Math.abs(clientX - tearStartX);
    const deltaY = Math.abs(clientY - tearStartY);
    const dist = Math.max(deltaX, deltaY);

    tearProgress = Math.min(100, (dist / 120) * 100);
    if (tearProgressFill) tearProgressFill.style.width = `${tearProgress}%`;

    // Play paper tear audio scratch SFX during drag!
    playTearSFX();

    if (tearProgress >= 100 && !hasTorn) {
      hasTorn = true;
      isTearing = false;
      if (packTopFlap) packTopFlap.classList.add('torn');
      triggerFireworksBurst(60, 3);

      setTimeout(() => {
        startSummonSequence();
        hasTorn = false;
        if (tearProgressFill) tearProgressFill.style.width = '0%';
        if (packTopFlap) packTopFlap.classList.remove('torn');
      }, 250);
    }
  }

  function handleTearEnd() {
    if (!hasTorn && isTearing) {
      isTearing = false;
      if (tearProgressFill) tearProgressFill.style.width = '0%';
    }
  }

  if (gachaPack) {
    gachaPack.addEventListener('mousedown', handleTearStart);
    window.addEventListener('mousemove', handleTearMove);
    window.addEventListener('mouseup', handleTearEnd);

    gachaPack.addEventListener('touchstart', handleTearStart, { passive: true });
    window.addEventListener('touchmove', handleTearMove, { passive: true });
    window.addEventListener('touchend', handleTearEnd);

    // Also support direct click to open if user just clicks!
    gachaPack.addEventListener('click', () => {
      if (!hasTorn && tearProgress < 30) {
        hasTorn = true;
        if (packTopFlap) packTopFlap.classList.add('torn');
        if (tearProgressFill) tearProgressFill.style.width = '100%';
        triggerFireworksBurst(60, 3);
        setTimeout(() => {
          startSummonSequence();
          hasTorn = false;
          if (tearProgressFill) tearProgressFill.style.width = '0%';
          if (packTopFlap) packTopFlap.classList.remove('torn');
        }, 250);
      }
    });
  }

  if (btnResummon) {
    btnResummon.addEventListener('click', () => {
      cardSection.style.display = 'none';
      stageContainer.style.display = 'flex';
      document.querySelectorAll('.marquee-container').forEach(el => el.classList.remove('visible'));
      if (packTopFlap) packTopFlap.classList.remove('torn');
      if (tearProgressFill) tearProgressFill.style.width = '0%';
      hasTorn = false;
    });
  }

  if (btnFirework) {
    btnFirework.addEventListener('click', () => {
      triggerFireworksBurst(90);
      playExplosionSFX();
    });
  }

  // Interactive 3D Card Parallax & Holo Foil
  const cardWrapper = document.getElementById('cardWrapper');
  const holoFoil = document.getElementById('holoFoil');

  if (cardWrapper) {
    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = (-y / rect.height) * 25;
      const rotateY = (x / rect.width) * 25;

      cardWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      if (holoFoil) {
        holoFoil.style.backgroundPosition = `${x * 0.8}px ${y * 0.8}px`;
      }
    });

    cardWrapper.addEventListener('mouseleave', () => {
      cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // Lightbox Modal for Marquee Sig Cards
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let isMarqueeDragging = false;
  let suppressClickUntil = 0;

  document.querySelectorAll('.sig-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // If user was dragging or just released drag, BLOCK lightbox modal!
      if (isMarqueeDragging || Date.now() < suppressClickUntil) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      const img = card.querySelector('.sig-img');
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxModal.classList.add('active');
      }
    }, true);
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // YouTube BGM Toggle & Volume Control (Default 50%)
  const btnMusicToggle = document.getElementById('btnMusicToggle');
  const bgmIframe = document.getElementById('bgmIframe');
  const audioEqualizer = document.querySelector('.audio-equalizer');
  const bgmVolume = document.getElementById('bgmVolume');
  const volumeValue = document.getElementById('volumeValue');
  const volumeIcon = document.getElementById('volumeIcon');
  let isPlayingMusic = false;

  function setBgmVolume(volPercent) {
    if (bgmIframe && bgmIframe.contentWindow) {
      bgmIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [volPercent] }),
        '*'
      );
    }
  }

  function playBGM() {
    if (bgmIframe && !isPlayingMusic) {
      isPlayingMusic = true;
      bgmIframe.src = "https://www.youtube-nocookie.com/embed/44zwxDtlju4?autoplay=1&loop=1&playlist=44zwxDtlju4&enablejsapi=1";
      if (btnMusicToggle) btnMusicToggle.textContent = '⏸';
      if (audioEqualizer) audioEqualizer.style.opacity = '1';

      // Apply initial volume (50% default) once iframe initializes
      const currentVol = bgmVolume ? parseInt(bgmVolume.value, 10) : 50;
      setTimeout(() => setBgmVolume(currentVol), 600);
      setTimeout(() => setBgmVolume(currentVol), 1400);
    }
  }

  function pauseBGM() {
    if (bgmIframe && isPlayingMusic) {
      isPlayingMusic = false;
      bgmIframe.src = "";
      if (btnMusicToggle) btnMusicToggle.textContent = '▶';
      if (audioEqualizer) audioEqualizer.style.opacity = '0.3';
    }
  }

  if (bgmVolume) {
    bgmVolume.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10);
      if (volumeValue) volumeValue.textContent = `${vol}%`;
      if (volumeIcon) {
        if (vol === 0) volumeIcon.textContent = '🔇';
        else if (vol < 50) volumeIcon.textContent = '🔉';
        else volumeIcon.textContent = '🔊';
      }
      setBgmVolume(vol);
    });
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlayingMusic) {
        pauseBGM();
      } else {
        playBGM();
      }
    });
  }

  // Interactive Fluid Marquee Engine (Drag & Resume without freezing)
  document.querySelectorAll('.marquee-container').forEach(container => {
    const track = container.querySelector('.marquee-track');
    if (!track) return;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartPos = 0;
    let scrollPos = 0;
    let hasMoved = false;
    const speed = container.classList.contains('marquee-bottom') ? 1.2 : -1.2;

    track.style.animation = 'none';

    function animate() {
      if (!isDragging) {
        scrollPos += speed;
        const halfWidth = track.scrollWidth / 2;
        if (speed < 0 && Math.abs(scrollPos) >= halfWidth) {
          scrollPos += halfWidth;
        } else if (speed > 0 && scrollPos >= 0) {
          scrollPos -= halfWidth;
        }
        track.style.transform = `translateX(${scrollPos}px)`;
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function startDrag(e) {
      isDragging = true;
      hasMoved = false;
      dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      dragStartPos = scrollPos;
      container.classList.add('dragging');
    }

    function onDrag(e) {
      if (!isDragging) return;
      const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const diffX = currentX - dragStartX;
      if (Math.abs(diffX) > 4) {
        hasMoved = true;
        isMarqueeDragging = true;
        suppressClickUntil = Date.now() + 400; // Block clicks for 400ms after dragging
      }
      scrollPos = dragStartPos + diffX;
      track.style.transform = `translateX(${scrollPos}px)`;
    }

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove('dragging');
      if (hasMoved) {
        suppressClickUntil = Date.now() + 400;
      }
      setTimeout(() => {
        isMarqueeDragging = false;
      }, 50);
    }

    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: true });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  });
});
