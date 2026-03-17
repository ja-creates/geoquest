/**
 * GeoQuest – Main Game Script
 * Architecture: Module pattern with clear separation of concerns
 * Modules: GameController, MapController, UIController, SoundManager, StorageManager
 */

'use strict';

/* ================================================================
   STORAGE MANAGER
   Handles all localStorage interactions safely
   ================================================================ */
const StorageManager = (() => {
  const KEYS = {
    HIGH_SCORE: 'geoquest_highscore',
    SOUND:      'geoquest_sound',
    THEME:      'geoquest_theme',
  };

  const get = (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  };

  const set = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* silent */ }
  };

  return {
    getHighScore:  ()  => get(KEYS.HIGH_SCORE, 0),
    setHighScore:  (n) => set(KEYS.HIGH_SCORE, n),
    getSoundPref:  ()  => get(KEYS.SOUND, true),
    setSoundPref:  (v) => set(KEYS.SOUND, v),
    getThemePref:  ()  => get(KEYS.THEME, 'light'),
    setThemePref:  (t) => set(KEYS.THEME, t),
  };
})();

/* ================================================================
   SOUND MANAGER
   Generates tones via Web Audio API – no external files needed
   ================================================================ */
const SoundManager = (() => {
  let enabled = StorageManager.getSoundPref();
  let ctx = null;

  const getCtx = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    return ctx;
  };

  /**
   * Play a synthesized tone
   * @param {number[]} freqs - Array of frequencies (chord/arpeggio)
   * @param {string}   type  - Oscillator type
   * @param {number}   dur   - Duration in seconds
   * @param {number}   vol   - Volume 0-1
   */
  const playTone = (freqs, type = 'sine', dur = 0.15, vol = 0.18) => {
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    freqs.forEach((freq, i) => {
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(vol, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + dur);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + dur + 0.05);
    });
  };

  return {
    isEnabled: () => enabled,

    setEnabled(v) {
      enabled = v;
      StorageManager.setSoundPref(v);
    },

    playCorrect() {
      // Rising major arpeggio
      playTone([523, 659, 784], 'triangle', 0.22, 0.2);
    },

    playWrong() {
      // Descending minor
      playTone([330, 277], 'sawtooth', 0.18, 0.15);
    },

    playClick() {
      playTone([880], 'sine', 0.06, 0.1);
    },

    playStart() {
      playTone([262, 330, 392, 523], 'triangle', 0.18, 0.18);
    },

    playVictory() {
      // Ascending fanfare
      playTone([523, 659, 784, 1047], 'triangle', 0.25, 0.22);
    },

    playTimerWarning() {
      playTone([440], 'square', 0.08, 0.08);
    },
  };
})();

/* ================================================================
   CONFETTI ENGINE
   Lightweight canvas-based confetti animation
   ================================================================ */
const ConfettiEngine = (() => {
  const canvas   = document.getElementById('confetti-canvas');
  const ctx      = canvas.getContext('2d');
  let particles  = [];
  let rafId      = null;

  const COLORS = ['#007AFF','#34C759','#FF9500','#FF3B30','#AF52DE','#5AC8FA','#FFD60A'];

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  const createParticle = () => ({
    x:    Math.random() * canvas.width,
    y:    -10,
    r:    Math.random() * 7 + 3,
    d:    Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:   (Math.random() - 0.5) * 3,
    vy:   Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.2,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    alpha: 1,
  });

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  };

  const update = () => {
    particles = particles.filter(p => p.alpha > 0.05);
    particles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.06;
      p.angle += p.spin;
      if (p.y > canvas.height * 0.7) p.alpha -= 0.018;
    });
  };

  const loop = () => {
    if (particles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rafId = null;
      return;
    }
    draw();
    update();
    rafId = requestAnimationFrame(loop);
  };

  return {
    burst(count = 120) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => particles.push(createParticle()), i * 15);
      }
      if (!rafId) loop();
    },

    stop() {
      particles = [];
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
})();

/* ================================================================
   MAP CONTROLLER
   Handles SVG map rendering, interaction, and highlighting
   ================================================================ */
