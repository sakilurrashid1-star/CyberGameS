// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Game Configuration
const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 80,
        height: 20,
        speed: 6,
        initialHealth: 100,
        maxBoosts: 3
    },
    enemies: {
        initialCount: 3,
        maxPerLevel: 12,
        spawnInterval: 1500
    },
    packets: {
        size: 10,
        speeds: {
            malware: 4,
            spyware: 3,
            update: 2
        }
    }
};

// Game Variables
let gameState = GAME_STATE.MENU;
let gameScore = 0;
let gameLevel = 1;
let playerHealth = GAME_CONFIG.player.initialHealth;
let boostCount = GAME_CONFIG.player.maxBoosts;
let gameStartTime = 0;
let gameTime = 0;
let isPaused = false;

// Player Object
const player = {
    x: GAME_CONFIG.canvas.width / 2 - GAME_CONFIG.player.width / 2,
    y: GAME_CONFIG.canvas.height - 40,
    width: GAME_CONFIG.player.width,
    height: GAME_CONFIG.player.height,
    speed: GAME_CONFIG.player.speed,
    isBoostActive: false,
    boostDuration: 0,
    boostMaxDuration: 3
};

// Game Objects Arrays
let packets = [];
let particles = [];
let spawnTimer = 0;
let lastSpawnTime = 0;

// Mouse Position
let mouseX = GAME_CONFIG.canvas.width / 2;
let mouseY = 0;

// Packet Types
const PACKET_TYPES = {
    MALWARE: 'malware',      // Red - Harmful
    SPYWARE: 'spyware',      // Yellow - Dangerous
    UPDATE: 'update'         // Green - Beneficial
};

// Initialize Canvas
function initializeGame() {
    const container = document.querySelector('.game-area');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Adjust canvas if too small or too large
    if (canvas.width > 1200) canvas.width = 1200;
    if (canvas.height > 700) canvas.height = 700;

    // Update game config based on canvas
    GAME_CONFIG.canvas.width = canvas.width;
    GAME_CONFIG.canvas.height = canvas.height;

    // Reset player position
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 40;
}

// Start Game
function startGame() {
    gameState = GAME_STATE.PLAYING;
    gameScore = 0;
    gameLevel = 1;
    playerHealth = GAME_CONFIG.player.initialHealth;
    boostCount = GAME_CONFIG.player.maxBoosts;
    packets = [];
    particles = [];
    spawnTimer = 0;
    lastSpawnTime = 0;
    gameStartTime = Date.now();

    player.isBoostActive = false;
    player.boostDuration = 0;

    screenChange('gameScreen');
    initializeGame();
    gameLoop();
}

