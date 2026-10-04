export const campaignLevels = [
  {
    id: 1,
    moduleId: 'module-1',
    title: 'Phase 1: Border Breach',
    shortTitle: 'Packet Defense',
    moduleTitle: 'Network Fundamentals & Port Defense',
    description: 'Untrusted scanning and ICMP amplification are probing the edge. Defend the service perimeter before the handshake flood overwhelms the mesh.',
    threatMix: ['ransomware', 'botnet', 'sqlInjection'],
    difficulty: 1,
    learningDomain: 'Network Defense',
    cve: 'CVE-2023-1234',
    mitreTechnique: 'T1498 - Network Denial of Service',
    briefing: {
      title: 'TCP SYN flood and packet reconnaissance',
      vector: 'Spoofed connection attempts and ICMP amplification against the public edge nodes.',
      explanation: 'Attackers generate incomplete handshakes to exhaust connection tables and inspect open ports. The goal is to degrade service availability before defenders can react.',
      mitigation: 'Apply rate limits, SYN cookies, IP filtering, and signature-based detection to isolate hostile sources.'
    },
    challenge: 'Explain why SYN cookies reduce the impact of connection exhaustion and how ICMP floods differ from TCP half-open floods.'
  },
  {
    id: 2,
    moduleId: 'module-2',
    title: 'Phase 2: Trusted Query, Unsafe Input',
    shortTitle: 'Web App Hardening',
    moduleTitle: 'Web Application Penetration & Hardening',
    description: 'The web gateway is being tested with injection payloads, credential stuffing, and rapid session tampering. Restore trust in application inputs.',
    threatMix: ['sqlInjection', 'botnet', 'apt'],
    difficulty: 2,
    learningDomain: 'Web Security',
    cve: 'CVE-2024-2048',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    briefing: {
      title: 'Untrusted input concatenation in SQL request paths',
      vector: 'Boolean-based payloads and direct parameter manipulation in an application API layer.',
      explanation: 'A vulnerable query builder can be manipulated to alter logic, bypass filters, and leak internal data. This often appears when input is not validated or parameterized.',
      mitigation: 'Use parameterized statements, strong validation, CSRF tokens, and strict session binding to reduce exploitation risk.'
    },
    challenge: 'Identify which SQL pattern indicates a classic injection bypass and which defense rule would stop it at the application boundary.'
  },
  {
    id: 3,
    moduleId: 'module-3',
    title: 'Phase 3: Host Isolation',
    shortTitle: 'Malware Defense',
    moduleTitle: 'Malware Analysis & Host Defense',
    description: 'Endpoint telemetry shows a malicious update channel, beaconing to an external controller, and encrypted host data. Stop the kill chain early.',
    threatMix: ['ransomware', 'apt', 'zeroDay'],
    difficulty: 3,
    learningDomain: 'Malware Analysis',
    cve: 'CVE-2024-3321',
    mitreTechnique: 'T1486 - Data Encrypted for Impact',
    briefing: {
      title: 'Ransomware and trojanized update channels',
      vector: 'A malicious signed package is executed after a trust-check failure, creating persistence and file encryption.',
      explanation: 'Attackers rely on trusted software paths to bypass initial defenses. Once installed, the payload can encrypt host files and spread laterally with limited detection.',
      mitigation: 'Verify package integrity, isolate hosts, compare SHA-256 hashes, and inspect scheduled tasks and startup paths.'
    },
    challenge: 'Compare the value of SHA-256 verification against simple file extension checks and explain why a malicious binary may still appear legitimate.'
  },
  {
    id: 4,
    moduleId: 'module-4',
    title: 'Phase 4: Cipherhouse Breach',
    shortTitle: 'Cryptography',
    moduleTitle: 'Applied Cryptography',
    description: 'A compromised credential store is using weak hash patterns with no salt. Reconstruct the logic and protect the trust boundary.',
    threatMix: ['zeroDay', 'sqlInjection', 'botnet'],
    difficulty: 4,
    learningDomain: 'Cryptography',
    cve: 'CVE-2024-4170',
    mitreTechnique: 'T1552 - Unsecured Credentials',
    briefing: {
      title: 'Deterministic password hashes without salting',
      vector: 'Credential material is stored in a reversible or weakly hashed format, enabling offline cracking and credential reuse.',
      explanation: 'Without unique salts and adaptive hashing, attackers can test password guesses efficiently and compare them against known datasets. Cryptographic design flaws weaken data confidentiality even when the service itself remains online.',
      mitigation: 'Use Argon2 or bcrypt with per-user salts, enforce password complexity, and rotate credentials after compromise.'
    },
    challenge: 'Explain why a salted hash protects against precomputed dictionary attacks while plain SHA-256 without salts does not.'
  },
  {
    id: 5,
    moduleId: 'module-5',
    title: 'Phase 5: Case File Closed',
    shortTitle: 'IR & Forensics',
    moduleTitle: 'Incident Response & Digital Forensics',
    description: 'The event stream has been tampered with, and the attacker appears to have pivoted through a hidden relay. Preserve evidence and isolate the blast radius.',
    threatMix: ['apt', 'zeroDay', 'ransomware'],
    difficulty: 5,
    learningDomain: 'Incident Response & Forensics',
    cve: 'CVE-2024-5500',
    mitreTechnique: 'T1070 - Indicator Removal on Host',
    briefing: {
      title: 'Credential replay and event log tampering',
      vector: 'Service account credentials were replayed across multiple systems while logs were quietly altered to remove traces of lateral movement.',
      explanation: 'A solid incident response process depends on preserving volatile evidence and correlating endpoint, network, and identity telemetry. If logs are altered, defenders must reconstruct the story from PCAPs, memory captures, and process lineage.',
      mitigation: 'Activate containment playbooks, preserve memory images and logs, and isolate systems before rehydrating services.'
    },
    challenge: 'Describe the order of operations in a proper containment playbook and explain why memory acquisition must happen before host remediation.'
  }
];

export const levelIndex = Object.fromEntries(
  campaignLevels.map((level) => [level.id, level])
);

export const curriculumModuleMap = Object.fromEntries(
  campaignLevels.map((level) => [level.moduleId, level])
);

export default campaignLevels;
