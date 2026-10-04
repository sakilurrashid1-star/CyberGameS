export const campaignLevels = [
  {
    id: 1,
    name: 'Phase 1: Border Breach',
    description: 'Initial perimeter intrusion. Attackers probe the mesh using ransomware and botnet payloads.',
    threatMix: ['ransomware', 'botnet'],
    difficulty: 1,
  },
  {
    id: 2,
    name: 'Phase 2: SQL Lattice',
    description: 'Injection probes enumerate backend schemas and attempt privilege escalations.',
    threatMix: ['sqlInjection', 'ransomware'],
    difficulty: 2,
  },
  {
    id: 3,
    name: 'Phase 3: Silent Relay',
    description: 'APT activity hides between legitimate traffic and exfiltration events.',
    threatMix: ['apt', 'botnet'],
    difficulty: 3,
  },
  {
    id: 4,
    name: 'Phase 4: Unpatched Hazards',
    description: 'Zero-days exploit memory corruption paths and destabilize defensive automations.',
    threatMix: ['zeroDay', 'sqlInjection', 'apt'],
    difficulty: 4,
  },
];
