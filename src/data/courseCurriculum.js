export const courseCurriculum = [
  {
    id: 'module-1',
    module: 1,
    title: 'Network Fundamentals & Port Defense',
    shortTitle: 'Network Defense',
    domain: 'Network Defense',
    focus: [
      'OSI layer awareness',
      'TCP/UDP handshake analysis',
      'ICMP flooding behavior',
      'Packet sniffing and filtering',
      'Firewall rule design'
    ],
    frameworks: {
      nistNice: ['NICE: PR-CIR-01', 'NICE: PR-CIR-02', 'NICE: PR-INF-02'],
      mitreAttack: ['T1046 - Network Service Discovery', 'T1498 - Network DoS', 'T1040 - Network Sniffing']
    },
    learningObjectives: [
      'Recognize normal three-way TCP handshakes and identify abnormal connection patterns.',
      'Differentiate between TCP and UDP traffic and the risks each introduces under saturation conditions.',
      'Explain how ICMP-based floods and port scanning create denial-of-service conditions.',
      'Apply access-control rules to block hostile sources while preserving legitimate service flows.'
    ],
    sampleCommands: [
      'nmap -sS -p 80,443 <subnet>',
      'tcpdump -i eth0 -n "tcp port 80"',
      'iptables -A INPUT -s <hostile_ip> -j DROP',
      'ping -f <target_ip>'
    ],
    threats: [
      'SYN flood',
      'ICMP flood',
      'Port scan reconnaissance',
      'Packet sniffing and lateral mapping'
    ],
    remediation: [
      'Harden firewall ingress rules and lock down unused ports.',
      'Rate-limit suspicious traffic at the edge and monitor TTL anomalies.',
      'Use IDS signatures to detect reconnaissance and replay-based anomalies.'
    ],
    briefing: {
      cve: 'CVE-2023-1234',
      title: 'TCP Flooding through an unbounded connection queue',
      vector: 'State exhaustion via repeated SYN packets against unpatched load balancer edge nodes.',
      explanation: 'Attackers can overwhelm service tables by exhausting ephemeral connection state. This generates latency, packet drops, and blurred visibility for defenders.',
      mitigation: 'Use SYN cookies, connection rate limiting, and upstream filtering to absorb spikes before they reach the application tier.'
    }
  },
  {
    id: 'module-2',
    module: 2,
    title: 'Web Application Penetration & Hardening',
    shortTitle: 'Web Security',
    domain: 'Web Security',
    focus: [
      'SQL injection payload analysis',
      'Cross-site scripting sanitization',
      'CSRF token enforcement',
      'Broken authentication',
      'Secure session handling'
    ],
    frameworks: {
      nistNice: ['NICE: PR-CIR-03', 'NICE: PR-CIR-04', 'NICE: PR-CIR-07'],
      mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1505 - Server Software Component', 'T1558 - Steal Application Access Token']
    },
    learningObjectives: [
      'Identify dangerous SQL patterns such as UNION-based injection and boolean bypasses.',
      'Understand why untrusted user input must be sanitized before database interaction.',
      'Explain CSRF protections including anti-forgery tokens and SameSite cookie policies.',
      'Recognize broken authentication patterns such as insecure session fixation and missing MFA.'
    ],
    sampleCommands: [
      "' OR 1=1 --",
      'curl -X POST https://target.local/login --data "user=admin&pass=pass"',
      'grep -R "csrf" /var/www/app',
      'openssl rand -hex 32'
    ],
    threats: [
      'SQL injection',
      'Stored XSS',
      'CSRF token bypass',
      'Credential stuffing and broken auth'
    ],
    remediation: [
      'Use parameterized queries, defense-in-depth validation, and least-privilege database roles.',
      'Escape and encode untrusted output before rendering in the browser.',
      'Require explicit CSRF tokens and rotate session identifiers after privilege changes.'
    ],
    briefing: {
      cve: 'CVE-2024-2048',
      title: 'Authentication bypass in a vulnerable request handler',
      vector: 'Parameter tampering and untrusted input concatenation in a backend SQL query path.',
      explanation: 'Attackers can manipulate query boundaries to bypass access checks and expose internal records. This is especially dangerous when the application returns raw errors or has no input validation layer.',
      mitigation: 'Use prepared statements, enforce server-side validation, and log authentication anomalies for triage.'
    }
  },
  {
    id: 'module-3',
    module: 3,
    title: 'Malware Analysis & Host Defense',
    shortTitle: 'Malware Defense',
    domain: 'Malware Analysis',
    focus: [
      'Ransomware kill chain',
      'Trojan droppers',
      'C2 beaconing',
      'SHA-256 integrity verification',
      'Host isolation and memory checks'
    ],
    frameworks: {
      nistNice: ['NICE: PR-CIR-05', 'NICE: PR-INF-03', 'NICE: PR-CIR-08'],
      mitreAttack: ['T1486 - Data Encrypted for Impact', 'T1059 - Command and Scripting Interpreter', 'T1071 - Application Layer Protocol']
    },
    learningObjectives: [
      'Trace the ransomware sequence from initial access to encryption and extortion.',
      'Identify trojan behaviors such as persistence, beaconing, and registry or cron modifications.',
      'Verify file integrity using cryptographic hashes and compare with known-good baselines.',
      'Contain threats by isolating hosts while preserving evidence for forensic review.'
    ],
    sampleCommands: [
      'ps aux | grep suspicious',
      'openssl dgst -sha256 payload.bin',
      'sha256sum /path/to/file',
      'netstat -tulnp',
      'kill -9 <pid>'
    ],
    threats: [
      'Ransomware encryption',
      'Dropper trojans',
      'Beaconing command-and-control traffic',
      'Registry persistence and scheduled tasks'
    ],
    remediation: [
      'Verify file hashes against trusted baselines and isolate the host immediately.',
      'Block outbound C2 beacons via egress filtering and DNS sinks.',
      'Preserve forensic artifacts before remediation and map persistence mechanisms.'
    ],
    briefing: {
      cve: 'CVE-2024-3321',
      title: 'Trojanized update channel leading to credential theft and file encryption',
      vector: 'Malicious signed package dropped from a compromised software repository, then executed with elevated privileges.',
      explanation: 'Attackers exploit trust relationships to install payloads that silently establish persistence and encrypt local data. Hash validation and runtime gating are crucial for detection.',
      mitigation: 'Verify package digests, disable untrusted update channels, and quarantine suspicious binaries using a controlled incident response workflow.'
    }
  },
  {
    id: 'module-4',
    module: 4,
    title: 'Applied Cryptography',
    shortTitle: 'Cryptography',
    domain: 'Cryptography',
    focus: [
      'Symmetric vs asymmetric encryption',
      'Caesar and Vigenère ciphers',
      'RSA key generation and usage',
      'Salting and password hashing',
      'Key management fundamentals'
    ],
    frameworks: {
      nistNice: ['NICE: PR-DEV-02', 'NICE: PR-CIR-06', 'NICE: PR-INF-01'],
      mitreAttack: ['T1552 - Unsecured Credentials', 'T1553 - Subvert Trust Controls', 'T1059 - Command and Scripting Interpreter']
    },
    learningObjectives: [
      'Contrast symmetric key cryptography with public-private key systems.',
      'Break or reason about classical substitution ciphers to understand weaknesses in naive encryption.',
      'Recognize when a system salts and hashes passwords instead of storing raw secrets.',
      'Explain the importance of key length and verification in secure communication.'
    ],
    sampleCommands: [
      'openssl genrsa -out private.pem 2048',
      'openssl rsa -in private.pem -pubout -out public.pem',
      'openssl dgst -sha256 payload.bin',
      'decode --base64 <token>',
      'hashcat -m 0 /tmp/hashlist.txt /usr/share/wordlists/rockyou.txt'
    ],
    threats: [
      'Weak XOR and rotation ciphers',
      'Credential plaintext exposure',
      'Password reuse and unsalted hashes',
      'Key theft or misuse'
    ],
    remediation: [
      'Use modern authenticated encryption modes and avoid custom cryptographic routines.',
      'Hash passwords with strong adaptive algorithms such as bcrypt or Argon2 and add unique salts.',
      'Protect private keys and rotate them with centralized key management.'
    ],
    briefing: {
      cve: 'CVE-2024-4170',
      title: 'Legacy password storage with deterministic hashing and no salt',
      vector: 'Credential database stores hash values without per-user salts, allowing rainbow-table and frequency analysis attacks.',
      explanation: 'Attackers can compare password fingerprints without brute forcing every guess independently. This also exposes high-value accounts if password reuse is common.',
      mitigation: 'Use adaptive hashing with unique salts, enforce password rules, and audit secret storage in the identity layer.'
    }
  },
  {
    id: 'module-5',
    module: 5,
    title: 'Incident Response & Digital Forensics',
    shortTitle: 'IR & Forensics',
    domain: 'Incident Response',
    focus: [
      'SIEM log triage',
      'PCAP analysis',
      'Memory volatility and process analysis',
      'Containment playbooks',
      'Evidence preservation'
    ],
    frameworks: {
      nistNice: ['NICE: PR-CIR-09', 'NICE: PR-INF-04', 'NICE: PR-CIR-10'],
      mitreAttack: ['T1070 - Indicator Removal on Host', 'T1562 - Impair Defenses', 'T1020 - Automated Exfiltration']
    },
    learningObjectives: [
      'Perform targeted log triage to isolate suspicious IPs, user sessions, and login anomalies.',
      'Explain how PCAP inspection supports packet-level reconstruction of a malicious event sequence.',
      'Identify key memory artifacts that point to active malware or command-and-control processes.',
      'Apply a containment and escalation workflow that balances business continuity with evidence preservation.'
    ],
    sampleCommands: [
      'grep -E "failed|admin|suspicious" /var/log/auth.log',
      'tshark -r capture.pcap -Y "http.request.method == GET"',
      'volatility -f memory.raw --profile=Win10 pslist',
      'journalctl -u ssh --since "1 hour ago"'
    ],
    threats: [
      'Credential abuse and log tampering',
      'Encrypted command-and-control traffic',
      'Memory-resident malware',
      'Slow exfiltration and host persistence'
    ],
    remediation: [
      'Triage alerts in a structured way, preserve volatile evidence, and isolate affected systems.',
      'Correlate endpoint, network, and identity telemetry before containment decisions.',
      'Evaluate whether malware persistently changed startup items, cron tables, or scheduled tasks.'
    ],
    briefing: {
      cve: 'CVE-2024-5500',
      title: 'Credential replay and event log tampering in a compromised SIEM edge',
      vector: 'Attackers harvest service account credentials and manipulate local audit trails to hide network pivoting.',
      explanation: 'This attack forces defenders to balance rapid containment with forensic completeness. If the log trail is altered, triage may need to reconstruct events from packet captures and memory snapshots.',
      mitigation: 'Use append-only log storage, privileged access control, and cross-correlation with endpoint telemetry to validate event integrity.'
    }
  }
];

export const curriculumIndex = Object.fromEntries(
  courseCurriculum.map((module) => [module.id, module])
);

export default courseCurriculum;























																																																																																																																																																																																																																																																																																																																																																																																																																																																										
temp






































































































































































































































































































garbage



























































































































































