import { EventBus } from './EventBus.js';
import { StateMachine } from './StateMachine.js';
import { TickLoop } from './TickLoop.js';
import { PlayerCore } from '../entities/PlayerCore.js';
import { ThreatActor } from '../entities/ThreatActor.js';
import { Projectile } from '../entities/Projectile.js';
import { DropItem } from '../entities/DropItem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ThreatModel } from '../systems/ThreatModel.js';
import { HUD } from '../ui/HUD.js';
import { ConsoleTerminal } from '../ui/ConsoleTerminal.js';
import { UpgradeTree } from '../ui/UpgradeTree.js';
import { SettingsModal } from '../ui/SettingsModal.js';
import { threatProfiles, defaultThreatCatalog } from '../data/threatProfiles.js';
import { equipmentCatalog } from '../data/equipmentStats.js';
import { campaignLevels } from '../data/levelDescriptors.js';

export class GameEngine {
  constructor(rootElement, canvasId = 'gameCanvas') {
    this.root = rootElement;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.eventBus = new EventBus();
    this.state = new StateMachine('menu');
    this.audio = new AudioEngine();
    this.hud = new HUD();
    this.console = new ConsoleTerminal(this.root);
    this.upgradeTree = new UpgradeTree();
    this.settings = new SettingsModal();
    this.tickLoop = new TickLoop((dt) => this.update(dt), () => this.render());

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.config = {
      keys: {},
      mouse: { x: this.width / 2, y: this.height / 2 },
      score: 0,
      credits: 0,
      threatIdCounter: 1,
      maxPlayerHealth: 100,
      lastSpawnAt: 0,
      loopScale: 1,
      rngSeed: Date.now(),
    };

    this.player = null;
    this.projectiles = [];
    this.threats = [];
    this.pickups = [];
    this.particles = [];
    this.stars = [];
    this.waveManager = new WaveManager({ campaignLevels, threatProfiles, defaultThreatCatalog });
    this.threatModel = new ThreatModel({ profiles: threatProfiles, catalog: defaultThreatCatalog });
    this.combatSystem = new CombatSystem();
    this.particleSystem = new ParticleSystem(this.ctx);
    this.activeCampaign = null;

    this.bindEvents();
    this.initializeStarfield();
    this.loadPersistentUpgrades();
    this.attachConsoleCommands();
    this.hud.renderMainMenu();
    this.render();
  }

