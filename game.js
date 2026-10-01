const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PACKET = {
  MALWARE: "malware",
  SPYWARE: "spyware",
  UPDATE: "update",
  SCANNER: "scanner",
  DRONE: "drone",
  BOSS: "boss"
};

const state = {
  current: "menu",
  score: 0,
  level: 1,
  health: 100,
  bursts: 3,
  startTime: 0,
  elapsed: 0,
  lastSpawn: 0,
  bossActive: false,
  bossHp: 0,
  bossMaxHp: 0,
  bossTimer: 0,
  packets: [],
  particles: [],
  stars: []
};

const player = {
  x: 0,
  y: canvas.height - 45,
  width: 170,
  height: 20,
  boostActive: false,
  boostTimer: 0,
  boostDuration: 3
};

let mouseX = canvas.width / 2;
let animationFrame = null;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
}

function playTone(freq, duration, type = "sine", volume = 0.04) {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = freq;

  gainNode.gain.value = volume;
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  oscillator.stop(audioCtx.currentTime + duration);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function showMenu() {
  state.current = "menu";
  showScreen("menuScreen");
  loadLeaderboard();
}

function showHowToPlay() {
  showScreen("howToPlayScreen");
}

function showLeaderboard() {
  loadLeaderboard();
  showScreen("leaderboardScreen");
}

function startGame() {
  initAudio();
  playTone(440, 0.08, "triangle", 0.04);

  state.current = "playing";
  state.score = 0;
  state.level = 1;
  state.health = 100;
  state.bursts = 3;
  state.startTime = Date.now();
  state.elapsed = 0;
  state.lastSpawn = 0;
  state.bossActive = false;
  state.bossHp = 0;
  state.bossMaxHp = 0;
  state.bossTimer = 0;

  state.packets = [];
  state.particles = [];
  state.stars = [];

  for (let i = 0; i < 90; i++) {
    state.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 0.8 + 0.3
    });
  }

  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 42;
  player.boostActive = false;
  player.boostTimer = 0;

  updateHud();
  showScreen("gameScreen");
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (state.current !== "playing") return;
  state.current = "paused";
  showScreen("pauseScreen");
}

