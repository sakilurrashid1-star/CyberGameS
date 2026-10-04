export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).delete(callback);
    if (this.listeners.get(event).size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, payload) {
    if (!this.listeners.has(event)) return;
    for (const callback of [...this.listeners.get(event)]) {
      callback(payload);
    }
  }
}

export class StateMachine {
  constructor(initialState = 'menu') {
    this.state = initialState;
    this.history = [initialState];
    this.transitions = new Map();
  }

  on(name, handler) {
    if (!this.transitions.has(name)) {
      this.transitions.set(name, new Set());
    }
    this.transitions.get(name).add(handler);
  }

  transition(name, payload = {}) {
    const previous = this.state;
    this.state = name;
    this.history.push(name);
    if (this.transitions.has(name)) {
      for (const handler of this.transitions.get(name)) {
        handler({ previous, current: name, payload });
      }
    }
  }
}

export class TickLoop {
  constructor(updateCallback, renderCallback = null) {
    this.update = updateCallback;
    this.render = renderCallback || (() => {});
    this.active = false;
    this.rafId = null;
    this.lastFrame = 0;
    this.delta = 0;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.lastFrame = performance.now();
    this.rafId = requestAnimationFrame((now) => this.run(now));
  }

  stop() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  run(now) {
    if (!this.active) return;
    this.delta = Math.min((now - this.lastFrame) / 1000, 0.033);
    this.lastFrame = now;
    this.update(this.delta);
    this.render();
    this.rafId = requestAnimationFrame((next) => this.run(next));
  }
}
