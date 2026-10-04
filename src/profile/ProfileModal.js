/**
 * ProfileModal.js
 * Cadet Onboarding & Profile Selection Modal.
 * Triggers automatically if no active profile exists.
 */

import { PRESET_AVATARS, compressAndEncodeImage, drawAvatarPreview } from './AvatarPicker.js';

export class ProfileModal {
  constructor(rootElement, profileManager) {
    this.root = rootElement;
    this.profileManager = profileManager;
    this.visible = false;
    this.mode = 'select'; // 'select' or 'create'
    this.selectedAvatar = 'avatar-1';
    this.uploadedImage = null;
    this.onProfileSelected = null;
    this.modalEl = null;
    this.createModal();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-profile hidden';
    modal.innerHTML = `
      <div class="modal-overlay-profile"></div>
      <div class="modal-window profile-window">
        <!-- Select Mode -->
        <div id="profile-select-mode" class="profile-mode active">
          <div class="profile-header">
            <div class="cyber-logo">⚔️ CYBER ACADEMY</div>
            <p class="eyebrow danger">OPERATOR SELECTION</p>
            <h2>Select Your Profile</h2>
          </div>

          <div id="profiles-list" class="profiles-list"></div>

          <div class="profile-actions">
            <button class="primary-btn" id="new-profile-btn">+ New Cadet Profile</button>
          </div>
        </div>

        <!-- Create Mode -->
        <div id="profile-create-mode" class="profile-mode">
          <div class="profile-header">
            <div class="cyber-logo">⚔️ CYBER ACADEMY</div>
            <p class="eyebrow">CADET REGISTRATION PROTOCOL</p>
            <h2>Create Operator Profile</h2>
          </div>

          <form id="profile-form" class="profile-form">
            <!-- Personal Information Section -->
            <fieldset class="form-section">
              <legend>Personal Information</legend>

              <div class="form-group">
                <label for="profile-fullname">Full Name *</label>
                <input
                  type="text"
                  id="profile-fullname"
                  placeholder="e.g., Alice Johnson"
                  required
                  maxlength="128"
                />
              </div>

              <div class="form-group">
                <label for="profile-callsign">Security Handle / Callsign *</label>
                <input
                  type="text"
                  id="profile-callsign"
                  placeholder="e.g., cipher_ops"
                  required
                  maxlength="16"
                  pattern="[a-zA-Z0-9_-]{3,16}"
                  title="3-16 alphanumeric characters, hyphens, underscores"
                />
                <small>3-16 characters, alphanumeric only</small>
              </div>

              <div class="form-group">
                <label for="profile-email">Organization Email *</label>
                <input
                  type="email"
                  id="profile-email"
                  placeholder="e.g., alice@academy.cyber"
                  required
                  maxlength="128"
                />
              </div>

              <div class="form-group">
                <label for="profile-phone">Contact Phone Number</label>
                <input
                  type="tel"
                  id="profile-phone"
                  placeholder="e.g., +1 (555) 123-4567"
                  maxlength="20"
                />
              </div>
            </fieldset>

            <!-- Role & Clearance Section -->
            <fieldset class="form-section">
              <legend>Role & Clearance</legend>

              <div class="form-group">
                <label for="profile-role">Role Title</label>
                <select id="profile-role">
                  <option value="Cadet">Cadet</option>
                  <option value="Junior SOC Analyst">Junior SOC Analyst</option>
                  <option value="Network Forensics Trainee">Network Forensics Trainee</option>
                  <option value="Incident Response Specialist">Incident Response Specialist</option>
                  <option value="Security Engineer">Security Engineer</option>
                </select>
              </div>

              <div class="form-group">
                <label for="profile-clearance">Clearance Level</label>
                <select id="profile-clearance">
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP_SECRET">TOP SECRET</option>
                </select>
              </div>
            </fieldset>

            <!-- Avatar Selection Section -->
            <fieldset class="form-section">
              <legend>Avatar & Identity</legend>

              <div class="avatar-picker">
                <div class="avatar-grid" id="avatar-grid"></div>

                <div class="avatar-upload-section">
                  <label for="profile-avatar-upload" class="upload-label">
                    📸 Upload Custom ID Photo
                  </label>
                  <input
                    type="file"
                    id="profile-avatar-upload"
                    accept="image/*"
                    style="display: none;"
                  />
                  <small>Max 5MB. Formats: PNG, JPG, WebP</small>
                </div>
              </div>

              <div class="avatar-preview-container">
                <canvas id="avatar-preview" width="120" height="120"></canvas>
                <div class="preview-label" id="preview-label">Preview</div>
              </div>
            </fieldset>
          </form>

          <div class="profile-actions">
            <button class="primary-btn" id="create-profile-btn">Create Profile</button>
            <button class="secondary-btn" id="back-to-select-btn">Back</button>
          </div>
        </div>
      </div>
    `;

    this.root.appendChild(modal);
    this.modalEl = modal;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Select mode listeners
    document.getElementById('new-profile-btn').addEventListener('click', () => this.switchMode('create'));

    // Create mode listeners
    document.getElementById('back-to-select-btn').addEventListener('click', () => this.switchMode('select'));
    document.getElementById('create-profile-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.createNewProfile();
    });

