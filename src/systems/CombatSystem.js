import { threatProfiles } from '../data/threatProfiles.js';

export class CombatSystem {
  constructor() {
    this.strikeHistory = [];
  }

  resolveStrike({ attacker, defender, projectile = null }) {
    const baseDamage = projectile ? projectile.damage : attacker.damage || 1;
    const mitigated = defender.shield > 0 ? baseDamage * 0.55 : baseDamage;
    defender.health = Math.max(0, defender.health - mitigated);

    this.strikeHistory.push({
      attacker: attacker.id || attacker.name || 'system',
      defender: defender.id || defender.name || 'target',
      damage: mitigated,
      time: Date.now(),
    });

    return mitigated;
  }

  resolveThreatProfile(threatType) {
    return threatProfiles[threatType] || threatProfiles.ransomware;
  }
}
