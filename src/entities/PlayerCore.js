export class PlayerCore {
  constructor(config = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.width = config.width ?? 24;
    this.height = config.height ?? 30;
    this.speed = config.speed ?? 300;
    this.health = config.health ?? 100;
    this.maxHealth = config.maxHealth ?? 100;
    this.fireRate = config.fireRate ?? 0.18;
    this.fireCooldown = 0;
    this.damage = config.damage ?? 1;
    this.projectileSpeed = config.projectileSpeed ?? 720;
    this.shield = config.shield ?? 0;
    this.shielding = false;
    this.skillBoosts = {
      defense: 0,
      crypto: 0,
      response: 0,
      exploit: 0,
    };
  }

  update(dt, keys, width, height) {
    let moveX = 0;
    let moveY = 0;

    if (keys.w || keys.arrowup) moveY -= 1;
    if (keys.s || keys.arrowdown) moveY += 1;
    if (keys.a || keys.arrowleft) moveX -= 1;
    if (keys.d || keys.arrowright) moveX += 1;

    if (moveX || moveY) {
      const length = Math.hypot(moveX, moveY) || 1;
      this.x += (moveX / length) * this.speed * dt;
      this.y += (moveY / length) * this.speed * dt;
    }

    this.x = Math.min(Math.max(this.x, 18), width - 18);
    this.y = Math.min(Math.max(this.y, 24), height - 32);
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.shield = Math.max(0, this.shield - dt * 2.5);
  }

  applyDamage(amount) {
    const mitigation = this.shield > 0 ? 0.55 : 1;
    this.health = Math.max(0, this.health - amount * mitigation);
  }

  applyRepair(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      maxHealth: this.maxHealth,
      shield: this.shield,
      skillBoosts: this.skillBoosts,
    };
  }
}
