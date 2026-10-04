/**
 * ConsoleTerminal.js
 * Enhanced terminal with curriculum-aligned guided command challenges.
 * Supports network reconnaissance, system administration, cryptography, and forensics commands.
 */
export class ConsoleTerminal {
  constructor(rootElement) {
    this.root = rootElement;
    this.visible = false;
    this.commands = new Map();
    this.buffer = [];
    this.inputEl = null;
    this.outputEl = null;
    this.currentModule = null;
    this.commandHints = new Map();
    this.createShell();
  }

  createShell() {
    const terminal = document.createElement('div');
    terminal.className = 'terminal-shell hidden';
    terminal.innerHTML = `
      <div class="terminal-header">
        <div class="terminal-header-left">
          <span>root@cybergrid:~</span>
          <span class="terminal-module" id="terminal-module"></span>
        </div>
        <button class="terminal-close">×</button>
      </div>
      <div class="terminal-output"></div>
      <div class="terminal-hint" id="terminal-hint" style="display:none;"></div>
      <div class="terminal-input-row">
        <span>root@cybergrid:~$</span>
        <input type="text" aria-label="CLI command" autocomplete="off" />
      </div>
    `;

    this.root.appendChild(terminal);
    this.outputEl = terminal.querySelector('.terminal-output');
    this.inputEl = terminal.querySelector('input');

    terminal.querySelector('.terminal-close').addEventListener('click', () => this.hide());
    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const value = this.inputEl.value.trim();
        this.execute(value);
        this.inputEl.value = '';
      } else if (event.key === 'Tab') {
        event.preventDefault();
        this.showHint();
      }
    });

    this.setupCurriculumCommands();
  }

  /**
   * Register a custom command with a handler.
   * @param {String} name - Command name
   * @param {Function} handler - Command handler function
   */
  register(name, handler) {
    this.commands.set(name, handler);
  }

  /**
   * Set up guided command challenges aligned with the curriculum modules.
   */
  setupCurriculumCommands() {
    // Module 1: Network commands
    this.commandHints.set('nmap', {
      description: 'Network mapping and service discovery',
      usage: 'nmap -sS -p 80,443 <subnet>',
      output: 'Starting Nmap scan at 127.0.0.1...\nPort 80/tcp open http\nPort 443/tcp open https\nScan complete.'
    });

    this.commandHints.set('tcpdump', {
      description: 'Packet capture and analysis',
      usage: 'tcpdump -i eth0 -n "tcp port 80"',
      output: '10:23:45.123456 192.168.1.100 > 203.0.113.1: TCP 443 > 52100: S 1234567890 win 65535\n10:23:45.234567 203.0.113.1 > 192.168.1.100: TCP 52100 > 443: S 9876543210 ack 1234567891 win 32768\n10:23:45.345678 192.168.1.100 > 203.0.113.1: TCP 443 > 52100: . ack 9876543211 win 65535'
    });

    this.commandHints.set('iptables', {
      description: 'Linux firewall rules and packet filtering',
      usage: 'iptables -A INPUT -s <hostile_ip> -j DROP',
      output: 'Rule added: DROP traffic from hostile IP.\nRules flushed and reloaded successfully.'
    });

    // Module 2: Web and SQL commands
    this.commandHints.set('curl', {
      description: 'HTTP client for testing web endpoints',
      usage: 'curl -X POST https://target.local/login --data "user=admin&pass=test"',
      output: 'HTTP/1.1 200 OK\nContent-Type: application/json\n{"status": "authenticated"}'
    });

    this.commandHints.set('grep', {
      description: 'Text search utility for log analysis',
      usage: 'grep -R "csrf\|xss\|injection" /var/www/app',
      output: 'app/auth.php: Missing CSRF token validation\napp/search.php: Unescaped user input in SQL query'
    });

    // Module 3: Malware and system commands
    this.commandHints.set('ps', {
      description: 'Process list and suspicious process detection',
      usage: 'ps aux | grep suspicious',
      output: 'root      2847  2.5  1.2  45382 12048 ?  S  10:23 /usr/bin/suspicious-daemon --persist\nroot      3102  0.0  0.0  1234   567 pts/0 S+ 10:24 grep suspicious'
    });

    this.commandHints.set('netstat', {
      description: 'Network connections and listening ports',
      usage: 'netstat -tulnp',
      output: 'tcp 0 0 0.0.0.0:22 0.0.0.0:* LISTEN 1234/sshd\ntcp 0 0 192.168.1.100:53418 203.0.113.5:443 ESTABLISHED 2847/suspicious-daemon'
    });

    this.commandHints.set('kill', {
      description: 'Terminate processes by PID',
      usage: 'kill -9 <pid>',
      output: 'Process 2847 terminated successfully.'
    });

    // Module 4: Cryptography commands
    this.commandHints.set('openssl', {
      description: 'Cryptographic toolkit for hashing and encryption',
      usage: 'openssl dgst -sha256 <file>',
      output: 'SHA2-256(payload.bin) = a7f9e8c1b6d4e2f3a0c5b8d1e6f9a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'
    });

    this.commandHints.set('hashcat', {
      description: 'Password hash cracking utility',
      usage: 'hashcat -m 0 /tmp/hashes.txt /usr/share/wordlists/rockyou.txt',
      output: 'Initializing backend runtime for device 0...\na7f9e8c1b6d4e2f3a0c5b8d1e6f9a2c: password123\n1 hashes cracked out of 5.'
    });

    // Module 5: Forensics commands
    this.commandHints.set('journalctl', {
      description: 'System journal and audit log inspection',
      usage: 'journalctl -u ssh --since "1 hour ago"',
      output: '10:15:23 host sshd[1234]: Failed password for admin from 203.0.113.1 port 52100 ssh2\n10:15:45 host sshd[1245]: Accepted publickey for admin from 203.0.113.1 port 52100 ssh2\n10:20:12 host sshd[1256]: Connection reset by 203.0.113.1 port 52100 [preauth]'
    });

    this.commandHints.set('volatility', {
      description: 'Memory forensics and volatile data extraction',
      usage: 'volatility -f memory.raw --profile=Win10 pslist',
      output: 'Offset (V) Name Pid ParentPid Module Base\n--- explorer.exe 2847 1024 0x3f0000\n--- svchost.exe 1234 508 0x2a0000\n--- suspicious.exe 3102 2847 0x5a0000'
    });

    // Register help command
    this.register('help', () => {
      const moduleHint = this.currentModule ? ` (Module: ${this.currentModule})` : '';
      return [
        `Welcome to Cyber Defense Command Terminal${moduleHint}`,
        '',
        'Available command categories:',
        '[Network] nmap, tcpdump, iptables',
        '[Web] curl, grep',
        '[Malware] ps, netstat, kill',
        '[Crypto] openssl, hashcat',
        '[Forensics] journalctl, volatility',
        '',
        'Tip: Press TAB to see a hint for the current module command.'
      ].join('\n');
    });
  }

  /**
   * Set the active curriculum module to guide command suggestions.
   * @param {String} moduleId - The module ID (e.g., 'module-1')
   */
  setModule(moduleId) {
    this.currentModule = moduleId;
    const moduleEl = document.getElementById('terminal-module');
    if (moduleEl) {
      const moduleNames = {
        'module-1': '[Network Defense]',
        'module-2': '[Web Security]',
        'module-3': '[Malware Analysis]',
        'module-4': '[Cryptography]',
        'module-5': '[Incident Response]'
      };
      moduleEl.textContent = moduleNames[moduleId] || '';
      moduleEl.style.color = '#6ee7b7';
      moduleEl.style.marginLeft = '12px';
    }
  }

  /**
   * Display a hint for the current module's primary command.
   */
  showHint() {
    const hintEl = document.getElementById('terminal-hint');
    if (!hintEl) return;

    const moduleCommands = {
      'module-1': 'nmap',
      'module-2': 'curl',
      'module-3': 'ps',
      'module-4': 'openssl',
      'module-5': 'journalctl'
    };

    const cmd = moduleCommands[this.currentModule] || 'help';
    const hint = this.commandHints.get(cmd);

    if (hint) {
      hintEl.innerHTML = `<strong>Hint:</strong> ${hint.description}<br/><code>${hint.usage}</code>`;
      hintEl.style.display = 'block';
      setTimeout(() => {
        hintEl.style.display = 'none';
      }, 5000);
    }
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
    el.className = 'terminal-line';
    this.outputEl.appendChild(el);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  writeHTML(html) {
    if (!this.outputEl) return;
    const el = document.createElement('div');
    el.innerHTML = html;
    el.className = 'terminal-line';
    this.outputEl.appendChild(el);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  /**
   * Execute a terminal command.
   * @param {String} rawValue - Raw command input from the user
   */
  execute(rawValue) {
    this.writeLine(`root@cybergrid:~$ ${rawValue}`);
    if (!rawValue) return;

    const [command, ...args] = rawValue.split(/\s+/);
    const handler = this.commands.get(command);

    // Check for curriculum command hints
    if (this.commandHints.has(command)) {
      const hint = this.commandHints.get(command);
      this.writeLine(`[${command.toUpperCase()}] ${hint.description}`);
      this.writeLine(hint.output);
      return;
    }

    if (!handler) {
      this.writeLine(`${command}: command not found. Type 'help' for available commands.`);
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