    // Avatar picker listeners
    this.setupAvatarPicker();

    // File upload listener
    document.getElementById('profile-avatar-upload').addEventListener('change', (e) => {
      this.handleAvatarUpload(e);
    });
  }

  setupAvatarPicker() {
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';

    PRESET_AVATARS.forEach((avatar) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-btn';
      if (avatar.id === this.selectedAvatar) btn.classList.add('selected');
      btn.title = avatar.name;
      btn.innerHTML = `<span class="avatar-emoji">${avatar.emoji}</span>`;
      btn.style.borderColor = avatar.color;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectAvatar(avatar.id);
      });

      grid.appendChild(btn);
    });
  }

  selectAvatar(avatarId) {
    this.selectedAvatar = avatarId;
    this.uploadedImage = null;
    this.setupAvatarPicker();
    this.updatePreview();
  }

  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.uploadedImage = await compressAndEncodeImage(file);
      this.setupAvatarPicker(); // Update selection state
      this.updatePreview();
    } catch (error) {
      alert(`Avatar upload error: ${error.message}`);
    }
  }

  updatePreview() {
    const canvas = document.getElementById('avatar-preview');
    if (canvas) {
      const avatarData = this.uploadedImage || this.selectedAvatar;
      drawAvatarPreview(canvas, avatarData);
    }
  }

  switchMode(mode) {
    this.mode = mode;
    const selectMode = document.getElementById('profile-select-mode');
    const createMode = document.getElementById('profile-create-mode');

    if (mode === 'select') {
      selectMode.classList.add('active');
      createMode.classList.remove('active');
      this.renderProfilesList();
    } else {
      selectMode.classList.remove('active');
      createMode.classList.add('active');
      this.resetForm();
      this.updatePreview();
    }
  }

  renderProfilesList() {
    const listEl = document.getElementById('profiles-list');
    listEl.innerHTML = '';

    const profiles = this.profileManager.getAllProfiles();

    if (profiles.size === 0) {
      listEl.innerHTML = '<p class="no-profiles">No profiles yet. Create one to get started.</p>';
      return;
    }

    profiles.forEach((profile) => {
      const card = this.createProfileCard(profile);
      listEl.appendChild(card);
    });
  }

  createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';

    const avatar = profile.avatar || 'avatar-1';
    const preset = PRESET_AVATARS.find((a) => a.id === avatar);
    const avatarDisplay = preset ? preset.emoji : '👤';

    const stats = this.profileManager.getProfileStats(profile.id);

    card.innerHTML = `
      <div class="profile-card-avatar">${avatarDisplay}</div>
      <div class="profile-card-info">
        <div class="profile-card-name">${this.escape(profile.callsign)}</div>
        <div class="profile-card-role">${this.escape(profile.roleTitle)}</div>
        <div class="profile-card-stats">
          <span>XP: ${stats.totalXP}</span>
          <span>Labs: ${stats.labsCount}</span>
        </div>
      </div>
      <button class="profile-card-select-btn" data-profile-id="${profile.id}">Select</button>
      <button class="profile-card-delete-btn" data-profile-id="${profile.id}">🗑️</button>
    `;

    card.querySelector('.profile-card-select-btn').addEventListener('click', () => {
      this.selectProfile(profile.id);
    });

    card.querySelector('.profile-card-delete-btn').addEventListener('click', () => {
      if (confirm(`Delete profile "${profile.callsign}"? This cannot be undone.`)) {
        this.profileManager.deleteProfile(profile.id);
        this.renderProfilesList();
      }
    });

    return card;
  }

  resetForm() {
    document.getElementById('profile-form').reset();
    this.selectedAvatar = 'avatar-1';
    this.uploadedImage = null;
    this.setupAvatarPicker();
    this.updatePreview();
  }

  createNewProfile() {
    const form = document.getElementById('profile-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fullName = document.getElementById('profile-fullname').value.trim();
    const callsign = document.getElementById('profile-callsign').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const phoneNumber = document.getElementById('profile-phone').value.trim();
    const roleTitle = document.getElementById('profile-role').value;
    const clearanceLevel = document.getElementById('profile-clearance').value;

    try {
      const profile = this.profileManager.createProfile({
        fullName,
        callsign,
        email,
        phoneNumber,
        roleTitle,
        clearanceLevel,
        avatar: this.uploadedImage || this.selectedAvatar
      });

      this.profileManager.setActiveProfile(profile.id);
      this.hide();

      if (this.onProfileSelected) {
        this.onProfileSelected(profile);
      }
    } catch (error) {
      alert(`Error creating profile: ${error.message}`);
    }
  }

  selectProfile(profileId) {
    try {
      this.profileManager.setActiveProfile(profileId);
      const profile = this.profileManager.getActiveProfile();
      this.hide();

      if (this.onProfileSelected) {
        this.onProfileSelected(profile);
      }
    } catch (error) {
      alert(`Error selecting profile: ${error.message}`);
    }
  }

  show() {
    this.modalEl.classList.remove('hidden');
    this.visible = true;
    this.switchMode('select');
  }

  hide() {
    this.modalEl.classList.add('hidden');
    this.visible = false;
  }

  /**
   * Escape HTML special characters for safe display.
   * @private
   */
  escape(text) {
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