// Game Loop
function gameLoop() {
    if (gameState === GAME_STATE.PLAYING) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Update Game State
function update() {
    gameTime = Math.floor((Date.now() - gameStartTime) / 1000);

    // Update player position
    if (mouseX < player.width / 2) {
        player.x = 0;
    } else if (mouseX > canvas.width - player.width / 2) {
        player.x = canvas.width - player.width;
    } else {
        player.x = mouseX - player.width / 2;
    }

    // Update boost
    if (player.isBoostActive) {
        player.boostDuration -= 1/60;
        if (player.boostDuration <= 0) {
            player.isBoostActive = false;
            player.boostDuration = 0;
        }
    }

    // Spawn new packets
    const spawnRate = Math.max(800 - (gameLevel - 1) * 100, 400);
    if (Date.now() - lastSpawnTime > spawnRate && packets.length < (GAME_CONFIG.enemies.maxPerLevel * gameLevel / 5)) {
        spawnPacket();
        lastSpawnTime = Date.now();
    }

    // Update packets
    for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        packet.y += packet.speed;

        // Check collision with player
        if (checkCollision(player, packet)) {
            if (player.isBoostActive) {
                // Blocked by boost
                packets.splice(i, 1);
                handlePacketBlock(packet);
            } else if (packet.type === PACKET_TYPES.UPDATE) {
                // Beneficial packet
                packets.splice(i, 1);
                handleUpdatePacket(packet);
            } else if (packet.type === PACKET_TYPES.MALWARE) {
                // Malware blocked
                packets.splice(i, 1);
                handlePacketBlock(packet);
            } else if (packet.type === PACKET_TYPES.SPYWARE) {
                // Spyware hit
                packets.splice(i, 1);
                handleSpywareHit(packet);
            }
        } else if (packet.y > canvas.height) {
            // Packet escaped
            packets.splice(i, 1);
            if (packet.type === PACKET_TYPES.MALWARE) {
                playerHealth -= 10;
            } else if (packet.type === PACKET_TYPES.SPYWARE) {
                playerHealth -= 5;
            }
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Check game over
    if (playerHealth <= 0) {
        endGame();
    }

    // Update UI
    updateUI();

    // Increase level based on score
    const newLevel = Math.floor(gameScore / 500) + 1;
    if (newLevel > gameLevel) {
        gameLevel = newLevel;
    }
}

// Draw Game
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw packets
    for (const packet of packets) {
        drawPacket(packet);
    }

    // Draw particles
    for (const p of particles) {
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life / p.maxLife})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Draw player (firewall)
    drawPlayer();

    // Draw level warning if many threats
    if (packets.length > GAME_CONFIG.enemies.maxPerLevel * 0.7) {
        ctx.fillStyle = 'rgba(244, 67, 54, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('THREAT LEVEL CRITICAL!', canvas.width / 2, 30);
    }
}

// Draw Packet
function drawPacket(packet) {
    let color;
    switch (packet.type) {
        case PACKET_TYPES.MALWARE:
            color = '#FF5252';
            break;
        case PACKET_TYPES.SPYWARE:
            color = '#FFC107';
            break;
        case PACKET_TYPES.UPDATE:
            color = '#4CAF50';
            break;
    }

    // Draw packet body
    ctx.fillStyle = color;
    ctx.fillRect(packet.x, packet.y, packet.width, packet.height);

    // Draw packet border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(packet.x, packet.y, packet.width, packet.height);

    // Draw packet icon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (packet.type === PACKET_TYPES.MALWARE) {
        ctx.fillText('🦠', packet.x + packet.width / 2, packet.y + packet.height / 2);
    } else if (packet.type === PACKET_TYPES.SPYWARE) {
        ctx.fillText('👁', packet.x + packet.width / 2, packet.y + packet.height / 2);
    } else {
        ctx.fillText('✓', packet.x + packet.width / 2, packet.y + packet.height / 2);
    }
}

// Draw Player (Firewall)
function drawPlayer() {
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    
    if (player.isBoostActive) {
        gradient.addColorStop(0, '#00E5FF');
        gradient.addColorStop(1, '#00B8D4');
    } else {
        gradient.addColorStop(0, '#00BCD4');
        gradient.addColorStop(1, '#0097A7');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw border
    ctx.strokeStyle = player.isBoostActive ? '#00E5FF' : '#00BCD4';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Draw shield effect if boosted
    if (player.isBoostActive) {
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.5 * player.boostDuration / player.boostMaxDuration})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y, Math.max(player.width, player.height) + 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw player label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FIREWALL', player.x + player.width / 2, player.y + player.height / 2);
}

// Spawn Packet
function spawnPacket() {
    const types = Object.values(PACKET_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];

    const packet = {
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        type: randomType,
        speed: GAME_CONFIG.packets.speeds[randomType]
    };

    packets.push(packet);
}

// Check Collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Handle Packet Block
function handlePacketBlock(packet) {
    gameScore += 10;
    createExplosion(packet.x, packet.y, '#FF5252');
}

// Handle Update Packet
function handleUpdatePacket(packet) {
    gameScore += 5;
    playerHealth = Math.min(playerHealth + 15, GAME_CONFIG.player.initialHealth);
    createExplosion(packet.x, packet.y, '#4CAF50');
}

