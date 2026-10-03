const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  startGameBtn: document.getElementById('startGameBtn'),
  leaderboardBtn: document.getElementById('leaderboardBtn'),
  instructionsBtn: document.getElementById('instructionsBtn'),
  leaderboardList: document.getElementById('leaderboardList'),
  pauseBtn: document.getElementById('pauseBtn'),
  quitBtn: document.getElementById('quitBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  pauseMenuQuitBtn: document.getElementById('pauseMenuQuitBtn'),
  restartBtn: document.getElementById('restartBtn'),
  menuBtn: document.getElementById('menuBtn'),
  scoreDisplay: document.getElementById('scoreDisplay'),
  creditsDisplay: document.getElementById('creditsDisplay'),
  waveDisplay: document.getElementById('waveDisplay'),
  threatCount: document.getElementById('threatCount'),
  healthFill: document.getElementById('healthFill'),
  healthText: document.getElementById('healthText'),
  finishScore: document.getElementById('finalScore'),
  finishWave: document.getElementById('finalWave'),
  finishKills: document.getElementById('finalKills')
};

const state = {
  screen: 'mainMenu',
  running: false,
  paused: false,
  lastTime: 0,
  animationId: null,
  score: 0,
  credits: 0,
  wave: 1,
  kills: 0,
  threatSpawnTimer: 0,
  waveCooldown: 0,
  player: null,
  projectiles: [],
  threats: [],
  pickups: [],
  particles: [],
  stars: [],
  mouse: { x: canvas.width / 2, y: canvas.height / 2 },
  keys: {}
};

const threatCatalog = {
  ransomware: { name: 'Ransomware', color: '#ff5c72', radius: 16, speed: 75, hp: 2, damage: 18, points: 20 },
  botnet: { name: 'Botnet', color: '#f9b04c', radius: 15, speed: 96, hp: 2, damage: 16, points: 18 },
  ddos: { name: 'DDoS', color: '#7d8cff', radius: 18, speed: 110, hp: 3, damage: 22, points: 30 },
  phishing: { name: 'Phishing', color: '#6df7be', radius: 14, speed: 82, hp: 2, damage: 14, points: 16 },
  rootkit: { name: 'Rootkit', color: '#c97dff', radius: 20, speed: 120, hp: 4, damage: 28, points: 40 }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  const next = document.getElementById(screenId);
  if (next) next.classList.add('active');
  state.screen = screenId;
}

function createStars() {
  const total = 90;
  state.stars = [];
  for (let i = 0; i < total; i += 1) {
    state.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2
    });
  }
}

function createPlayer() {
  return {
    x: canvas.width / 2,
    y: canvas.height - 70,
    width: 24,
    height: 30,
    speed: 360,
    fireCooldown: 0,
    shieldTime: 0,
    health: 100
  };
}

function resetGame() {
  state.score = 0;
  state.credits = 0;
  state.wave = 1;
  state.kills = 0;
  state.threatSpawnTimer = 0;
  state.waveCooldown = 0;
  state.player = createPlayer();
  state.projectiles = [];
  state.threats = [];
  state.pickups = [];
  state.particles = [];
  state.mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  spawnWave(1, 6);
  updateHud();
}

function spawnThreat(typeOverride = null) {
  const entries = Object.keys(threatCatalog);
  const type = typeOverride || entries[Math.floor(Math.random() * entries.length)];
  const template = threatCatalog[type];

  const x = randomBetween(35, canvas.width - 35);
  const y = -24;
  const drift = randomBetween(-30, 30);

  state.threats.push({
    type,
    name: template.name,
    color: template.color,
    radius: template.radius,
    x,
    y,
    vx: drift,
    vy: template.speed + state.wave * 8,
    hp: template.hp + Math.floor(state.wave / 3),
    maxHp: template.hp + Math.floor(state.wave / 3),
    damage: template.damage,
    points: template.points,
    phase: Math.random() * Math.PI * 2
  });
}

