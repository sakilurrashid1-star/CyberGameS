/**
 * CodexModal.js
 * Interactive Cyber Codex reference guide with cheat sheets, OSI diagrams,
 * MITRE ATT&CK matrices, and command syntax guides.
 */
export class CodexModal {
  constructor(rootElement) {
    this.root = rootElement;
    this.visible = false;
    this.modalEl = null;
    this.createModal();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-codex hidden';
    modal.innerHTML = `
      <div class="modal-overlay-codex"></div>
      <div class="modal-window codex-window">
        <div class="codex-header">
          <h2>Cyber Academy Codex</h2>
          <p class="eyebrow">REFERENCE MATERIAL</p>
          <button class="close-btn" id="codex-close">✕</button>
        </div>

        <div class="codex-tabs">
          <button class="codex-tab active" data-tab="osi">OSI Model</button>
          <button class="codex-tab" data-tab="mitre">MITRE ATT&CK</button>
          <button class="codex-tab" data-tab="commands">Command Reference</button>
          <button class="codex-tab" data-tab="threats">Threat Profiles</button>
        </div>

        <div class="codex-content">
          <div id="osi-content" class="codex-tab-content active">
            <h3>OSI Model Layers</h3>
            <table class="codex-table">
              <tr>
                <th>Layer</th><th>Name</th><th>Examples</th><th>Attacks</th>
              </tr>
              <tr>
                <td>7</td><td>Application</td><td>HTTP, DNS, SSH</td><td>SQL Injection, XSS</td>
              </tr>
              <tr>
                <td>6</td><td>Presentation</td><td>SSL/TLS, Compression</td><td>Certificate Spoofing</td>
              </tr>
              <tr>
                <td>5</td><td>Session</td><td>NetBIOS, SOCKS</td><td>Session Hijacking</td>
              </tr>
              <tr>
                <td>4</td><td>Transport</td><td>TCP, UDP</td><td>SYN Flood, DDoS</td>
              </tr>
              <tr>
                <td>3</td><td>Network</td><td>IP, ICMP, Routing</td><td>IP Spoofing, Ping Flood</td>
              </tr>
              <tr>
                <td>2</td><td>Data Link</td><td>Ethernet, MAC</td><td>ARP Spoofing, MAC Flooding</td>
              </tr>
              <tr>
                <td>1</td><td>Physical</td><td>Cables, Signals</td><td>Physical Interception</td>
              </tr>
            </table>
          </div>

          <div id="mitre-content" class="codex-tab-content">
            <h3>MITRE ATT&CK Framework</h3>
            <p class="codex-description">A globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.</p>
            <div class="mitre-categories">
              <div class="mitre-card">
                <strong>Reconnaissance (TA0043)</strong>
                <p>Probing targets to gather information (scans, enumeration)</p>
              </div>
              <div class="mitre-card">
                <strong>Initial Access (TA0001)</strong>
                <p>Gaining entry (phishing, exploit, supply chain)</p>
              </div>
              <div class="mitre-card">
                <strong>Execution (TA0002)</strong>
                <p>Running malicious code (command line, scripts)</p>
              </div>
              <div class="mitre-card">
                <strong>Persistence (TA0003)</strong>
                <p>Maintaining access (backdoors, scheduled tasks)</p>
              </div>
              <div class="mitre-card">
                <strong>Exfiltration (TA0010)</strong>
                <p>Stealing data (compression, encryption, C2)</p>
              </div>
              <div class="mitre-card">
                <strong>Impact (TA0040)</strong>
                <p>Business disruption (encryption, deletion, DoS)</p>
              </div>
            </div>
          </div>

          <div id="commands-content" class="codex-tab-content">
            <h3>Essential Command Reference</h3>
            <div class="command-list">
              <div class="command-item">
                <code>nmap -sS -p 80,443 <subnet></code>
                <p>Network service discovery via TCP SYN scan</p>
              </div>
              <div class="command-item">
                <code>tcpdump -i eth0 -n "tcp port 80"</code>
                <p>Capture HTTP traffic on interface eth0</p>
              </div>
              <div class="command-item">
                <code>iptables -A INPUT -s <hostile_ip> -j DROP</code>
                <p>Block incoming traffic from a specific IP</p>
              </div>
              <div class="command-item">
                <code>openssl dgst -sha256 <file></code>
                <p>Generate SHA-256 hash for file verification</p>
              </div>
              <div class="command-item">
                <code>ps aux | grep <process></code>
                <p>List running processes and search for specific ones</p>
              </div>
              <div class="command-item">
                <code>netstat -tulnp</code>
                <p>Show all listening ports and associated processes</p>
              </div>
            </div>
          </div>

          <div id="threats-content" class="codex-tab-content">
            <h3>Threat Profile Reference</h3>
            <div class="threat-reference">
              <div class="threat-item">
                <h4 style="color: #ff5c72;">Ransomware</h4>
                <p><strong>Tactic:</strong> Impact, Persistence</p>
                <p><strong>Detection:</strong> File modification spike, encryption key generation, ransom note display</p>
              </div>
              <div class="threat-item">
                <h4 style="color: #f59e0b;">DDoS Botnet</h4>
                <p><strong>Tactic:</strong> Impact, Command and Control</p>
                <p><strong>Detection:</strong> Unusual traffic volume, repeated connection attempts, bandwidth saturation</p>
              </div>
              <div class="threat-item">
                <h4 style="color: #60a5fa;">SQL Injection</h4>
                <p><strong>Tactic:</strong> Exploitation, Collection</p>
                <p><strong>Detection:</strong> Malformed SQL in logs, database errors, unauthorized data access</p>
              </div>
              <div class="threat-item">
                <h4 style="color: #8b5cf6;">APT</h4>
                <p><strong>Tactic:</strong> Lateral Movement, Data Exfiltration</p>
                <p><strong>Detection:</strong> Privilege escalation, cross-system beaconing, encrypted tunnels</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.root.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('#codex-close').addEventListener('click', () => this.hide());
    modal.querySelector('.modal-overlay-codex').addEventListener('click', () => this.hide());

    const tabButtons = modal.querySelectorAll('.codex-tab');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  }

  switchTab(tabName) {
    const contents = this.modalEl.querySelectorAll('.codex-tab-content');
    const buttons = this.modalEl.querySelectorAll('.codex-tab');

    contents.forEach((c) => c.classList.remove('active'));
    buttons.forEach((b) => b.classList.remove('active'));

    document.getElementById(`${tabName}-content`)?.classList.add('active');
    this.modalEl.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  }

  show() {
    this.modalEl.classList.remove('hidden');
    this.visible = true;
  }

  hide() {
    this.modalEl.classList.add('hidden');
    this.visible = false;
  }
}
