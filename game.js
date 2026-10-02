const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');

const state = {
  current: 'menu',
  width: window.innerWidth,
  height: window.innerHeight,
  keys: {},
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  bullets: [],
  enemies: [],
  particles: [],
  pickups: [],
  walls: [],
  isPointerDown: false,
  gameTime: 0,
  zone: {
    x: 0,
    y: 0,
    radius: 620,
    shrinkPerSecond: 1.8
  },
  stats: {
    kills: 0,
    damage: 0,
    matches: 0,
    wins: 0,
    headshots: 0,
    playtime: 0
  },
  player: null
};

const enemyColors = ['#ff5d5d', '#ffb347', '#7ef9ff', '#d9b3ff', '#7cffb2'];

function resizeCanvas() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = state.width;
  canvas.height = state.height;
  minimapCanvas.width = 150;
  minimapCanvas.height = 150;
  if (state.player) {
    state.player.x = clamp(state.player.x, 30, state.width - 30);
    state.player.y = clamp(state.player.y, 30, state.height - 30);
  }
  state.zone.x = state.width / 2;
  state.zone.y = state.height / 2;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

function showShop() {
  state.current = 'shop';
  showScreen('shopScreen');
  populateShop();
}

function showStats() {
  state.current = 'stats';
  showScreen('statsScreen');
  syncStats();
}

function showSettings() {
  state.current = 'menu';
  showScreen('mainMenu');
}

function backToMenu() {
  state.current = 'menu';
  showScreen('mainMenu');
}

function populateShop() {
  const items = [
    { name: 'Ranger AR', price: 300, damage: 26, ammo: 32 },
    { name: 'Blaster SMG', price: 500, damage: 18, ammo: 44 },
    { name: 'Burst Rifle', price: 750, damage: 34, ammo: 24 },
    { name: 'Med Kit', price: 220, heal: 25 },
    { name: 'Boost Pack', price: 350, speed: 1.2 },
    { name: 'Ammo Cache', price: 180, reserve: 50 }
  ];

  const shopGrid = document.getElementById('shopGrid');
  shopGrid.innerHTML = '';

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'shop-item';
    el.innerHTML = `
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-price">$${item.price}</div>
    `;
    el.addEventListener('click', () => {
      purchaseItem(item);
    });
    shopGrid.appendChild(el);
  });
}

function purchaseItem(item) {
  if (!state.player) return;
  if (item.damage) {
    state.player.damage = Math.max(state.player.damage, item.damage);
    state.player.weapon = item.name;
  }
  if (item.ammo) {
    state.player.ammo = Math.max(state.player.ammo, item.ammo);
  }
  if (item.heal) {
    state.player.health = Math.min(state.player.maxHealth, state.player.health + item.heal);
  }
  if (item.speed) {
    state.player.speed = Math.min(state.player.speed + item.speed, 7.5);
  }
  if (item.reserve) {
    state.player.reserveAmmo += item.reserve;
  }
  updateHud();
}

function syncStats() {
  document.getElementById('statMatches').textContent = state.stats.matches;
  document.getElementById('statWins').textContent = state.stats.wins;
  document.getElementById('statKillsTotal').textContent = state.stats.kills;
  document.getElementById('statHeadshots').textContent = state.stats.headshots;
  document.getElementById('statKD').textContent = ((state.stats.kills / Math.max(1, state.stats.matches)) || 0).toFixed(2);
  document.getElementById('statPlaytime').textContent = (state.stats.playtime / 3600).toFixed(1);
}

function createPlayer() {
  return {
    x: state.width / 2,
    y: state.height / 2,
    radius: 18,
    speed: 4.3,
    health: 100,
    maxHealth: 100,
    ammo: 30,
    reserveAmmo: 120,
    damage: 22,
    kills: 0,
    weapon: 'Ranger AR',
    angle: 0,
    cooldown: 0,
    dashCooldown: 0,
    alive: true,
    hitFlash: 0
  };
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0, y = 0;

  if (side === 0) {
    x = Math.random() * state.width;
    y = -40;
  } else if (side === 1) {
    x = state.width + 40;
    y = Math.random() * state.height;
  } else if (side === 2) {
    x = Math.random() * state.width;
    y = state.height + 40;
  } else {
    x = -40;
    y = Math.random() * state.height;
  }

  const enemy = {
    x,
    y,
    radius: 16 + Math.random() * 8,
    speed: 1.2 + Math.random() * 1.2,
    health: 45 + Math.random() * 35,
    maxHealth: 45 + Math.random() * 35,
    color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
    cooldown: 0,
    type: Math.random() > 0.65 ? 'ranged' : 'melee',
    direction: Math.random() * Math.PI * 2
  };

  state.enemies.push(enemy);
}