  initializeStarfield() {
    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 2.1 + 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 18 + 10,
    }));
  }

  loadPersistentUpgrades() {
    const saved = JSON.parse(localStorage.getItem('cybergame-upgrades') || '{}');
    this.upgradeTree.loadState(saved);
  }

  savePersistentUpgrades() {
    localStorage.setItem('cybergame-upgrades', JSON.stringify(this.upgradeTree.exportState()));
  }

  attachConsoleCommands() {
    this.console.register('help', () => {
      return [
        'Available commands:',
        'help',
        'status',
        'scan',
        'iptables -A DROP',
        'nmap -sV',
        'kill -9 <threat_id>',
        'isolate --subnet',
        'patch',
        'upgrade <branch>',
      ].join('\n');
    });

    this.console.register('status', () => {
      return `Operator: Delta | Health: ${this.player ? this.player.health.toFixed(0) : 0}% | Wave: ${this.waveManager.wave} | Score: ${this.config.score}`;
    });

    this.console.register('scan', () => {
      this.threats.forEach((threat) => {
        threat.scanned = true;
      });
      this.audio.playTone(440, 0.09, 'sawtooth', 0.05);
      return `Mission scan complete. ${this.threats.length} hostile nodes identified.`;
    });

    this.console.register('iptables -A DROP', () => {
      this.player.shield += 18;
      this.player.shielding = true;
      this.audio.playTone(180, 0.24, 'square', 0.07);
      return 'Firewall policy adjusted. Traffic filtration hardened.';
    });

    this.console.register('nmap -sV', () => {
      this.waveManager.scanSectors();
      return 'Recon sweep completed. Threat signatures have been mapped.';
    });

    this.console.register('kill -9', () => {
      if (!this.threats.length) return 'No threats in range.';
      const threat = this.threats[0];
      threat.health = 0;
      return `Threat ${threat.id} neutralized via direct termination.`;
    });

    this.console.register('isolate --subnet', () => {
      this.player.shield += 8;
      this.config.credits += 25;
      return 'Subnetwork isolated. Defensive perimeter expanded.';
    });

    this.console.register('patch', () => {
      this.player.health = Math.min(this.player ? this.player.maxHealth : 100, this.player.health + 18);
      return 'Patch cycle distributed to critical modules.';
    });

    this.console.register('upgrade', (args = []) => {
      const branch = args[0] || 'network';
      this.upgradeTree.applyBranch(branch);
      this.savePersistentUpgrades();
      return `Upgrade branch '${branch}' applied.`;
    });
  }

  bindEvents() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      this.config.keys[key] = true;
      if (key === '~') {
        this.console.toggle();
      }
      if (key === 'p') {
        if (this.state.state === 'playing') this.pause();
        else if (this.state.state === 'paused') this.resume();
      }
      if (key === ' ') {
        event.preventDefault();
        this.fireWeapon();
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      this.config.keys[key] = false;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.config.mouse.x = ((event.clientX - rect.left) / rect.width) * this.width;
      this.config.mouse.y = ((event.clientY - rect.top) / rect.height) * this.height;
    });

    this.canvas.addEventListener('mousedown', () => {
      if (this.state.state === 'playing') {
        this.fireWeapon();
      }
    });

    window.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    document.getElementById('startGameBtn')?.addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn')?.addEventListener('click', () => this.pause());
    document.getElementById('resumeBtn')?.addEventListener('click', () => this.resume());
    document.getElementById('quitBtn')?.addEventListener('click', () => this.quitToMenu());
    document.getElementById('restartBtn')?.addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn')?.addEventListener('click', () => this.quitToMenu());
    document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.hud.showLeaderboard());
    document.getElementById('instructionsBtn')?.addEventListener('click', () => this.hud.showInstructions());
    document.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', () => this.hud.hideAllPanels());
    });
  }

  startGame() {
    const profile = equipmentCatalog.core[0];
    this.player = new PlayerCore({
      x: this.width / 2,
      y: this.height - 72,
      width: 24,
      height: 30,
      speed: profile.speed,
      health: 100,
      maxHealth: 100,
      fireRate: profile.fireRate,
      projectileSpeed: profile.projectileSpeed,
      shield: 0,
    });

    this.config.score = 0;
    this.config.credits = 0;
    this.waveManager.reset();
    this.threats = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];
    this.state.transition('playing');
    this.hud.showGameView();
    this.tickLoop.start();
    this.audio.startBackgroundLoop();
    this.spawnWave();
  }

  pause() {
    if (this.state.state !== 'playing') return;
    this.state.transition('paused');
    this.hud.showPauseModal();
  }

  resume() {
    if (this.state.state !== 'paused') return;
    this.state.transition('playing');
    this.hud.hidePauseModal();
  }

  quitToMenu() {
    this.state.transition('menu');
    this.tickLoop.stop();
    this.hud.showMainMenu();
  }

  spawnWave() {
    const waveThreats = this.waveManager.generateWave(this.waveManager.wave, this.threats.length);
    for (const descriptor of waveThreats) {
      const threat = new ThreatActor({
        ...descriptor,
        id: `THREAT-${this.config.threatIdCounter++}`,
        x: Math.random() * (this.width - 80) + 40,
        y: -30,
        radius: descriptor.radius || 18,
        speed: descriptor.speed || 60,
        health: descriptor.health || 1,
        maxHealth: descriptor.maxHealth || descriptor.health || 1,
        damage: descriptor.damage || 12,
        pointValue: descriptor.points || 20,
      });
      this.threats.push(threat);
    }
  }

  fireWeapon() {
    if (!this.player || this.state.state !== 'playing') return;
    if (this.player.fireCooldown > 0) return;

    const dx = this.config.mouse.x - (this.player.x + this.player.width / 2);
    const dy = this.config.mouse.y - (this.player.y + this.player.height / 2);
    const length = Math.hypot(dx, dy) || 1;

    const projectile = new Projectile({
      x: this.player.x + this.player.width / 2,
      y: this.player.y,
      radius: 4,
      vx: (dx / length) * this.player.projectileSpeed,
      vy: (dy / length) * this.player.projectileSpeed,
      damage: this.player.damage,
      color: '#67e8f9',
      life: 1.2,
    });

    this.projectiles.push(projectile);
    this.player.fireCooldown = this.player.fireRate;
    this.audio.playTone(520, 0.06, 'square', 0.04);
    this.particles.push(...this.particleSystem.emitBurst(this.player.x + 10, this.player.y, '#67e8f9', 8, 110));
  }

  spawnPickup(x, y, kind = 'repair') {
    this.pickups.push(new DropItem({ x, y, radius: 10, kind }));
  }

  update(dt) {
    if (this.state.state !== 'playing' || !this.player) return;

    this.player.update(dt, this.config.keys, this.width, this.height);
    this.updateThreats(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.particleSystem.update(dt, this.particles);
    this.waveManager.update(dt, this);
    this.hud.update({
      score: this.config.score,
      credits: this.config.credits,
      wave: this.waveManager.wave,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      threats: this.threats.length,
    });

    if (this.player.health <= 0) {
      this.endMission();
    }
  }

  updateThreats(dt) {
    for (let i = this.threats.length - 1; i >= 0; i -= 1) {
      const threat = this.threats[i];
      threat.update(dt, this.player, this.width, this.height);

      if (threat.health <= 0) {
        this.config.score += threat.pointValue;
        this.config.credits += 15;
        this.particles.push(...this.particleSystem.emitBurst(threat.x, threat.y, threat.color, 24, 220));
        this.threats.splice(i, 1);
        if (Math.random() < 0.2) {
          this.spawnPickup(threat.x, threat.y, Math.random() < 0.5 ? 'repair' : 'shield');
        }
        continue;
      }

      const dx = this.player.x - threat.x;
      const dy = this.player.y - threat.y;
      const dist = Math.hypot(dx, dy);
      if (dist < threat.radius + 18) {
        const damage = threat.damage * 0.9;
        this.player.applyDamage(damage);
        this.audio.playTone(80, 0.14, 'sawtooth', 0.05);
        this.threats.splice(i, 1);
      }
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.update(dt);

      if (projectile.life <= 0 || projectile.x < -30 || projectile.x > this.width + 30 || projectile.y < -30 || projectile.y > this.height + 30) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (let j = this.threats.length - 1; j >= 0; j -= 1) {
        const threat = this.threats[j];
        const dx = projectile.x - threat.x;
        const dy = projectile.y - threat.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= projectile.radius + threat.radius) {
          threat.applyDamage(projectile.damage);
          this.projectiles.splice(i, 1);
          this.particles.push(...this.particleSystem.emitBurst(projectile.x, projectile.y, '#67e8f9', 10, 140));
          break;
        }
      }
    }
  }

  updatePickups(dt) {
    for (let i = this.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = this.pickups[i];
      pickup.update(dt);
      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      if (Math.hypot(dx, dy) < 22) {
        if (pickup.kind === 'repair') {
          this.player.applyRepair(22);
        }
        if (pickup.kind === 'shield') {
          this.player.shield = Math.min(100, this.player.shield + 35);
        }
        this.pickups.splice(i, 1);
      }
    }
  }

  endMission() {
    this.state.transition('gameover');
    this.tickLoop.stop();
    this.hud.showGameOver({ score: this.config.score, wave: this.waveManager.wave });
    this.audio.playTone(120, 0.45, 'sawtooth', 0.12);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawPickups();
    this.drawProjectiles();
    this.drawThreats();
    this.drawPlayer();
    this.particleSystem.render(this.ctx, this.particles);
    this.drawCrosshair();
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#071c2f');
    gradient.addColorStop(0.6, '#020b14');
    gradient.addColorStop(1, '#01070d');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = 'rgba(103, 232, 249, 0.16)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 28) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += 28) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    this.stars.forEach((star) => {
      this.ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawPlayer() {
    if (!this.player) return;

    const p = this.player;
    this.ctx.save();
    this.ctx.translate(p.x, p.y);

    if (p.shield > 0) {
      this.ctx.strokeStyle = 'rgba(103, 232, 249, 0.9)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#67e8f9';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -18);
    this.ctx.lineTo(14, 16);
    this.ctx.lineTo(0, 9);
    this.ctx.lineTo(-14, 16);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#0b1d29';
    this.ctx.fillRect(-4, 8, 8, 12);
    this.ctx.restore();
  }

  drawThreats() {
    this.threats.forEach((threat) => {
      this.ctx.save();
      this.ctx.translate(threat.x, threat.y);
      this.ctx.fillStyle = threat.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, threat.radius, 0, Math.PI * 2);
      this.ctx.fill();

      const barWidth = threat.radius * 2;
      this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
      this.ctx.fillRect(-threat.radius, -threat.radius - 12, barWidth, 5);
      this.ctx.fillStyle = '#e2f9ff';
      this.ctx.fillRect(-threat.radius, -threat.radius - 12, barWidth * (threat.health / threat.maxHealth), 5);
      this.ctx.restore();
    });
  }

  drawProjectiles() {
    this.projectiles.forEach((projectile) => {
      this.ctx.fillStyle = projectile.color;
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawPickups() {
    this.pickups.forEach((pickup) => {
      this.ctx.save();
      this.ctx.translate(pickup.x, pickup.y + Math.sin(pickup.pulse) * 4);
      this.ctx.fillStyle = pickup.kind === 'repair' ? '#6ee7b7' : '#93c5fd';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#031018';
      this.ctx.fillRect(-2, -6, 4, 12);
      this.ctx.fillRect(-6, -2, 12, 4);
      this.ctx.restore();
    });
  }

  drawCrosshair() {
    const x = this.config.mouse.x;
    const y = this.config.mouse.y;
    this.ctx.strokeStyle = 'rgba(103, 232, 249, 0.85)';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 9, y);
    this.ctx.lineTo(x + 9, y);
    this.ctx.moveTo(x, y - 9);
    this.ctx.lineTo(x, y + 9);
    this.ctx.stroke();
  }
}

export default GameEngine;
