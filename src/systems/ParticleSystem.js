export class ParticleSystem {
  constructor(ctx) {
    this.ctx = ctx;
  }

  emitBurst(x, y, color, count = 12, spread = 180) {
    const particles = [];
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread,
        life: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2.8 + 1.2,
        color,
      });
    }
    return particles;
  }

  update(dt, particles) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  render(ctx, particles) {
    particles.forEach((particle) => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      ctx.globalAlpha = 1;
    });
  }
}