function spawnPickup(x, y, type = 'ammo') {
  state.pickups.push({
    x,
    y,
    radius: 12,
    type,
    pulse: Math.random() * Math.PI * 2
  });
}

function resetGame() {
  state.player = createPlayer();
  state.bullets = [];
  state.enemies = [];
  state.particles = [];
  state.pickups = [];
  state.gameTime = 0;
  state.zone = {
    x: state.width / 2,
    y: state.height / 2,
    radius: 620,
    shrinkPerSecond: 1.8
  };
  state.isPointerDown = false;

  for (let i = 0; i < 18; i++) {
    spawnEnemy();
  }

  updateHud();
}

function startGame() {
  state.current = 'playing';
  resetGame();
  state.stats.matches += 1;
  showScreen('gameScreen');
  cancelAnimationFrame(state.animationFrame);
  state.animationFrame = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (state.current !== 'playing') return;
  state.current = 'paused';
  showScreen('pauseScreen');
}

function resumeGame() {
  if (state.current !== 'paused') return;
  state.current = 'playing';
  showScreen('gameScreen');
  cancelAnimationFrame(state.animationFrame);
  state.animationFrame = requestAnimationFrame(gameLoop);
}

function endGame() {
  state.current = 'gameover';
  state.stats.matches += 0;
  state.stats.wins += 0;
  document.getElementById('finalRank').textContent = `${Math.max(1, state.enemies.length + 1)}`;
  document.getElementById('finalKills').textContent = state.player.kills;
  document.getElementById('finalDamage').textContent = Math.round(state.stats.damage);
  document.getElementById('finalTime').textContent = `${Math.floor(state.gameTime)}s`;
  showScreen('gameOverScreen');
}

function useAbility() {
  if (!state.player || state.current !== 'playing') return;
  if (state.player.dashCooldown > 0) return;
  state.player.dashCooldown = 4;
  state.player.speed = Math.min(state.player.speed + 2.5, 8.5);
  setTimeout(() => {
    if (state.player) state.player.speed = 4.3;
  }, 500);
}

function toggleInventory() {
  // Simple placeholder for inventory screen behavior
  if (state.current === 'playing') {
    state.player.reserveAmmo += 15;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 10);
    updateHud();
  }
}

function shoot() {
  if (!state.player || state.current !== 'playing') return;
  if (state.player.cooldown > 0) return;
  if (state.player.ammo <= 0) {
    if (state.player.reserveAmmo > 0) {
      state.player.ammo = Math.min(30, state.player.reserveAmmo);
      state.player.reserveAmmo = Math.max(0, state.player.reserveAmmo - state.player.ammo);
    }
    if (state.player.ammo <= 0) return;
  }

  const angle = Math.atan2(state.mouse.y - state.player.y, state.mouse.x - state.player.x);
  const bulletSpeed = 10;

  state.bullets.push({
    x: state.player.x + Math.cos(angle) * 25,
    y: state.player.y + Math.sin(angle) * 25,
    vx: Math.cos(angle) * bulletSpeed,
    vy: Math.sin(angle) * bulletSpeed,
    radius: 4,
    life: 90,
    damage: state.player.damage,
    owner: 'player'
  });

  state.player.ammo -= 1;
  state.player.cooldown = 0.14;
  createParticles(state.player.x, state.player.y, '#7ef9ff', 6);
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 20 + Math.random() * 15,
      color,
      size: 2 + Math.random() * 3
    });
  }
}

function updateHud() {
  if (!state.player) return;

  const healthPercent = (state.player.health / state.player.maxHealth) * 100;
  document.getElementById('healthFill').style.width = `${healthPercent}%`;
  document.getElementById('healthValue').textContent = Math.ceil(state.player.health);
  document.getElementById('ammoValue').textContent = state.player.ammo;
  document.getElementById('ammoReserve').textContent = state.player.reserveAmmo;
  document.getElementById('playersLeft').textContent = state.enemies.length + 1;
  document.getElementById('zoneInfo').textContent = state.zone.radius < 220 ? 'Final Circle' : 'Safe';
  document.getElementById('playersOnline').textContent = '100';
  document.getElementById('winRate').textContent = `${Math.min(99, Math.round((state.stats.wins / Math.max(1, state.stats.matches)) * 100))}%`;
  document.getElementById('totalKills').textContent = state.stats.kills;
}