function resumeGame() {
  if (state.current !== "paused") return;
  state.current = "playing";
  showScreen("gameScreen");
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

function quitToMenu() {
  state.current = "menu";
  showScreen("menuScreen");
  loadLeaderboard();
}

function updateHud() {
  document.getElementById("scoreValue").textContent = state.score;
  document.getElementById("levelValue").textContent = state.level;
  document.getElementById("burstValue").textContent = state.bursts;

  const health = clamp(state.health, 0, 100);
  document.getElementById("healthFill").style.width = health + "%";
}

function gameLoop() {
  if (state.current !== "playing") return;

  updateGame();
  drawGame();

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

function updateGame() {
  state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  state.level = 1 + Math.floor(state.score / 350);

  if (state.level >= 3 && !state.bossActive && state.level % 3 === 0) {
    startBossWave();
  }

  player.x = clamp(mouseX - player.width / 2, 0, canvas.width - player.width);

  if (player.boostActive) {
    player.boostTimer -= 1 / 60;
    if (player.boostTimer <= 0) {
      player.boostActive = false;
      player.boostTimer = 0;
    }
  }

  const spawnDelay = Math.max(300, 1200 - state.level * 90);

  if (!state.bossActive && Date.now() - state.lastSpawn > spawnDelay) {
    spawnPacket();
    state.lastSpawn = Date.now();

    if (Math.random() < 0.18 + state.level * 0.014) {
      spawnPacket(true);
    }
  }

  if (state.bossActive) {
    state.bossTimer -= 1;
    if (state.bossTimer <= 0) {
      endBossWave();
    }
  }

  for (let i = state.packets.length - 1; i >= 0; i--) {
    const packet = state.packets[i];
    packet.y += packet.speed;

    if (packet.type === PACKET.BOSS || packet.type === PACKET.DRONE) {
      packet.x += packet.vx;
      if (packet.x < 20 || packet.x > canvas.width - packet.width - 20) packet.vx *= -1;
    }

    if (checkCollision(player, packet)) {
      if (packet.type === PACKET.UPDATE) {
        state.score += 20;
        state.health = Math.min(100, state.health + 18);
        createExplosion(packet.x, packet.y, "#5af0a1", 18);
        playTone(560, 0.08, "triangle", 0.03);
        state.packets.splice(i, 1);
      } else if (packet.type === PACKET.MALWARE) {
        if (player.boostActive) {
          state.score += 24;
          createExplosion(packet.x, packet.y, "#5ee7ff", 18);
          playTone(700, 0.07, "square", 0.03);
        } else {
          state.health -= 18;
          state.score += 8;
          createExplosion(packet.x, packet.y, "#ff5d72", 18);
          playTone(180, 0.12, "sawtooth", 0.05);
        }
        state.packets.splice(i, 1);
      } else if (packet.type === PACKET.SPYWARE) {
        if (player.boostActive) {
          state.score += 14;
          createExplosion(packet.x, packet.y, "#ffd166", 18);
          playTone(600, 0.07, "triangle", 0.03);
        } else {
          state.health -= 26;
          createExplosion(packet.x, packet.y, "#ffd166", 20);
          playTone(180, 0.14, "triangle", 0.04);
        }
        state.packets.splice(i, 1);
      } else if (packet.type === PACKET.SCANNER) {
        if (player.boostActive) {
          state.score += 32;
          createExplosion(packet.x, packet.y, "#b995ff", 22);
          playTone(780, 0.08, "square", 0.03);
        } else {
          state.health -= 34;
          createExplosion(packet.x, packet.y, "#b995ff", 24);
          playTone(160, 0.16, "sawtooth", 0.05);
        }
        state.packets.splice(i, 1);
      } else if (packet.type === PACKET.DRONE) {
        if (player.boostActive) {
          state.score += 42;
          createExplosion(packet.x, packet.y, "#5ee7ff", 24);
          playTone(820, 0.09, "square", 0.04);
        } else {
          state.health -= 42;
          createExplosion(packet.x, packet.y, "#b995ff", 26);
          playTone(150, 0.18, "sawtooth", 0.05);
        }
        state.packets.splice(i, 1);
      } else if (packet.type === PACKET.BOSS) {
        state.bossHp -= 1;
        createExplosion(packet.x, packet.y, "#ff5d72", 30);
        playTone(120, 0.08, "sawtooth", 0.05);

        if (state.bossHp <= 0) {
          state.score += 600;
          state.packets.splice(i, 1);
          endBossWave();
          playTone(900, 0.18, "triangle", 0.05);
        }
      }
    } else if (packet.y > canvas.height + 40 || packet.x < -50 || packet.x > canvas.width + 80) {
      state.packets.splice(i, 1);

      if (packet.type !== PACKET.UPDATE && packet.type !== PACKET.BOSS) {
        state.health -= packet.type === PACKET.SCANNER ? 16 : packet.type === PACKET.DRONE ? 20 : 10;
      }
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  for (let i = state.stars.length - 1; i >= 0; i--) {
    const star = state.stars[i];
    star.y += star.speed;

    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }

  if (state.health <= 0) {
    endGame();
  }

  updateHud();
}

function spawnPacket(forceSpecial = false) {
  let type = PACKET.MALWARE;

  if (state.level >= 4 && forceSpecial) {
    const specialPool = [PACKET.SCANNER, PACKET.DRONE];
    type = specialPool[Math.floor(Math.random() * specialPool.length)];
  } else {
    const roll = Math.random();

    if (roll < 0.42) type = PACKET.MALWARE;
    else if (roll < 0.7) type = PACKET.SPYWARE;
    else if (roll < 0.88) type = PACKET.UPDATE;
    else type = PACKET.SCANNER;
  }

  if (state.level <= 1 && type === PACKET.SCANNER) {
    type = PACKET.MALWARE;
  }

  const packet = {
    x: Math.random() * (canvas.width - 26),
    y: -30,
    width: 24,
    height: 24,
    type,
    speed: getPacketSpeed(type),
    vx: (Math.random() - 0.5) * 2.6
  };

  state.packets.push(packet);
}

function startBossWave() {
  if (state.bossActive) return;

  state.bossActive = true;
  state.bossTimer = 180;
  state.bossHp = 34 + state.level * 10;
  state.bossMaxHp = state.bossHp;

  const boss = {
    x: canvas.width / 2 - 60,
    y: -50,
    width: 120,
    height: 42,
    type: PACKET.BOSS,
    speed: 1.8,
    vx: 2.6
  };

  state.packets.push(boss);
  playTone(110, 0.22, "sawtooth", 0.05);
}

function endBossWave() {
  state.bossActive = false;
  state.bossHp = 0;
  state.bossMaxHp = 0;
  state.bossTimer = 0;
}

function getPacketSpeed(type) {
  switch (type) {
    case PACKET.MALWARE:
      return 3.2 + state.level * 0.22;
    case PACKET.SPYWARE:
      return 2.8 + state.level * 0.18;
    case PACKET.UPDATE:
      return 2.2 + state.level * 0.12;
    case PACKET.SCANNER:
      return 4 + state.level * 0.25;
    case PACKET.DRONE:
      return 4.2 + state.level * 0.3;
    case PACKET.BOSS:
      return 1.6 + state.level * 0.1;
    default:
      return 2.5;
  }
}

function checkCollision(playerRect, packet) {
  return (
    playerRect.x < packet.x + packet.width &&
    playerRect.x + playerRect.width > packet.x &&
    playerRect.y < packet.y + packet.height &&
    playerRect.y + playerRect.height > packet.y
  );
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPackets();
  drawBossMeter();
  drawPlayer();
  drawParticles();
}

function drawBackground() {
  ctx.fillStyle = "#060d15";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  state.stars.forEach((star) => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(94,231,255,0.7)";
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let x = 0; x < canvas.width; x += 32) {
    ctx.strokeStyle = "rgba(94,231,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 32) {
    ctx.strokeStyle = "rgba(94,231,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (state.bossActive) {
    ctx.fillStyle = "rgba(255, 93, 114, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawPackets() {
  state.packets.forEach((packet) => {
    let color = "#ffffff";

    if (packet.type === PACKET.MALWARE) color = "#ff5d72";
    if (packet.type === PACKET.SPYWARE) color = "#ffd166";
    if (packet.type === PACKET.UPDATE) color = "#5af0a1";
    if (packet.type === PACKET.SCANNER) color = "#b995ff";
    if (packet.type === PACKET.DRONE) color = "#6ec8ff";
    if (packet.type === PACKET.BOSS) color = "#ff475f";

    ctx.fillStyle = color;
    ctx.fillRect(packet.x, packet.y, packet.width, packet.height);

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.strokeRect(packet.x, packet.y, packet.width, packet.height);

    if (packet.type === PACKET.BOSS) {
      ctx.fillStyle = "#08141d";
      ctx.font = "bold 12px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText("BOSS", packet.x + packet.width / 2, packet.y + packet.height / 2);
    } else {
      ctx.fillStyle = "#08141d";
      ctx.font = "bold 11px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const label =
        packet.type === PACKET.MALWARE ? "M" :
        packet.type === PACKET.SPYWARE ? "S" :
        packet.type === PACKET.UPDATE ? "U" :
        packet.type === PACKET.DRONE ? "D" : "X";

      ctx.fillText(label, packet.x + packet.width / 2, packet.y + packet.height / 2);
    }
  });
}

function drawBossMeter() {
  if (!state.bossActive) return;

  const width = 420;
  const x = (canvas.width - width) / 2;
  const y = 18;

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, width, 18);

  const hpRatio = clamp(state.bossHp / state.bossMaxHp, 0, 1);
  ctx.fillStyle = "#ff5d72";
  ctx.fillRect(x, y, width * hpRatio, 18);

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.strokeRect(x, y, width, 18);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("BOSS SIGNAL // THREAT VECTOR", canvas.width / 2, 31);
}

function drawPlayer() {
  ctx.fillStyle = player.boostActive ? "#7ef5ff" : "#5ee7ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (player.boostActive) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(126,245,255,0.8)";
    ctx.lineWidth = 2;
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 94, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#061d2f";
  ctx.font = "bold 12px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FIREWALL", player.x + player.width / 2, player.y + player.height / 2);
}

function drawParticles() {
  state.particles.forEach((p) => {
    ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.life / 30)})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
}

function createExplosion(x, y, color, count) {
  const rgb = hexToRgb(color);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1 + Math.random() * 2.8;

    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      size: 3 + Math.random() * 4
    });
  }
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function endGame() {
  state.current = "gameover";
  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("finalLevel").textContent = state.level;
  document.getElementById("finalTime").textContent = state.elapsed + "s";
  document.getElementById("playerName").value = "";
  showScreen("gameOverScreen");
  playTone(100, 0.25, "sawtooth", 0.05);
}

