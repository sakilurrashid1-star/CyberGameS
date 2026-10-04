import { threatProfiles } from '../data/threatProfiles.js';

export class WaveManager {
  constructor({ campaignLevels, threatProfiles: profiles, defaultThreatCatalog }) {
    this.campaignLevels = campaignLevels;
    this.profiles = profiles;
    this.catalog = defaultThreatCatalog;
    this.wave = 1;
    this.internalClock = 0;
  }

  reset() {
    this.wave = 1;
    this.internalClock = 0;
  }

  generateWave(waveNumber, existingThreatCount = 0) {
    const level = this.campaignLevels[Math.min(this.campaignLevels.length - 1, waveNumber - 1)] || this.campaignLevels[0];
    const burst = [];
    const requested = Math.min(8 + waveNumber * 2, 20);

    for (let i = 0; i < requested; i += 1) {
      const threatType = this.catalog[(waveNumber + i) % this.catalog.length];
      const profile = this.profiles[threatType];
      burst.push({
        type: threatType,
        name: profile.name,
        color: profile.color,
        radius: profile.radius,
        speed: profile.speed + waveNumber * 4,
        health: profile.health + waveNumber,
        maxHealth: profile.health + waveNumber,
        damage: profile.damage + Math.round(waveNumber * 0.8),
        points: profile.points + waveNumber * 3,
        ai: profile.ai || 'standard',
        threatModel: profile,
      });
    }

    return burst;
  }

  update(dt, engine) {
    this.internalClock += dt;
    if (engine.threats.length === 0) {
      this.wave += 1;
      engine.spawnWave();
    }
  }

  scanSectors() {
    this.wave += 1;
  }
}