function updatePlayer(delta) {
  if (!state.player) return;

  const moveX = (state.keys['d'] || state.keys['arrowright'] ? 1 : 0) - (state.keys['a'] || state.keys['arrowleft'] ? 1 : 0);
  const moveY = (state.keys['s'] || state.keys['arrowdown'] ? 1 : 0) - (state.keys['w'] || state.keys['arrowup'] ? 1 : 0);

  const length = Math.hypot(moveX, moveY) || 1;
  const dx = (moveX / length) * state.player.speed * delta * 60;
  const dy = (moveY / length) * state.player.speed * delta * 60;

  state.player.x = clamp(state.player.x + dx, 20, state.width - 20);
  state.player.y = clamp(state.player.y + dy, 20, state.height - 20);
  state.player.angle = Math.atan2(state.mouse.y - state.player.y, state.mouse.x - state.player.x);

  if (state.player.cooldown > 0) state.player.cooldown -= delta;
  if (state.player.dashCooldown > 0) state.player.dashCooldown -= delta;

  if (state.isPointerDown) shoot();
}

function updateEnemies(delta) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.1) {
      enemy.x += (dx / dist) * enemy.speed * delta * 60;
      enemy.y += (dy / dist) * enemy.speed * delta * 60;
    }

    if (dist < enemy.radius + state.player.radius + 8) {
      state.player.health -= 10 * delta;
      state.player.hitFlash = 0.2;
    }

    if (enemy.type === 'ranged' && dist < 320 && enemy.cooldown <= 0) {
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      state.bullets.push({
        x: enemy.x + Math.cos(angle) * 18,
        y: enemy.y + Math.sin(angle) * 18,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        radius: 4,
        life: 90,
        damage: 9,
        owner: 'enemy'
      });
      enemy.cooldown = 1.3 + Math.random() * 0.8;
    }

    enemy.cooldown -= delta;

    if (enemy.health <= 0) {
      createParticles(enemy.x, enemy.y, enemy.color, 18);
      state.enemies.splice(i, 1);
      state.player.kills += 1;
      state.stats.kills += 1;
      state.stats.damage += 30;
      if (Math.random() > 0.7) {
        spawnPickup(enemy.x, enemy.y, 'ammo');
      }
      if (Math.random() > 0.8) {
        spawnPickup(enemy.x, enemy.y, 'med');
      }
    }
  }
}

function updateBullets(delta) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    bullet.x += bullet.vx * delta * 60;
    bullet.y += bullet.vy * delta * 60;
    bullet.life -= delta * 60;

    if (bullet.owner === 'player') {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (distance(bullet, enemy) < bullet.radius + enemy.radius) {
          enemy.health -= bullet.damage;
          createParticles(bullet.x, bullet.y, '#7ef9ff', 8);
          state.bullets.splice(i, 1);
          break;
        }
      }
    } else {
      if (distance(bullet, state.player) < bullet.radius + state.player.radius) {
        state.player.health -= bullet.damage;
        createParticles(bullet.x, bullet.y, '#ff5d5d', 8);
        state.bullets.splice(i, 1);
      }
    }

    if (bullet.life <= 0 || bullet.x < -10 || bullet.x > state.width + 10 || bullet.y < -10 || bullet.y > state.height + 10) {
      state.bullets.splice(i, 1);
    }
  }
}

function updatePickups() {
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const pickup = state.pickups[i];
    const d = distance(pickup, state.player);
    if (d < pickup.radius + state.player.radius + 6) {
      if (pickup.type === 'ammo') {
        state.player.reserveAmmo += 20;
      } else if (pickup.type === 'med') {
        state.player.health = Math.min(state.player.maxHealth, state.player.health + 20);
      }
      state.pickups.splice(i, 1);
    }
  }
}

function updateParticles(delta) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * delta * 60;
    p.y += p.vy * delta * 60;
    p.life -= delta * 60;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function updateZone(delta) {
  state.zone.radius = Math.max(120, state.zone.radius - state.zone.shrinkPerSecond * delta * 60);
  const distFromCenter = Math.hypot(state.player.x - state.zone.x, state.player.y - state.zone.y);
  if (distFromCenter > state.zone.radius) {
    state.player.health -= 12 * delta;
  }
}

