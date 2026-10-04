export class Projectile {
  constructor(config = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.radius = config.radius ?? 4;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.damage = config.damage ?? 1;
    this.color = config.color || '#67e8f9';
    this.life = config.life ?? 1.2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }
}

export class DropItem {
  constructor(config = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.radius = config.radius ?? 10;
    this.kind = config.kind || 'repair';
    this.pulse = 0;
  }

  update(dt) {
    this.pulse += dt * 5;
    this.y += 60 * dt;
  }
}
