/**
 * BriefingModal.js
 * Displays pre-incident mission briefing with CVE details, threat actor information,
 * attack vector explanation, and mitigation strategy before each wave.
 */
export class BriefingModal {
  constructor(rootElement) {
    this.root = rootElement;
    this.visible = false;
    this.currentBriefing = null;
    this.onConfirm = null;
    this.modalEl = null;
    this.createModal();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-briefing hidden';
    modal.innerHTML = `
      <div class="modal-overlay-briefing"></div>
      <div class="modal-window briefing-window">
        <div class="briefing-header">
          <div class="briefing-title-section">
            <p class="eyebrow danger">INCIDENT ALERT</p>
            <h2 id="briefing-title">Mission Briefing</h2>
            <p class="briefing-cve" id="briefing-cve">CVE-2024-XXXX</p>
          </div>
          <button class="close-btn" id="briefing-close">✕</button>
        </div>

        <div class="briefing-content">
          <div class="briefing-section">
            <h3>Attack Vector</h3>
            <p id="briefing-vector" class="briefing-text"></p>
          </div>

          <div class="briefing-section">
            <h3>Threat Explanation</h3>
            <p id="briefing-explanation" class="briefing-text"></p>
          </div>

          <div class="briefing-section">
            <h3>Mitigation Strategy</h3>
            <p id="briefing-mitigation" class="briefing-text"></p>
          </div>

          <div class="briefing-diagram">
            <canvas id="threat-diagram" width="560" height="240"></canvas>
          </div>
        </div>

        <div class="briefing-actions">
          <button class="primary-btn" id="briefing-confirm">Acknowledge & Deploy</button>
          <button class="secondary-btn" id="briefing-abort">Defer Mission</button>
        </div>
      </div>
    `;

    this.root.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('#briefing-close').addEventListener('click', () => this.hide());
    modal.querySelector('#briefing-confirm').addEventListener('click', () => this.confirm());
    modal.querySelector('#briefing-abort').addEventListener('click', () => this.hide());
    modal.querySelector('.modal-overlay-briefing').addEventListener('click', () => this.hide());
  }

  /**
   * Display the briefing modal with CVE and threat details.
   * @param {Object} briefingData - The briefing object from levelDescriptors
   * @param {Function} onConfirm - Callback when user acknowledges the briefing
   */
  show(briefingData, onConfirm = null) {
    this.currentBriefing = briefingData;
    this.onConfirm = onConfirm;

    document.getElementById('briefing-title').textContent = briefingData.title || 'Incident Briefing';
    document.getElementById('briefing-cve').textContent = `CVE ID: ${briefingData.cve || 'N/A'}`;
    document.getElementById('briefing-vector').textContent = briefingData.vector || '';
    document.getElementById('briefing-explanation').textContent = briefingData.explanation || '';
    document.getElementById('briefing-mitigation').textContent = briefingData.mitigation || '';

    this.drawThreatDiagram(briefingData);

    this.modalEl.classList.remove('hidden');
    this.visible = true;
  }

  hide() {
    this.modalEl.classList.add('hidden');
    this.visible = false;
  }

  confirm() {
    if (this.onConfirm) this.onConfirm();
    this.hide();
  }

  /**
   * Draw a simple threat actor and attack flow diagram on the canvas.
   * @param {Object} briefingData - The briefing data with attack information
   */
  drawThreatDiagram(briefingData) {
    const canvas = document.getElementById('threat-diagram');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(103, 232, 249, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw attacker node (left)
    ctx.fillStyle = '#ff5c72';
    ctx.beginPath();
    ctx.arc(80, 120, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ATTACKER', 80, 125);

    // Draw attack vector arrow
    ctx.strokeStyle = '#ff5c72';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(110, 120);
    ctx.lineTo(200, 120);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw vector label
    ctx.fillStyle = '#ff5c72';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(briefingData.cve || 'Exploit', 155, 110);

    // Draw target node (middle)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.rect(220, 90, 80, 60);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SERVICE', 260, 115);
    ctx.fillText('LAYER', 260, 130);

    // Draw defender node (right)
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(420, 120, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEFENSE', 420, 125);

    // Draw defense arrow
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(330, 120);
    ctx.lineTo(390, 120);
    ctx.stroke();

    // Draw mitigation steps
    ctx.fillStyle = '#67e8f9';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1. Detect threat', 20, 180);
    ctx.fillText('2. Isolate host', 120, 180);
    ctx.fillText('3. Block traffic', 220, 180);
    ctx.fillText('4. Patch/Harden', 320, 180);

    // Draw MITRE ATT&CK label
    ctx.fillStyle = 'rgba(103, 232, 249, 0.6)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Attack mapped to MITRE ATT&CK', canvas.width - 10, canvas.height - 10);
  }
}
