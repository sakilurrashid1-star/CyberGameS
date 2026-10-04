/**
 * IDCardRenderer.js
 * Renders the holographic Operator ID Card badge.
 */

import { PRESET_AVATARS } from './AvatarPicker.js';

export class IDCardRenderer {
  /**
   * Create an operator ID card element.
   * @param {Object} profile - The operator profile
   * @returns {HTMLElement} The ID card element
   */
  static createIDCard(profile) {
    const card = document.createElement('div');
    card.className = 'id-card';

    const preset = PRESET_AVATARS.find((a) => a.id === profile.avatar);
    const borderColor = preset ? preset.color : '#67e8f9';
    const emoji = preset ? preset.emoji : '👤';

    card.innerHTML = `
      <div class="id-card-inner" style="border-color: ${borderColor};">
        <div class="id-card-header">
          <div class="id-card-logo">⚔️</div>
          <div class="id-card-title">CYBER ACADEMY</div>
          <div class="id-card-subtitle">OPERATOR CARD</div>
        </div>

        <div class="id-card-avatar">${emoji}</div>

        <div class="id-card-info">
          <div class="id-field">
            <span class="id-label">CALLSIGN:</span>
            <span class="id-value">${this.escape(profile.callsign)}</span>
          </div>
          <div class="id-field">
            <span class="id-label">NAME:</span>
            <span class="id-value">${this.escape(profile.fullName)}</span>
          </div>
          <div class="id-field">
            <span class="id-label">ROLE:</span>
            <span class="id-value">${this.escape(profile.roleTitle)}</span>
          </div>
          <div class="id-field">
            <span class="id-label">CLEARANCE:</span>
            <span class="id-value" style="color: ${this.getClearanceColor(profile.clearanceLevel)};">
              ${profile.clearanceLevel}
            </span>
          </div>
        </div>

        <div class="id-card-token">
          <span class="id-token-label">ID TOKEN:</span>
          <code class="id-token-value">${profile.operatorIDToken}</code>
        </div>

        <div class="id-card-footer">
          <div class="id-footer-line">Issued: ${this.formatDate(profile.createdAt)}</div>
          <div class="id-footer-line">Status: ACTIVE</div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Render the ID card to a canvas and download as PNG.
   * @param {Object} profile - The operator profile
   */
  static downloadIDCardAsPNG(profile) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const preset = PRESET_AVATARS.find((a) => a.id === profile.avatar);
    const borderColor = preset ? preset.color : '#67e8f9';
    const emoji = preset ? preset.emoji : '👤';

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Header
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ CYBER ACADEMY', canvas.width / 2, 50);

    ctx.font = 'bold 14px monospace';
    ctx.fillText('OPERATOR CARD', canvas.width / 2, 75);

    // Avatar
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, canvas.width / 2, 180);

    // Info fields
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#67e8f9';
    let y = 250;

    const fields = [
      [`CALLSIGN:`, profile.callsign],
      [`NAME:`, profile.fullName],
      [`ROLE:`, profile.roleTitle],
      [`CLEARANCE:`, profile.clearanceLevel],
      [`EMAIL:`, profile.email]
    ];

    fields.forEach(([label, value]) => {
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(label, 30, y);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(value, 150, y);
      y += 25;
    });

    // Token
    ctx.fillStyle = '#67e8f9';
    ctx.font = '10px monospace';
    ctx.fillText('ID TOKEN:', 30, y + 10);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '9px monospace';
    ctx.fillText(profile.operatorIDToken, 30, y + 30);

    // Footer
    y = canvas.height - 50;
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '10px monospace';
    ctx.fillText(`Issued: ${this.formatDate(profile.createdAt)}`, 30, y);
    ctx.fillText('Status: ACTIVE', 30, y + 20);

    // Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `operator-card-${profile.callsign}.png`;
    link.click();
  }

  /**
   * Get color for clearance level.
   * @private
   */
  static getClearanceColor(level) {
    const colors = {
      RESTRICTED: '#ff5c72',
      CONFIDENTIAL: '#fbbf24',
      SECRET: '#6ee7b7',
      TOP_SECRET: '#a78bfa'
    };
    return colors[level] || '#67e8f9';
  }

  /**
   * Format timestamp to readable date.
   * @private
   */
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Escape HTML characters.
   * @private
   */
  static escape(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (s) => map[s]);
  }
}