function spawnWave(waveNumber, count) {
  for (let i = 0; i < count; i += 1) {
    spawnThreat();
  }
  if (waveNumber >= 4) {
    const bossChance = Math.random();
    if (bossChance > 0.65) {
      const boss = { ...threatCatalog.rootkit, type: 'rootkit', x: randomBetween(80, canvas.width - 80), y: -50, vx: randomBetween(-12, 12), vy: 52 + waveNumber * 6, hp: 7 + waveNumber, maxHp: 7 + waveNumber, damage: 30, points: 80, phase: 0 };
      state.threats.push(boss);
    }
  }
}

function spawnPickup(x, y, kind) {
  state.pickups.push({
    x,
    y,
    radius: 10,
    kind,
    pulse: 0
  });
}

function fireProjectile() {
  if (!state.running || state.paused || !state.player) return;
  if (state.player.fireCooldown > 0) return;

  const dx = state.mouse.x - (state.player.x + state.player.width / 2);
  const dy = state.mouse.y - (state.player.y + state.player.height / 2);
  const length = Math.hypot(dx, dy) || 1;

  const vx = (dx / length) * 720;
  const vy = (dy / length) * 720;

  state.projectiles.push({
    x: state.player.x + state.player.width / 2,
    y: state.player.y,
    radius: 4,
    vx,
    vy,
    damage: 1
  });

  state.player.fireCooldown = 0.18;
  emitParticles(state.player.x + state.player.width / 2, state.player.y, '#64ebff', 7, 180);
}

function emitParticles(x, y, color, count, spread = 110) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: randomBetween(-spread, spread) / 40,
      vy: randomBetween(-spread, spread) / 40,
      life: randomBetween(0.25, 0.7),
      size: randomBetween(1.4, 3),
      color
    });
  }
}

function updatePlayer(dt) {
  if (!state.player) return;

  let moveX = 0;
  let moveY = 0;

  if (state.keys.w || state.keys.arrowup) moveY -= 1;
  if (state.keys.s || state.keys.arrowdown) moveY += 1;
  if (state.keys.a || state.keys.arrowleft) moveX -= 1;
  if (state.keys.d || state.keys.arrowright) moveX += 1;

  if (moveX || moveY) {
    const len = Math.hypot(moveX, moveY) || 1;
    state.player.x += (moveX / len) * state.player.speed * dt;
    state.player.y += (moveY / len) * state.player.speed * dt;
  }

  state.player.x = clamp(state.player.x, 24, canvas.width - 24);
  state.player.y = clamp(state.player.y, 42, canvas.height - 30);
  state.player.fireCooldown = Math.max(0, state.player.fireCooldown - dt);

  if (state.player.shieldTime > 0) {
    state.player.shieldTime = Math.max(0, state.player.shieldTime - dt);
  }

  if (state.keys[' ']) {
    fireProjectile();
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    if (projectile.x < -20 || projectile.x > canvas.width + 20 || projectile.y < -20 || projectile.y > canvas.height + 20) {
      state.projectiles.splice(i, 1);
      continue;
    }

    for (let j = state.threats.length - 1; j >= 0; j -= 1) {
      const threat = state.threats[j];
      const dx = projectile.x - threat.x;
      const dy = projectile.y - threat.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= projectile.radius + threat.radius) {
        threat.hp -= projectile.damage;
        state.projectiles.splice(i, 1);
        emitParticles(projectile.x, projectile.y, '#64ebff', 10, 140);

        if (threat.hp <= 0) {
          state.kills += 1;
          state.score += threat.points;
          state.credits += 10;
          emitParticles(threat.x, threat.y, threat.color, 24, 220);

          if (Math.random() < 0.18) {
            const kind = Math.random() < 0.6 ? 'repair' : 'shield';
            spawnPickup(threat.x, threat.y, kind);
          }

          state.threats.splice(j, 1);
        }
        break;
      }
    }
  }
}

