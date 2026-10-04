export class UpgradeTree {
  constructor() {
    this.state = {
      network: 0,
      cryptography: 0,
      response: 0,
      exploit: 0,
    };
  }

  loadState(data = {}) {
    this.state = {
      network: Number(data.network) || 0,
      cryptography: Number(data.cryptography) || 0,
      response: Number(data.response) || 0,
      exploit: Number(data.exploit) || 0,
    };
  }

  exportState() {
    return { ...this.state };
  }

  applyBranch(branchName) {
    if (!this.state[branchName]) return false;
    this.state[branchName] += 1;
    return true;
  }
}