function saveScore() {
  const name = document.getElementById("playerName").value.trim() || "Anonymous";
  const entry = {
    name,
    score: state.score,
    level: state.level,
    time: state.elapsed
  };

  const scores = JSON.parse(localStorage.getItem("cybergames_scores") || "[]");
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("cybergames_scores", JSON.stringify(scores.slice(0, 10)));

  showMenu();
}

function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("cybergames_scores") || "[]");
  const tbody = document.getElementById("leaderboardBody");
  const noScores = document.getElementById("noScores");

  tbody.innerHTML = "";

  if (!scores.length) {
    noScores.classList.remove("hidden");
    return;
  }

  noScores.classList.add("hidden");

  scores.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.score}</td>
      <td>${entry.level}</td>
      <td>${entry.time}s</td>
    `;
    tbody.appendChild(row);
  });
}

function activateBurst() {
  if (state.current !== "playing") return;
  if (state.bursts <= 0) return;
  if (player.boostActive) return;

  player.boostActive = true;
  player.boostTimer = player.boostDuration;
  state.bursts -= 1;
  updateHud();
  playTone(620, 0.1, "triangle", 0.04);
}

document.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;
  mouseX = relativeX * canvas.width;
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && state.current === "playing") {
    event.preventDefault();
    activateBurst();
  }
});

canvas.addEventListener("click", () => {
  if (state.current === "playing") {
    activateBurst();
  }
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

showMenu();
loadLeaderboard();
updateHud();
