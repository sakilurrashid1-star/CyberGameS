export const equipmentCatalog = {
  core: [
    {
      id: 'core-laser',
      name: 'Pulse Laser Array',
      speed: 340,
      fireRate: 0.18,
      projectileSpeed: 760,
      damage: 1,
      description: 'High-velocity rail laser for rapid threat suppression.',
    },
    {
      id: 'core-flux',
      name: 'Flux Gun',
      speed: 300,
      fireRate: 0.14,
      projectileSpeed: 820,
      damage: 2,
      description: 'Short-burst weapon that overpowers faster adaptive adversaries.',
    },
  ],
  defense: [
    {
      id: 'firewall-shield',
      name: 'Firewall Shield',
      shield: 18,
      description: 'Reduces incoming impact from malware and botnet floods.',
    },
    {
      id: 'honeypot',
      name: 'Honeypot Node',
      decoys: 1,
      description: 'Attracts attackers away from active system controls.',
    },
  ],
  utilities: [
    {
      id: 'ids-turret',
      name: 'IDS Turret',
      autoAim: true,
      description: 'Autonomous countermeasure platform with predictive target locking.',
    },
    {
      id: 'sandbox',
      name: 'Sandbox Field',
      containment: 18,
      description: 'Isolates malicious payloads before they can spread laterally.',
    },
  ],
};