const MapController = (() => {
  let svgRoot  = null;
  let scale    = 1;
  let offsetX  = 0;
  let offsetY  = 0;
  let isDragging = false;
  let dragStart  = { x: 0, y: 0 };
  let onCountryClick = null;
  let onCountryHover = null;

  const container = document.getElementById('map-svg-container');
  const wrapper   = document.getElementById('map-wrapper');

  /* ── Build SVG World Map ── */

  /**
   * Generate simplified world map SVG paths
   * Uses a curated set of simplified country outlines
   */
  const buildSVG = () => {
    // We create a clean SVG world map with simplified country shapes
    // Each country path uses data-country="ISO_CODE" for click detection
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 2000 1000');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Interactive World Map');

    // Ocean background
    const ocean = document.createElementNS(svgNS, 'rect');
    ocean.setAttribute('width', '2000');
    ocean.setAttribute('height', '1000');
    ocean.setAttribute('fill', 'var(--map-bg)');
    ocean.classList.add('ocean');
    svg.appendChild(ocean);

    // Country paths – simplified representative shapes
    // Each entry: [id, pathData]
    const countries = getCountryPaths();
    countries.forEach(([id, d]) => {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('data-country', id);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', `${getCountryName(id)} – click to select`);
      svg.appendChild(path);
    });

    return svg;
  };

  const getCountryName = (id) => {
    const c = COUNTRY_MAP.get(id);
    return c ? c.name : id;
  };

  /* ── Transform helpers ── */
  const applyTransform = () => {
    container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  };

  const clampOffset = () => {
    const rect = wrapper.getBoundingClientRect();
    const maxX = rect.width  * (scale - 1) / 2 + 100;
    const maxY = rect.height * (scale - 1) / 2 + 100;
    offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
    offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
  };

  /* ── Clear all highlights ── */
  const clearHighlights = () => {
    if (!svgRoot) return;
    svgRoot.querySelectorAll('[data-country]').forEach(el => {
      el.classList.remove('country-correct', 'country-wrong', 'country-target', 'country-focus');
    });
  };

  /* ── Highlight a country ── */
  const highlightCountry = (id, type) => {
    if (!svgRoot) return;
    const el = svgRoot.querySelector(`[data-country="${id}"]`);
    if (!el) return;
    el.classList.add(`country-${type}`);
    if (type === 'correct' || type === 'wrong') {
      // Auto-scroll to element for mobile
      const bbox = el.getBBox();
      const svgRect = svgRoot.getBoundingClientRect();
      const wRect   = wrapper.getBoundingClientRect();
      const scaleX  = svgRect.width  / 2000;
      const scaleY  = svgRect.height / 1000;
      const cx = bbox.x * scaleX + bbox.width  * scaleX / 2 + svgRect.left - wRect.left;
      const cy = bbox.y * scaleY + bbox.height * scaleY / 2 + svgRect.top  - wRect.top;
      // Nudge offset toward the highlighted country
      const targetOffsetX = (wRect.width  / 2 - cx) * 0.4;
      const targetOffsetY = (wRect.height / 2 - cy) * 0.4;
      offsetX += targetOffsetX * 0.3;
      offsetY += targetOffsetY * 0.3;
      clampOffset();
      applyTransform();
    }
  };

  /* ── Setup pointer events ── */
  const setupEvents = () => {
    // Event delegation – single listener on SVG
    container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-country]');
      if (target && onCountryClick) {
        SoundManager.playClick();
        onCountryClick(target.getAttribute('data-country'));
      }
    });

    container.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-country]');
      if (target && onCountryHover) {
        onCountryHover(target.getAttribute('data-country'));
      }
    });

    container.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-country]');
      if (target && onCountryHover) {
        onCountryHover(null);
      }
    });

    // Keyboard navigation on individual paths
    container.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.country) {
        e.preventDefault();
        if (onCountryClick) {
          SoundManager.playClick();
          onCountryClick(e.target.getAttribute('data-country'));
        }
      }
    });

    // Pan (drag)
    wrapper.addEventListener('pointerdown', (e) => {
      if (e.target.closest('[data-country]')) return; // let clicks through
      isDragging = true;
      dragStart  = { x: e.clientX - offsetX, y: e.clientY - offsetY };
      wrapper.setPointerCapture(e.pointerId);
    });

    wrapper.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      offsetX = e.clientX - dragStart.x;
      offsetY = e.clientY - dragStart.y;
      clampOffset();
      applyTransform();
    });

    wrapper.addEventListener('pointerup',     () => { isDragging = false; });
    wrapper.addEventListener('pointercancel', () => { isDragging = false; });

    // Pinch / wheel zoom
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.max(0.8, Math.min(4, scale * delta));
      clampOffset();
      applyTransform();
    }, { passive: false });

    // Map controls
    document.getElementById('zoom-in').addEventListener('click',    () => zoom(1.25));
    document.getElementById('zoom-out').addEventListener('click',   () => zoom(0.8));
    document.getElementById('zoom-reset').addEventListener('click', () => resetView());
  };

  const zoom = (factor) => {
    scale = Math.max(0.8, Math.min(4, scale * factor));
    clampOffset();
    applyTransform();
  };

  const resetView = () => {
    scale = 1; offsetX = 0; offsetY = 0;
    applyTransform();
  };

  return {
    init() {
      svgRoot = buildSVG();
      container.innerHTML = '';
      container.appendChild(svgRoot);
      setupEvents();
    },

    onCountryClick(fn) { onCountryClick = fn; },
    onCountryHover(fn) { onCountryHover = fn; },

    highlightCountry,
    clearHighlights,
    resetView,

    getSVGCountryIds() {
      if (!svgRoot) return [];
      return [...svgRoot.querySelectorAll('[data-country]')]
        .map(el => el.getAttribute('data-country'));
    },
  };
})();

/* ================================================================
   UI CONTROLLER
   All DOM manipulation is centralized here
   ================================================================ */