function updateThreats(dt) {
  const player = state.player;

  for (let i = state.threats.length - 1; i >= 0; i -= 1) {
    const threat = state.threats[i];
    threat.phase += dt * 3.5;
    threat.x += threat.vx * dt + Math.sin(threat.phase) * 18 * dt;
    threat.y += threat.vy * dt;

    if (threat.y > canvas.height + 30) {
      const damage = threat.damage;
      if (player.shieldTime > 0) {
        damage *= 0.45;
      }
      player.health = Math.max(0, player.health - damage);
      state.threats.splice(i, 1);
      emitParticles(threat.x, threat.y, '#ff5c72', 18, 200);
      continue;
    }

    const dx = player.x - threat.x;
    const dy = player.y - threat.y;
    const hitDistance = Math.hypot(dx, dy);

    if (hitDistance < threat.radius + 18) {
      const damage = threat.damage * 0.9;
      if (player.shieldTime > 0) {
        player.health = Math.max(0, player.health - damage * 0.4);
      } else {
        player.health = Math.max(0, player.health - damage);
      }
      emitParticles(threat.x, threat.y, '#ff5c72', 18, 200);
      state.threats.splice(i, 1);
    }
  }
}

function updatePickups(dt) {
  for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
    const pickup = state.pickups[i];
    pickup.pulse += dt * 5;
    pickup.y += 60 * dt;

    const dx = state.player.x - pickup.x;
    const dy = state.player.y - pickup.y;
    if (Math.hypot(dx, dy) < 22) {
      if (pickup.kind === 'repair') {
        state.player.health = Math.min(100, state.player.health + 22);
      } else if (pickup.kind === 'shield') {
        state.player.shieldTime = 5;
      }
      state.pickups.splice(i, 1);
      emitParticles(pickup.x, pickup.y, pickup.kind === 'repair' ? '#6df7be' : '#64ebff', 18, 160);
    }
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function updateWaveState() {
  if (state.threats.length === 0 && state.waveCooldown <= 0) {
    state.waveCooldown = 1.4;
    state.wave += 1;
    spawnWave(state.wave, 5 + state.wave * 2);
  }

  if (state.waveCooldown > 0) {
    state.waveCooldown -= 0.016;
  }
}

function updateHud() {
  ui.scoreDisplay.textContent = state.score;
  ui.creditsDisplay.textContent = state.credits;
  ui.waveDisplay.textContent = state.wave;
  ui.threatCount.textContent = state.threats.length;
  ui.healthText.textContent = `${Math.max(0, Math.ceil(state.player ? state.player.health : 0))}%`;
  ui.healthFill.style.width = `${Math.max(0, state.player ? state.player.health : 0)}%`;
}

function endMission() {
  state.running = false;
  state.paused = false;
  saveScore();
  ui.finishScore.textContent = state.score;
  ui.finishWave.textContent = state.wave;
  ui.finishKills.textContent = state.kills;
  showScreen('gameOverScreen');
}

function saveScore() {
  const key = 'cyber-defense-command-leaderboard';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ name: 'Delta', score: state.score, wave: state.wave });
  existing.sort((a, b) => b.score - a.score);
  const top = existing.slice(0, 8);
  localStorage.setItem(key, JSON.stringify(top));
  renderLeaderboard();
}

function renderLeaderboard() {
  const key = 'cyber-defense-command-leaderboard';
  const scores = JSON.parse(localStorage.getItem(key) || '[]');
  ui.leaderboardList.innerHTML = '';

  if (!scores.length) {
    ui.leaderboardList.innerHTML = '<div class="leader-row"><span class="rank">—</span><span class="name">No missions recorded</span><span class="score">0</span><span class="wave">0</span></div>';
    return;
  }

  scores.forEach((entry, index) => {
    const row = document.createElement('div');
    row.className = 'leader-row';
    row.innerHTML = `
      <span class="rank">${index + 1}</span>
      <span class="name">${entry.name}</span>
      <span class="score">${entry.score}</span>
      <span class="wave">W${entry.wave}</span>
    `;
    ui.leaderboardList.appendChild(row);
  });
}

