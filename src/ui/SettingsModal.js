export class SettingsModal {
  constructor() {
    this.enabled = false;
    this.panel = document.getElementById('settingsPanel');
    if (this.panel) {
      this.panel.addEventListener('click', () => this.close());
    }
  }

  open() {
    this.enabled = true;
    if (this.panel) this.panel.classList.add('active');
  }

  close() {
    this.enabled = false;
    if (this.panel) this.panel.classList.remove('active');
  }
}
