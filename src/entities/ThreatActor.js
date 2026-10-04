export class ThreatActor {
  constructor(config = {}) {
    this.id = config.id || `THREAT-${Math.random().toString(16).slice(2, 8)}`;
    this.type = config.type || 'ransomware';
    this.name = config.name || 'Ransomware';
    this.color = config.color || '#ff5c72';
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.radius = config.radius ?? 18;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 40;
    this.speed = config.speed ?? 80;
    this.health = config.health ?? 1;
    this.maxHealth = config.maxHealth ?? this.health;
    this.damage = config.damage ?? 12;
    this.pointValue = config.pointValue ?? 25;
    this.phase = Math.random() * Math.PI * 2;
    this.ai = config.ai || 'standard';
    this.scanned = false;
    this.threatModel = config.threatModel || null;
  }

  update(dt, player, width, height) {
    this.phase += dt * 2.4;
    this.x += this.vx * dt + Math.sin(this.phase) * 22 * dt;
    this.y += this.vy * dt;

    if (this.x < 20) this.x = 20;
    if (this.x > width - 20) this.x = width - 20;
    if (this.y > height + 40) {
      this.health = 0;
    }
  }

  applyDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
}