// Handle Spyware Hit
function handleSpywareHit(packet) {
    playerHealth -= 15;
    createExplosion(packet.x, packet.y, '#FFC107');
}

// Create Explosion Effect
function createExplosion(x, y, color) {
    const particleCount = 8;
    const rgb = hexToRgb(color);

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 3 + Math.random() * 2;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 30,
            maxLife: 30,
            size: 3 + Math.random() * 3,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b
        });
    }
}

// Hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameScore;
    document.getElementById('level').textContent = gameLevel;
    document.getElementById('boostCount').textContent = boostCount;

    const healthPercent = Math.max(0, (playerHealth / GAME_CONFIG.player.initialHealth) * 100);
    document.getElementById('healthBar').style.width = healthPercent + '%';
}

// End Game
function endGame() {
    gameState = GAME_STATE.GAME_OVER;

    document.getElementById('finalScore').textContent = gameScore;
    document.getElementById('finalLevel').textContent = gameLevel;
    document.getElementById('survivalTime').textContent = gameTime + 's';
    document.getElementById('playerName').value = '';

    screenChange('gameOverScreen');
}

// Save Score
function saveScore() {
    const playerName = document.getElementById('playerName').value || 'Anonymous';
    const score = {
        name: playerName,
        score: gameScore,
        level: gameLevel,
        time: gameTime,
        timestamp: new Date().toLocaleString()
    };

    let scores = JSON.parse(localStorage.getItem('cybergames_scores')) || [];
    scores.push(score);
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 100); // Keep top 100

    localStorage.setItem('cybergames_scores', JSON.stringify(scores));
    backToMenu();
}

// Pause Game
function pauseGame() {
    gameState = GAME_STATE.PAUSED;
    screenChange('pauseScreen');
}

// Resume Game
function resumeGame() {
    gameState = GAME_STATE.PLAYING;
    screenChange('gameScreen');
    gameLoop();
}

// Quit Game
function quitGame() {
    gameState = GAME_STATE.GAME_OVER;
    endGame();
}

// Screen Management
function screenChange(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Menu Functions
function backToMenu() {
    gameState = GAME_STATE.MENU;
    screenChange('mainMenu');
    loadLeaderboard();
}

function backToMenuFromPause() {
    gameState = GAME_STATE.MENU;
    screenChange('mainMenu');
}

function showInstructions() {
    screenChange('instructionsScreen');
}

function closeInstructions() {
    screenChange('mainMenu');
}

function showLeaderboard() {
    loadLeaderboard();
    screenChange('leaderboardScreen');
}

function closeLeaderboard() {
    screenChange('mainMenu');
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('cybergames_scores')) || [];
    const tbody = document.getElementById('leaderboardBody');
    const noScores = document.getElementById('noScores');

    tbody.innerHTML = '';

    if (scores.length === 0) {
        noScores.style.display = 'block';
        return;
    }

    noScores.style.display = 'none';

    scores.slice(0, 50).forEach((score, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
            <td>Level ${score.level}</td>
            <td>${score.time}s</td>
        `;
    });
}

// Event Listeners
document.addEventListener('mousemove', (e) => {
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
    }
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === GAME_STATE.PLAYING && boostCount > 0) {
        if (!player.isBoostActive) {
            player.isBoostActive = true;
            player.boostDuration = player.boostMaxDuration;
            boostCount--;
        }
        e.preventDefault();
    }
});

// Click to activate boost
document.getElementById('gameCanvas').addEventListener('click', () => {
    if (gameState === GAME_STATE.PLAYING && boostCount > 0) {
        if (!player.isBoostActive) {
            player.isBoostActive = true;
            player.boostDuration = player.boostMaxDuration;
            boostCount--;
        }
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    screenChange('mainMenu');
});

// Handle Resize
window.addEventListener('resize', () => {
    if (gameState === GAME_STATE.PLAYING) {
        initializeGame();
    }
});
