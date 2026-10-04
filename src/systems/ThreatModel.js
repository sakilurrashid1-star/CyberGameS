export class ThreatModel {
  constructor({ profiles, catalog }) {
    this.profiles = profiles;
    this.catalog = catalog;
    this.metrics = new Map();
  }

  inspect(threatType) {
    const profile = this.profiles[threatType] || this.profiles.ransomware;
    return {
      attackVector: profile.attackVector,
      detection: profile.detection,
      evasion: profile.evasion,
      objective: profile.objective,
      severity: profile.severity,
    };
  }

  benchmark() {
    return this.catalog.map((type) => ({
      type,
      profile: this.profiles[type],
    }));
  }
}