const UIController = (() => {
  // Element references (queried once)
  const EL = {
    loadingScreen:   document.getElementById('loading-screen'),
    loadingBar:      document.getElementById('loading-bar'),
    app:             document.getElementById('app'),
    startScreen:     document.getElementById('start-screen'),
    endScreen:       document.getElementById('end-screen'),
    navScore:        document.getElementById('nav-score'),
    navRound:        document.getElementById('nav-round'),
    progressFill:    document.getElementById('progress-fill'),
    promptCountry:   document.getElementById('prompt-country'),
    promptHint:      document.getElementById('prompt-hint'),
    feedbackToast:   document.getElementById('feedback-toast'),
    feedbackIcon:    document.getElementById('feedback-icon'),
    feedbackText:    document.getElementById('feedback-text'),
    streakRow:       document.getElementById('streak-row'),
    highScoreValue:  document.getElementById('high-score-value'),
    finalScore:      document.getElementById('final-score'),
    statCorrect:     document.getElementById('stat-correct'),
    statWrong:       document.getElementById('stat-wrong'),
    statHighscore:   document.getElementById('stat-highscore'),
    statAccuracy:    document.getElementById('stat-accuracy'),
    resultTitle:     document.getElementById('end-title'),
    resultMessage:   document.getElementById('result-message'),
    endEmoji:        document.getElementById('end-emoji'),
    achievementRow:  document.getElementById('achievement-row'),
    scoreCircleFill: document.getElementById('score-circle-fill'),
    timerRingFg:     document.getElementById('timer-ring-fg'),
    timerText:       document.getElementById('timer-text'),
    hsDisplay:       document.getElementById('hs-display'),
    countryPopup:    document.getElementById('country-popup'),
    popupName:       document.getElementById('popup-name'),
    popupCapital:    document.getElementById('popup-capital'),
    popupFlag:       document.getElementById('popup-flag'),
    soundIcon:       document.getElementById('sound-icon'),
    themeIcon:       document.getElementById('theme-icon'),
    soundToggle:     document.getElementById('sound-toggle'),
    darkModeToggle:  document.getElementById('dark-mode-toggle'),
    progressBarCont: document.getElementById('progress-bar-container'),
    diffButtons:     document.querySelectorAll('[data-difficulty]'),
    diffSelectBtns:  document.querySelectorAll('[data-diff]'),
    startBtn:        document.getElementById('start-btn'),
    playAgainBtn:    document.getElementById('play-again-btn'),
    shareBtn:        document.getElementById('share-btn'),
    skipBtn:         document.getElementById('skip-btn'),
    hintBtn:         document.getElementById('hint-btn'),
  };

  let toastTimeout   = null;
  let hoverTimeout   = null;

  /* ── Loading ── */
  const setLoadingProgress = (pct) => {
    EL.loadingBar.style.width = `${pct}%`;
  };

  const hideLoading = (cb) => {
    EL.loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      EL.loadingScreen.style.display = 'none';
      cb?.();
    }, 500);
  };

  /* ── Screen transitions ── */
  const showApp     = () => { EL.app.style.display = 'flex'; };
  const showStart   = () => { EL.startScreen.style.display = 'flex'; EL.endScreen.style.display = 'none'; };
  const hideStart   = () => { EL.startScreen.style.display = 'none'; };
  const showEnd     = () => { EL.endScreen.style.display = 'flex'; EL.startScreen.style.display = 'none'; };
  const hideEnd     = () => { EL.endScreen.style.display = 'none'; };

  /* ── Nav stats ── */
  const updateScore = (score) => {
    EL.navScore.textContent = score;
    EL.navScore.classList.remove('bump');
    requestAnimationFrame(() => {
      EL.navScore.classList.add('bump');
    });
  };

  const updateRound = (round, max) => {
    EL.navRound.textContent = `${round}/${max}`;
    const pct = ((round - 1) / max) * 100;
    EL.progressFill.style.width = `${pct}%`;
    EL.progressBarCont.setAttribute('aria-valuenow', round - 1);
  };

  /* ── Prompt ── */
  const setPrompt = (countryName) => {
    EL.promptCountry.style.animation = 'none';
    requestAnimationFrame(() => {
      EL.promptCountry.style.animation = '';
      EL.promptCountry.textContent = countryName;
    });
    EL.promptHint.textContent = '';
  };

  const showHint = (text) => {
    EL.promptHint.textContent = `💡 ${text}`;
  };

  /* ── Feedback Toast ── */
  const showFeedback = (type, message) => {
    clearTimeout(toastTimeout);
    EL.feedbackToast.className = `feedback-toast show ${type}`;
    EL.feedbackIcon.textContent = type === 'correct' ? '✅' : '❌';
    EL.feedbackText.textContent = message;
    toastTimeout = setTimeout(() => {
      EL.feedbackToast.classList.remove('show');
    }, 2000);
  };

  /* ── Streak dots ── */
  const buildStreak = (total) => {
    EL.streakRow.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'streak-dot';
      dot.setAttribute('aria-hidden', 'true');
      EL.streakRow.appendChild(dot);
    }
  };

  const updateStreak = (index, type) => {
    const dots = EL.streakRow.querySelectorAll('.streak-dot');
    dots.forEach((d, i) => {
      d.classList.remove('current');
      if (i < index) {
        d.classList.add(type === 'correct' && i === index - 1 ? 'correct' : d.classList.contains('wrong') ? 'wrong' : d.classList.contains('correct') ? 'correct' : '');
      }
    });
    // Mark current
    if (dots[index]) dots[index].classList.add('current');
  };

  const markStreakResult = (index, result) => {
    const dots = EL.streakRow.querySelectorAll('.streak-dot');
    if (dots[index]) {
      dots[index].classList.remove('current');
      dots[index].classList.add(result);
    }
    if (dots[index + 1]) dots[index + 1].classList.add('current');
  };

  /* ── High Score ── */
  const updateHighScore = (hs) => {
    EL.highScoreValue.textContent = hs;
    EL.hsDisplay.textContent = hs;
  };

  /* ── Timer Ring ── */
  const RING_CIRCUMFERENCE = 113.1; // 2π * 18

  const setTimer = (seconds, maxSeconds) => {
    const ratio = seconds / maxSeconds;
    const offset = RING_CIRCUMFERENCE * (1 - ratio);
    EL.timerRingFg.style.strokeDashoffset = offset;
    EL.timerText.textContent = seconds;

    EL.timerRingFg.classList.remove('warning', 'danger');
    if (ratio <= 0.25) EL.timerRingFg.classList.add('danger');
    else if (ratio <= 0.5) EL.timerRingFg.classList.add('warning');

    if (seconds <= 5 && seconds > 0) SoundManager.playTimerWarning();
  };

  /* ── Country Hover Popup ── */
  const showCountryPopup = (countryId) => {
    clearTimeout(hoverTimeout);
    const data = COUNTRY_MAP.get(countryId);
    if (!data) { hideCountryPopup(); return; }
    EL.popupName.textContent    = data.name;
    EL.popupCapital.textContent = `🏛 ${data.capital}`;
    EL.popupFlag.textContent    = data.flag;
    EL.countryPopup.classList.add('visible');
    EL.countryPopup.setAttribute('aria-hidden', 'false');
  };

  const hideCountryPopup = () => {
    hoverTimeout = setTimeout(() => {
      EL.countryPopup.classList.remove('visible');
      EL.countryPopup.setAttribute('aria-hidden', 'true');
    }, 300);
  };

  /* ── Difficulty selection ── */
  const setDifficulty = (diff) => {
    EL.diffButtons.forEach(b => {
      const isActive = b.dataset.difficulty === diff;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive);
    });
    EL.diffSelectBtns.forEach(b => {
      const isActive = b.dataset.diff === diff;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive);
    });
  };

  /* ── End Screen ── */
  const showResults = ({ score, maxRounds, highScore, streakHistory }) => {
    const correct  = streakHistory.filter(r => r === 'correct').length;
    const wrong    = streakHistory.filter(r => r === 'wrong').length;
    const accuracy = Math.round((correct / maxRounds) * 100);

    EL.finalScore.textContent    = score;
    EL.statCorrect.textContent   = correct;
    EL.statWrong.textContent     = wrong;
    EL.statHighscore.textContent = highScore;
    EL.statAccuracy.textContent  = `${accuracy}%`;

    // Score circle animation
    const pct    = score / maxRounds;
    const offset = 326.7 * (1 - pct);
    setTimeout(() => {
      EL.scoreCircleFill.style.strokeDashoffset = offset;
      // Color by performance
      const color = pct >= 0.8 ? 'var(--success)' : pct >= 0.5 ? 'var(--accent)' : 'var(--error)';
      EL.scoreCircleFill.style.stroke = color;
    }, 200);

    // Result message
    const messages = [
      { min: 10, emoji: '🏆', title: 'Perfect Score!',    msg: 'You know the world like the back of your hand!' },
      { min: 8,  emoji: '⭐', title: 'Excellent!',        msg: 'Incredible geography skills!' },
      { min: 6,  emoji: '🌍', title: 'Well Done!',        msg: 'Solid knowledge of the world map.' },
      { min: 4,  emoji: '🧭', title: 'Good Attempt!',     msg: 'Keep exploring — you\'ll get better!' },
      { min: 0,  emoji: '🌱', title: 'Keep Learning!',    msg: 'The world is vast — keep exploring!' },
    ];
    const result = messages.find(m => score >= m.min) || messages[messages.length - 1];
    EL.endEmoji.textContent   = result.emoji;
    EL.resultTitle.textContent = result.title;
    EL.resultMessage.textContent = result.msg;

    // Achievements
    buildAchievements(score, streakHistory);

    showEnd();
    if (score === maxRounds) {
      setTimeout(() => ConfettiEngine.burst(160), 400);
      SoundManager.playVictory();
    }
  };

  const buildAchievements = (score, history) => {
    EL.achievementRow.innerHTML = '';
    const badges = [];

    if (score === 10) badges.push({ icon: '🏆', label: 'Perfect Score' });
    if (score >= 8)  badges.push({ icon: '⭐', label: 'Expert' });
    const streak3 = checkStreak(history, 3);
    if (streak3)     badges.push({ icon: '🔥', label: '3 in a row' });
    if (score === 0) badges.push({ icon: '🤣', label: 'Starting Over' });

    badges.forEach(b => {
      const el = document.createElement('div');
      el.className = 'achievement-badge';
      el.textContent = `${b.icon} ${b.label}`;
      EL.achievementRow.appendChild(el);
    });
  };

  const checkStreak = (history, n) => {
    let count = 0;
    for (const r of history) {
      if (r === 'correct') { count++; if (count >= n) return true; }
      else count = 0;
    }
    return false;
  };

  /* ── Theme toggle icons ── */
  const updateThemeIcon = (isDark) => {
    EL.darkModeToggle.setAttribute('aria-pressed', isDark);
    EL.themeIcon.innerHTML = isDark
      ? `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
      : `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  };

  const updateSoundIcon = (enabled) => {
    EL.soundToggle.setAttribute('aria-pressed', enabled);
    EL.soundIcon.innerHTML = enabled
      ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`
      : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
  };

  return {
    EL,
    setLoadingProgress,
    hideLoading,
    showApp,
    showStart,
    hideStart,
    showEnd,
    hideEnd,
    updateScore,
    updateRound,
    setPrompt,
    showHint,
    showFeedback,
    buildStreak,
    updateStreak,
    markStreakResult,
    updateHighScore,
    setTimer,
    showCountryPopup,
    hideCountryPopup,
    setDifficulty,
    showResults,
    updateThemeIcon,
    updateSoundIcon,
  };
})();

/* ================================================================
   GAME CONTROLLER
   Core game loop, state machine, and orchestration
   ================================================================ */
const GameController = (() => {
  // ── Game State ──
  const STATE = {
    IDLE:    'idle',
    PLAYING: 'playing',
    PAUSED:  'paused',
    ENDED:   'ended',
  };

  let state          = STATE.IDLE;
  let score          = 0;
  let round          = 0;
  let maxRounds      = 10;
  let currentCountry = null;   // CountryData
  let roundCountries = [];     // CountryData[] for this game
  let streakHistory  = [];     // 'correct' | 'wrong' | 'skip'
  let difficulty     = 'easy';
  let timerInterval  = null;
  let timerSeconds   = 0;
  let maxTimerSecs   = 15;
  let hintUsed       = false;
  let highScore      = StorageManager.getHighScore();
  let hintIndex      = 0;

  // Difficulty timer settings
  const TIMER_BY_DIFF = { easy: 20, medium: 15, hard: 10 };

  /* ── Init ── */
  const init = () => {
    MapController.init();
    setupEventListeners();
    applyTheme(StorageManager.getThemePref());
    UIController.updateSoundIcon(SoundManager.isEnabled());
    UIController.updateHighScore(highScore);
    simulateLoading();
  };

  /* ── Loading simulation ── */
  const simulateLoading = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 22 + 8;
      UIController.setLoadingProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          UIController.hideLoading(() => {
            UIController.showApp();
            UIController.showStart();
          });
        }, 300);
      }
    }, 120);
  };

  /* ── Event Listeners ── */
  const setupEventListeners = () => {
    // Map country click
    MapController.onCountryClick((countryId) => {
      if (state !== STATE.PLAYING) return;
      handleAnswer(countryId);
    });

    // Map country hover – show info popup
    MapController.onCountryHover((countryId) => {
      if (countryId) UIController.showCountryPopup(countryId);
      else           UIController.hideCountryPopup();
    });

    // Start button
    UIController.EL.startBtn.addEventListener('click', () => {
      SoundManager.playClick();
      startGame();
    });

    // Play Again
    UIController.EL.playAgainBtn.addEventListener('click', () => {
      SoundManager.playClick();
      ConfettiEngine.stop();
      UIController.hideEnd();
      startGame();
    });

    // Skip button
    UIController.EL.skipBtn.addEventListener('click', () => {
      if (state !== STATE.PLAYING) return;
      SoundManager.playClick();
      handleSkip();
    });

    // Hint button
    UIController.EL.hintBtn.addEventListener('click', () => {
      if (state !== STATE.PLAYING || !currentCountry) return;
      SoundManager.playClick();
      showHint();
    });

    // Share button
    UIController.EL.shareBtn.addEventListener('click', () => {
      SoundManager.playClick();
      shareScore();
    });

    // Sound toggle
    UIController.EL.soundToggle.addEventListener('click', () => {
      const newVal = !SoundManager.isEnabled();
      SoundManager.setEnabled(newVal);
      UIController.updateSoundIcon(newVal);
    });

    // Dark mode toggle
    UIController.EL.darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });

    // Difficulty buttons (start screen)
    UIController.EL.diffSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        difficulty = btn.dataset.diff;
        UIController.setDifficulty(difficulty);
        SoundManager.playClick();
      });
    });

    // Difficulty buttons (in-game bar)
    UIController.EL.diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        difficulty = btn.dataset.difficulty;
        UIController.setDifficulty(difficulty);
        SoundManager.playClick();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  };

  /* ── Keyboard Handler ── */
  const handleKeyboard = (e) => {
    switch (e.key) {
      case 'Escape':
        if (state === STATE.PLAYING) handleSkip();
        break;
      case 'h':
      case 'H':
        if (state === STATE.PLAYING) showHint();
        break;
    }
  };

  /* ── Theme ── */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    StorageManager.setThemePref(theme);
    UIController.updateThemeIcon(theme === 'dark');
  };

  /* ── Game Flow ── */

  const startGame = () => {
    // Reset state
    score          = 0;
    round          = 0;
    streakHistory  = [];
    hintIndex      = 0;
    maxTimerSecs   = TIMER_BY_DIFF[difficulty] || 15;

    // Build round list – ensure countries exist in SVG
    const pool = pickRandomCountries(maxRounds * 2, difficulty);
    const svgIds = new Set(MapController.getSVGCountryIds());
    roundCountries = pool.filter(c => svgIds.has(c.id)).slice(0, maxRounds);

    // Fallback: if not enough matches, fill with any from pool
    if (roundCountries.length < maxRounds) {
      const extras = pool.filter(c => !roundCountries.includes(c));
      roundCountries = [...roundCountries, ...extras].slice(0, maxRounds);
    }

    UIController.buildStreak(maxRounds);
    UIController.updateScore(0);
    UIController.updateRound(1, maxRounds);
    UIController.updateHighScore(highScore);
    UIController.EL.progressFill.style.width = '0%';
    MapController.clearHighlights();
    MapController.resetView();
    SoundManager.playStart();

    state = STATE.PLAYING;
    nextRound();
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      endGame();
      return;
    }

    currentCountry = roundCountries[round];
    hintUsed       = false;
    hintIndex      = 0;

    if (!currentCountry) {
      console.warn('GeoQuest: No country data for round', round);
      round++;
      nextRound();
      return;
    }

    UIController.updateRound(round + 1, maxRounds);
    UIController.setPrompt(currentCountry.name);
    UIController.updateStreak(round, '');
    MapController.clearHighlights();

    startTimer();
  };

  const handleAnswer = (countryId) => {
    if (!currentCountry || state !== STATE.PLAYING) return;
    stopTimer();

    const isCorrect = countryId === currentCountry.id;

    if (isCorrect) {
      score++;
      UIController.updateScore(score);
      UIController.showFeedback('correct', `✨ ${currentCountry.name}!`);
      MapController.highlightCountry(countryId, 'correct');
      SoundManager.playCorrect();
    } else {
      UIController.showFeedback('wrong', `It was ${currentCountry.name}`);
      MapController.highlightCountry(countryId, 'wrong');
      MapController.highlightCountry(currentCountry.id, 'target');
      SoundManager.playWrong();
    }

    const result = isCorrect ? 'correct' : 'wrong';
    streakHistory.push(result);
    UIController.markStreakResult(round, result);

    round++;
    setTimeout(() => {
      MapController.clearHighlights();
      nextRound();
    }, 1800);
  };

  const handleSkip = () => {
    stopTimer();
    streakHistory.push('wrong');
    UIController.showFeedback('wrong', `Skipped – it was ${currentCountry?.name || '?'}`);
    if (currentCountry) MapController.highlightCountry(currentCountry.id, 'target');
    UIController.markStreakResult(round, 'wrong');

    round++;
    setTimeout(() => {
      MapController.clearHighlights();
      nextRound();
    }, 1800);
  };

  const endGame = () => {
    state = STATE.ENDED;
    stopTimer();

    if (score > highScore) {
      highScore = score;
      StorageManager.setHighScore(highScore);
      UIController.updateHighScore(highScore);
    }

    UIController.showResults({
      score,
      maxRounds,
      highScore,
      streakHistory,
    });
  };

  /* ── Timer ── */
  const startTimer = () => {
    stopTimer();
    timerSeconds = maxTimerSecs;
    UIController.setTimer(timerSeconds, maxTimerSecs);

    timerInterval = setInterval(() => {
      timerSeconds--;
      UIController.setTimer(timerSeconds, maxTimerSecs);

      if (timerSeconds <= 0) {
        stopTimer();
        handleTimeOut();
      }
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
  };

  const handleTimeOut = () => {
    UIController.showFeedback('wrong', `⏰ Time's up! – ${currentCountry?.name || '?'}`);
    if (currentCountry) MapController.highlightCountry(currentCountry.id, 'target');
    streakHistory.push('wrong');
    UIController.markStreakResult(round, 'wrong');
    SoundManager.playWrong();

    round++;
    setTimeout(() => {
      MapController.clearHighlights();
      nextRound();
    }, 1800);
  };

  /* ── Hint ── */
  const showHint = () => {
    if (!currentCountry || hintUsed) return;
    const hints = currentCountry.hints;
    if (!hints || hints.length === 0) {
      UIController.showHint(`Continent: ${currentCountry.continent}`);
    } else {
      UIController.showHint(hints[hintIndex % hints.length]);
      hintIndex++;
    }
    hintUsed = true;
  };

  /* ── Share ── */
  const shareScore = () => {
    const text = `🌍 GeoQuest: I scored ${score}/${maxRounds} on ${difficulty} difficulty! Can you beat me? #GeoQuest`;
    if (navigator.share) {
      navigator.share({ title: 'GeoQuest', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        UIController.showFeedback('correct', 'Score copied to clipboard!');
      });
    }
  };

  return { init };
})();

