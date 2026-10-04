export class ConsoleTerminal {
  constructor(rootElement) {
    this.root = rootElement;
    this.visible = false;
    this.commands = new Map();
    this.buffer = [];
    this.inputEl = null;
    this.outputEl = null;
    this.createShell();
  }

  createShell() {
    const terminal = document.createElement('div');
    terminal.className = 'terminal-shell hidden';
    terminal.innerHTML = `
      <div class="terminal-header">
        <span>root@cybergrid:~</span>
        <button class="terminal-close">×</button>
      </div>
      <div class="terminal-output"></div>
      <div class="terminal-input-row">
        <span>root@cybergrid:~$</span>
        <input type="text" aria-label="CLI command" />
      </div>
    `;

    this.root.appendChild(terminal);
    this.outputEl = terminal.querySelector('.terminal-output');
    this.inputEl = terminal.querySelector('input');

    terminal.querySelector('.terminal-close').addEventListener('click', () => this.hide());
    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const value = this.inputEl.value.trim();
      this.execute(value);
      this.inputEl.value = '';
    });
  }

  register(name, handler) {
    this.commands.set(name, handler);
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  show() {
    const shell = document.querySelector('.terminal-shell');
    if (!shell) return;
    shell.classList.remove('hidden');
    this.visible = true;
    setTimeout(() => this.inputEl?.focus(), 40);
  }

  hide() {
    const shell = document.querySelector('.terminal-shell');
    if (!shell) return;
    shell.classList.add('hidden');
    this.visible = false;
  }

  writeLine(line) {
    if (!this.outputEl) return;
    const el = document.createElement('div');
    el.textContent = line;
    this.outputEl.appendChild(el);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  execute(rawValue) {
    this.writeLine(`root@cybergrid:~$ ${rawValue}`);
    if (!rawValue) return;

    const [command, ...args] = rawValue.split(/\s+/);
    const handler = this.commands.get(command);
    if (!handler) {
      this.writeLine(`Command not found: ${command}`);
      return;
    }

    try {
      const result = handler(args, rawValue);
      if (result) {
        const lines = String(result).split('\n');
        lines.forEach((line) => this.writeLine(line));
      }
    } catch (error) {
      this.writeLine(`error: ${error.message}`);
    }
  }
}