function updateGame(delta) {
  if (state.current !== 'playing') return;
  state.gameTime += delta;
  state.stats.playtime += delta;
  state.zone.x = state.width / 2;
  state.zone.y = state.height / 2;

  updatePlayer(delta);
  updateEnemies(delta);
  updateBullets(delta);
  updatePickups();
  updateParticles(delta);
  updateZone(delta);

  if (state.player.health <= 0) {
    state.player.alive = false;
    endGame();
  }

  if (state.enemies.length === 0 && state.current === 'playing') {
    state.player.kills += 1;
    state.stats.kills += 1;
    state.stats.wins += 1;
    endGame();
  }

  updateHud();

  if (Math.random() < 0.012 && state.enemies.length < 26) {
    spawnEnemy();
  }
}

function drawBackground() {
  ctx.fillStyle = '#071824';
  ctx.fillRect(0, 0, state.width, state.height);

  for (let x = 0; x < state.width; x += 32) {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.height);
    ctx.stroke();
  }

  for (let y = 0; y < state.height; y += 32) {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 110, 64, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(state.zone.x, state.zone.y, state.zone.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 110, 64, 0.08)';
  ctx.beginPath();
  ctx.arc(state.zone.x, state.zone.y, state.zone.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  ctx.fillStyle = p.hitFlash > 0 ? '#ff9999' : '#7ef9ff';
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0c2333';
  ctx.fillRect(10, -3, 20, 6);
  ctx.restore();

  if (p.hitFlash > 0) p.hitFlash -= 0.05;
}

function drawEnemies() {
  state.enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#041721';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.radius - 12, 40, 5);
    ctx.fillStyle = '#ff6a6a';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.radius - 12, 40 * (enemy.health / enemy.maxHealth), 5);
  });
}

function drawBullets() {
  state.bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.owner === 'player' ? '#7ef9ff' : '#ff7b54';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPickups() {
  state.pickups.forEach((pickup) => {
    const color = pickup.type === 'med' ? '#6aff7d' : '#ffea00';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawParticles() {
  state.particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
}

function drawMinimap() {
  minimapCtx.clearRect(0, 0, 150, 150);
  minimapCtx.fillStyle = '#06151d';
  minimapCtx.fillRect(0, 0, 150, 150);

  minimapCtx.strokeStyle = '#ff6a6a';
  minimapCtx.beginPath();
  minimapCtx.arc(75, 75, 65, 0, Math.PI * 2);
  minimapCtx.stroke();

  minimapCtx.fillStyle = '#7ef9ff';
  const px = (state.player.x / state.width) * 150;
  const py = (state.player.y / state.height) * 150;
  minimapCtx.beginPath();
  minimapCtx.arc(px, py, 4, 0, Math.PI * 2);
  minimapCtx.fill();

  minimapCtx.fillStyle = '#ff8a65';
  state.enemies.forEach((enemy) => {
    const ex = (enemy.x / state.width) * 150;
    const ey = (enemy.y / state.height) * 150;
    minimapCtx.beginPath();
    minimapCtx.arc(ex, ey, 3, 0, Math.PI * 2);
    minimapCtx.fill();
  });
}

function drawGame() {
  ctx.clearRect(0, 0, state.width, state.height);
  drawBackground();
  drawPickups();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawParticles();
  drawMinimap();
}

function gameLoop(timestamp) {
  if (state.current !== 'playing') return;
  const delta = 1 / 60;
  updateGame(delta);
  drawGame();
  state.animationFrame = requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  state.keys[event.key.toLowerCase()] = true;
  if (event.code === 'Space') {
    useAbility();
  }
  if (event.key === 'p' || event.key === 'P') {
    if (state.current === 'playing') pauseGame();
  }
});

window.addEventListener('keyup', (event) => {
  state.keys[event.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = event.clientX - rect.left;
  state.mouse.y = event.clientY - rect.top;
});

canvas.addEventListener('pointerdown', () => {
  state.isPointerDown = true;
  shoot();
});

canvas.addEventListener('pointerup', () => {
  state.isPointerDown = false;
});

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  useAbility();
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
showScreen('mainMenu');
updateHud();

function initializeGameUI() {
  document.getElementById('playersOnline').textContent = 100;
  document.getElementById('winRate').textContent = '0%';
  document.getElementById('totalKills').textContent = 0;
}

initializeGameUI();