/* ================================================================
   COUNTRY PATH DATA
   Simplified SVG paths for world map countries.
   Each path is a polygon/outline for major countries.
   Coordinates fit a 2000x1000 viewBox.
   ================================================================ */
function getCountryPaths() {
  // [ISO code, SVG path d attribute]
  // These are hand-crafted simplified outlines for the game
  // Coordinate system: x=0 is 180°W, x=2000 is 180°E, y=0 is 90°N, y=1000 is 90°S
  // Scale: x = (lon + 180) * (2000/360), y = (90 - lat) * (1000/180)
  // lon_to_x = (lon + 180) / 360 * 2000
  // lat_to_y = (90 - lat) / 180 * 1000

  const toX = (lon) => ((lon + 180) / 360 * 2000).toFixed(1);
  const toY = (lat) => ((90  - lat)  / 180 * 1000).toFixed(1);
  const pt  = (lon, lat) => `${toX(lon)},${toY(lat)}`;

  // Helper: polygon path from array of [lon, lat] pairs
  const poly = (pts) => `M ${pts.map(([lo, la]) => pt(lo, la)).join(' L ')} Z`;

  return [
    // ── NORTH AMERICA ──
    ['US', poly([[-124,49],[-96,49],[-84,46],[-83,42],[-76,44],[-67,47],[-67,45],[-71,41],[-75,38],[-76,35],[-81,31],[-82,29],[-87,30],[-90,29],[-94,30],[-97,26],[-97,28],[-101,26],[-104,29],[-111,31],[-117,32],[-120,34],[-124,41],[-124,48]])]),
    ['CA', poly([[-141,70],[-60,70],[-55,47],[-67,45],[-71,41],[-76,44],[-83,42],[-84,46],[-96,49],[-124,49],[-136,60],[-141,60]])],
    ['MX', poly([[-117,32],[-97,26],[-97,22],[-90,18],[-87,16],[-87,21],[-90,21],[-93,19],[-95,19],[-97,19],[-99,22],[-101,20],[-105,21],[-107,24],[-109,24],[-110,28],[-112,30],[-114,31],[-117,32]])],
    ['BR', poly([[-34,-5],[-35,-10],[-39,-15],[-40,-20],[-43,-23],[-44,-24],[-48,-26],[-51,-30],[-53,-33],[-56,-33],[-58,-30],[-57,-20],[-60,-15],[-60,-10],[-60,-5],[-55,2],[-51,4],[-50,2],[-46,0],[-44,2],[-40,0],[-38,0],[-35,-5]])],
    ['AR', poly([[-68,-22],[-65,-22],[-62,-22],[-58,-20],[-57,-20],[-56,-33],[-53,-33],[-65,-55],[-68,-55],[-70,-52],[-70,-48],[-72,-45],[-72,-42],[-70,-38],[-68,-35],[-68,-30],[-68,-25]])],
    ['CO', poly([[-77,8],[-72,12],[-67,12],[-67,6],[-67,2],[-70,2],[-70,-4],[-75,-1],[-77,0],[-77,4],[-80,8]])],
    ['VE', poly([[-73,12],[-63,10],[-60,8],[-61,6],[-64,4],[-67,6],[-67,12],[-72,12]])],
    ['PE', poly([[-81,-2],[-75,-1],[-70,-4],[-70,-11],[-68,-14],[-70,-18],[-75,-15],[-80,-9],[-81,-2]])],
    ['BO', poly([[-68,-14],[-64,-11],[-60,-15],[-57,-20],[-58,-20],[-62,-22],[-65,-22],[-68,-22],[-68,-18],[-70,-18],[-68,-14]])],
    ['CL', poly([[-68,-18],[-70,-18],[-72,-42],[-70,-52],[-68,-55],[-65,-55],[-68,-50],[-70,-45],[-70,-42],[-70,-38],[-68,-35],[-68,-30],[-68,-25],[-68,-22]])],
    ['PY', poly([[-58,-20],[-57,-20],[-62,-22],[-65,-22],[-64,-20],[-61,-20],[-58,-20]])],
    ['UY', poly([[-53,-33],[-56,-33],[-58,-30],[-57,-25],[-53,-33]])],
    ['EC', poly([[-80,-3],[-75,-1],[-75,-5],[-78,-5],[-80,-3]])],

    // ── EUROPE ──
    ['FR', poly([[2,51],[8,48],[8,44],[3,43],[-2,44],[-5,48],[-2,51],[2,51]])],
    ['DE', poly([[6,51],[15,51],[15,48],[12,47],[8,48],[8,51],[6,51]])],
    ['ES', poly([[-9,44],[3,43],[3,38],[0,36],[-6,36],[-9,37],[-9,44]])],
    ['IT', poly([[7,44],[15,48],[16,42],[14,38],[16,39],[15,37],[12,38],[9,41],[7,44]])],
    ['GB', poly([[-5,50],[0,51],[2,52],[0,58],[-3,59],[-6,58],[-5,52],[-4,50]])],
    ['PL', poly([[14,51],[24,51],[24,49],[23,52],[14,51]])],
    ['UA', poly([[22,52],[37,52],[37,46],[31,46],[28,45],[24,46],[22,49],[22,52]])],
    ['RO', poly([[22,48],[30,48],[30,44],[25,44],[22,46],[22,48]])],
    ['CZ', poly([[12,51],[18,51],[18,49],[12,49],[12,51]])],
    ['HU', poly([[16,48],[22,48],[22,46],[17,45],[16,48]])],
    ['SE', poly([[11,56],[24,68],[28,70],[24,70],[16,70],[12,58],[11,56]])],
    ['NO', poly([[4,58],[12,58],[28,70],[28,72],[8,72],[5,62],[4,58]])],
    ['FI', poly([[24,70],[28,70],[30,70],[30,64],[25,60],[24,64],[24,70]])],

    // ── RUSSIA (simplified) ──
    ['RU', poly([[30,70],[60,72],[100,72],[180,72],[180,50],[140,46],[130,42],[60,40],[40,45],[28,52],[30,70]])],

    // ── AFRICA ──
    ['EG', poly([[25,22],[34,22],[35,30],[32,32],[28,32],[25,30],[25,22]])],
    ['NG', poly([[3,7],[14,12],[15,11],[14,8],[8,4],[3,6],[3,7]])],
    ['ZA', poly([[17,-29],[32,-29],[33,-24],[32,-22],[30,-18],[28,-15],[25,-22],[22,-28],[17,-34],[17,-29]])],
    ['ET', poly([[36,15],[42,12],[44,12],[46,10],[42,8],[38,6],[34,8],[33,12],[36,15]])],
    ['KE', poly([[34,4],[42,4],[41,0],[37,-4],[34,-2],[33,2],[34,4]])],
    ['TZ', poly([[34,-2],[40,-2],[40,-10],[38,-10],[36,-8],[34,-4],[34,-2]])],
    ['MA', poly([[-6,36],[0,36],[-2,34],[-2,30],[-6,30],[-13,28],[-13,32],[-6,36]])],
    ['GH', poly([[0,11],[2,11],[3,6],[1,4],[-1,5],[0,11]])],
    ['SD', poly([[22,22],[38,22],[36,12],[34,12],[33,14],[32,12],[28,12],[24,16],[22,22]])],
    ['AO', poly([[12,-6],[24,-6],[24,-18],[18,-22],[14,-18],[12,-10],[12,-6]])],
    ['MZ', poly([[32,-10],[40,-10],[36,-18],[35,-26],[32,-26],[30,-22],[32,-18],[32,-10]])],
    ['ZM', poly([[22,-8],[32,-8],[32,-18],[28,-18],[22,-18],[22,-8]])],

    // ── ASIA ──
    ['CN', poly([[80,40],[122,40],[128,48],[108,54],[80,54],[80,40]])],
    ['IN', poly([[68,36],[78,36],[97,30],[97,8],[80,8],[70,22],[68,24],[68,36]])],
    ['SA', poly([[37,30],[55,22],[60,18],[50,14],[42,12],[37,22],[37,30]])],
    ['IR', poly([[44,39],[60,40],[62,36],[60,26],[56,22],[48,22],[45,30],[44,39]])],
    ['IQ', poly([[39,37],[48,37],[48,30],[46,28],[42,28],[38,34],[39,37]])],
    ['SY', poly([[36,37],[42,37],[42,34],[38,32],[36,34],[36,37]])],
    ['TR', poly([[26,42],[44,42],[40,36],[36,36],[28,38],[26,40],[26,42]])],
    ['PK', poly([[62,36],[74,36],[74,24],[68,23],[64,23],[62,30],[62,36]])],
    ['AF', poly([[60,38],[75,38],[74,36],[74,30],[68,30],[62,36],[60,38]])],
    ['KZ', poly([[50,52],[82,52],[80,42],[60,40],[52,44],[50,52]])],
    ['UZ', poly([[56,42],[70,42],[68,40],[64,38],[58,38],[56,40],[56,42]])],
    ['NP', poly([[80,30],[88,28],[82,26],[80,28],[80,30]])],
    ['VN', poly([[102,22],[108,22],[108,16],[106,10],[104,10],[102,14],[102,22]])],
    ['TH', poly([[98,20],[102,22],[102,14],[100,6],[98,6],[98,20]])],
    ['MY', poly([[100,6],[108,6],[118,6],[118,4],[104,2],[100,4],[100,6]])],
    ['ID', poly([[96,6],[108,6],[140,0],[120,-8],[106,-8],[96,0],[96,6]])],
    ['JP', poly([[128,44],[142,44],[142,32],[134,32],[128,38],[128,44]])],
    ['KR', poly([[126,38],[130,38],[130,34],[126,34],[126,38]])],
    ['MM', poly([[92,28],[100,28],[100,16],[96,14],[94,18],[92,24],[92,28]])],

    // ── OCEANIA ──
    ['AU', poly([[114,-22],[136,-16],[154,-26],[152,-38],[130,-38],[116,-34],[114,-22]])],
    ['NZ', poly([[166,-34],[178,-38],[172,-46],[168,-44],[166,-40],[166,-34]])],
  ];
}

/* ================================================================
   BOOTSTRAP
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Verify required data modules exist
  if (typeof COUNTRY_DATA === 'undefined') {
    console.error('GeoQuest: map-data.js failed to load. Game cannot start.');
    document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h2>Failed to load game data.</h2><p>Please ensure map-data.js is available.</p></div>';
    return;
  }

  GameController.init();
  console.info('🌍 GeoQuest initialized successfully');
});