function updateGame(dt) {
  if (!state.running || state.paused || !state.player) return;

  updatePlayer(dt);
  updateProjectiles(dt);
  updateThreats(dt);
  updatePickups(dt);
  updateParticles(dt);

  if (state.player.health <= 0) {
    endMission();
    return;
  }

  updateWaveState();
  updateHud();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#071d2d');
  gradient.addColorStop(1, '#02070d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(100, 235, 255, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  state.stars.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.shieldTime > 0) {
    ctx.strokeStyle = 'rgba(100, 235, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#64ebff';
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(14, 16);
  ctx.lineTo(0, 10);
  ctx.lineTo(-14, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0b1d29';
  ctx.fillRect(-4, 8, 8, 12);

  ctx.restore();
}

function drawProjectiles() {
  state.projectiles.forEach((p) => {
    ctx.fillStyle = '#64ebff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawThreats() {
  state.threats.forEach((threat) => {
    ctx.save();
    ctx.translate(threat.x, threat.y);
    ctx.fillStyle = threat.color;
    ctx.beginPath();
    ctx.arc(0, 0, threat.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(-threat.radius, -threat.radius - 12, threat.radius * 2, 5);
    ctx.fillStyle = '#ebf8ff';
    ctx.fillRect(-threat.radius, -threat.radius - 12, threat.radius * 2 * (threat.hp / threat.maxHp), 5);
    ctx.restore();
  });
}

function drawPickups() {
  state.pickups.forEach((pickup) => {
    const color = pickup.kind === 'repair' ? '#6df7be' : '#64ebff';
    ctx.save();
    ctx.translate(pickup.x, pickup.y + Math.sin(pickup.pulse) * 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#031018';
    ctx.fillRect(-2, -6, 4, 12);
    ctx.fillRect(-6, -2, 12, 4);
    ctx.restore();
  });
}

function drawParticles() {
  state.particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life * 1.8);
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  });
}

function drawCrosshair() {
  const { x, y } = state.mouse;
  ctx.strokeStyle = 'rgba(100, 235, 255, 0.8)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x + 9, y);
  ctx.moveTo(x, y - 9);
  ctx.lineTo(x, y + 9);
  ctx.stroke();
}

function render() {
  drawBackground();
  drawPickups();
  drawProjectiles();
  drawThreats();
  drawPlayer();
  drawParticles();
  drawCrosshair();
}

function gameLoop(timestamp) {
  if (!state.running) return;

  const dt = Math.min((timestamp - state.lastTime || 16.67) / 1000, 0.033);
  state.lastTime = timestamp;

  updateGame(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  state.running = true;
  state.paused = false;
  state.lastTime = 0;
  resetGame();
  showScreen('gameScreen');
  render();
  requestAnimationFrame(gameLoop);
}

function pauseMission() {
  if (!state.running) return;
  state.paused = true;
  showScreen('pauseScreen');
}

function resumeMission() {
  if (!state.running) return;
  state.paused = false;
  state.lastTime = 0;
  showScreen('gameScreen');
  requestAnimationFrame(gameLoop);
}

function quitMission() {
  state.running = false;
  state.paused = false;
  showScreen('mainMenu');
}

function bindEvents() {
  ui.startGameBtn.addEventListener('click', startGame);
  ui.pauseBtn.addEventListener('click', pauseMission);
  ui.quitBtn.addEventListener('click', quitMission);
  ui.resumeBtn.addEventListener('click', resumeMission);
  ui.pauseMenuQuitBtn.addEventListener('click', quitMission);
  ui.restartBtn.addEventListener('click', startGame);
  ui.menuBtn.addEventListener('click', () => showScreen('mainMenu'));
  ui.instructionsBtn.addEventListener('click', () => showScreen('instructionsScreen'));
  ui.leaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    showScreen('leaderboardScreen');
  });

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-close');
      showScreen(target === 'leaderboardScreen' ? 'mainMenu' : 'mainMenu');
    });
  });

  window.addEventListener('keydown', (event) => {
    event.preventDefault();
    const key = event.key.toLowerCase();
    state.keys[key] = true;
    if (event.code === 'Space') {
      fireProjectile();
    }
    if (key === 'p') {
      if (state.running && !state.paused) pauseMission();
      else if (state.running && state.paused) resumeMission();
    }
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    state.keys[key] = false;
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    state.mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });

  canvas.addEventListener('mousedown', () => {
    if (state.running && !state.paused) fireProjectile();
  });

  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

function init() {
  createStars();
  renderLeaderboard();
  showScreen('mainMenu');
  bindEvents();
  render();
}

init();
