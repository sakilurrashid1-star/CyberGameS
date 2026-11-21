import crypto from 'crypto';
import { recordBattleResult, getPublicProfile } from './accounts.js';

// In-memory active battle rooms
const ACTIVE_ROOMS = new Map();
let MATCHMAKING_QUEUE = [];

// Curated 1v1 Fast-Paced Cyber Clashes
const BATTLE_CLASHES = [
  {
    id: "c1",
    scenario: "🔥 INCOMING DDOS STRIKE: 4,000,000 SYN packets flooding port 443!",
    question: "Select immediate defensive countermeasure:",
    options: [
      "SYN Cookies & Cloud Anycast Traffic Scrubbing",
      "Format server hard drive",
      "Turn off HTTPS port",
      "Switch to HTTP"
    ],
    correct: 0
  },
  {
    id: "c2",
    scenario: "💉 SQL INJECTION DETECTED: ' OR 1=1; DROP TABLE users; --",
    question: "Neutralize payload before database execution:",
    options: [
      "Filter single quote with client-side JS",
      "Parameterized PreparedStatement with strict type-binding",
      "Restart MySQL service",
      "Double quote replacement"
    ],
    correct: 1
  },
  {
    id: "c3",
    scenario: "🎣 PHISHING MALWARE PAYLOAD: invoice_payment.pdf.exe executed!",
    question: "Isolate infection before lateral movement:",
    options: [
      "Disable antivirus popup",
      "Immediate Host EDR Network Isolation & Memory Forensic Dump",
      "Reboot computer 3 times",
      "Email the sender asking for apology"
    ],
    correct: 1
  },
  {
    id: "c4",
    scenario: "👾 ZERO-DAY API LEAK: Internal JWT secret exposed in public repo!",
    question: "Immediate containment action:",
    options: [
      "Revoke signing key immediately & force-expire all active tokens",
      "Delete git commit and pretend nothing happened",
      "Change git repository name",
      "Increase API rate limits"
    ],
    correct: 0
  },
  {
    id: "c5",
    scenario: "🕵️ MAN-IN-THE-MIDDLE: Attacker ARP-poisoning local gateway switch!",
    question: "Deploy LAN counter-strike defense:",
    options: [
      "Dynamic ARP Inspection (DAI) & 802.1X Port Security",
      "Clear browser cookies",
      "Change WiFi wallpaper",
      "Disconnect mouse"
    ],
    correct: 0
  },
  {
    id: "c6",
    scenario: "🔐 RANSOMWARE ENCRYPTION: Lateral SMB spreading across Domain Controller!",
    question: "Contain ransomware kill-chain:",
    options: [
      "Pay Bitcoin ransom immediately",
      "Sever Active Directory replication, isolate subnet & restore Air-Gapped 3-2-1 backup",
      "Wait until weekend",
      "Rename encrypted files back to .docx"
    ],
    correct: 1
  },
  {
    id: "c7",
    scenario: "🌐 DNS SPOOFING: Cache poisoned with malicious IP 185.220.101.5!",
    question: "Validate authoritative DNS integrity:",
    options: [
      "Flush local cache and enforce DNSSEC cryptographically signed responses",
      "Use incognito mode",
      "Bookmark the website",
      "Restart router"
    ],
    correct: 0
  }
];

export function createBattleRoom({ hostUsername, hostAvatar, hostDivision, hostGender }) {
  const roomId = 'CYBER-' + Math.floor(1000 + Math.random() * 9000);

  const room = {
    id: roomId,
    createdAt: Date.now(),
    status: 'WAITING', // WAITING, BATTLING, FINISHED
    player1: {
      username: hostUsername,
      avatar: hostAvatar || (hostGender === 'female' ? '👩‍💻' : '👨‍💻'),
      division: hostDivision || 'Dhaka',
      gender: hostGender === 'female' ? 'female' : 'male',
      hp: 100,
      score: 0,
      answeredRounds: {}
    },
    player2: null,
    rounds: BATTLE_CLASHES.slice(0, 5).sort(() => Math.random() - 0.5),
    currentRoundIdx: 0,
    roundStartedAt: null,
    winner: null,
    isBotMatch: false,
    combatLog: [],
    chatMessages: [] // Real-time 1v1 battle live chat
  };

  ACTIVE_ROOMS.set(roomId, room);
  return room;
}

export function joinBattleRoom({ roomId, guestUsername, guestAvatar, guestDivision, guestGender }) {
  const room = ACTIVE_ROOMS.get(roomId);
  if (!room) throw new Error('Battle Room not found or expired.');
  if (room.status !== 'WAITING') throw new Error('Room is already full or in battle.');
  if (room.player1.username.toLowerCase() === guestUsername.toLowerCase()) {
    return room; // Host rejoining
  }

  room.player2 = {
    username: guestUsername,
    avatar: guestAvatar || (guestGender === 'female' ? '👩‍💻' : '⚡'),
    division: guestDivision || 'Chittagong',
    gender: guestGender === 'female' ? 'female' : 'male',
    hp: 100,
    score: 0,
    answeredRounds: {}
  };

  room.status = 'BATTLING';
  room.roundStartedAt = Date.now();
  room.combatLog.push(`⚔️ Battle Commenced: ${room.player1.username} VS ${room.player2.username}`);

  return room;
}

export function quickMatch({ username, avatar, division, gender }) {
  const now = Date.now();
  MATCHMAKING_QUEUE = MATCHMAKING_QUEUE.filter(q => now - q.time < 30000 && q.username !== username);

  if (MATCHMAKING_QUEUE.length > 0) {
    const opponent = MATCHMAKING_QUEUE.shift();
    const room = createBattleRoom({
      hostUsername: opponent.username,
      hostAvatar: opponent.avatar,
      hostDivision: opponent.division,
      hostGender: opponent.gender || 'male'
    });
    return joinBattleRoom({
      roomId: room.id,
      guestUsername: username,
      guestAvatar: avatar,
      guestDivision: division,
      guestGender: gender || 'male'
    });
  }

  // AI Bots with distinct gender and realistic styles
  const aiBots = [
    { name: 'CyberQueen_Ayesha', avatar: '👩‍💻', division: 'Dhaka', gender: 'female' },
    { name: 'ShadowHunter_Nafi', avatar: '💀', division: 'Dhaka', gender: 'male' },
    { name: 'Valkyrie_Nusrat', avatar: '⚡', division: 'Sylhet', gender: 'female' },
    { name: 'RedTeam_Operative', avatar: '🔴', division: 'Chittagong', gender: 'male' },
    { name: 'ZeroDay_Nadia', avatar: '🦅', division: 'Rajshahi', gender: 'female' }
  ];
  const chosenBot = aiBots[Math.floor(Math.random() * aiBots.length)];

  const room = createBattleRoom({
    hostUsername: username,
    hostAvatar: avatar,
    hostDivision: division,
    hostGender: gender || 'male'
  });

  room.isBotMatch = true;
  room.player2 = {
    username: chosenBot.name,
    avatar: chosenBot.avatar,
    division: chosenBot.division,
    gender: chosenBot.gender,
    hp: 100,
    score: 0,
    answeredRounds: {}
  };
  room.status = 'BATTLING';
  room.roundStartedAt = Date.now();
  room.combatLog.push(`⚔️ Duel Commenced: ${username} VS ${chosenBot.name}`);

  return room;
}

export function submitBattleMove({ roomId, username, roundIdx, answerIdx }) {
  const room = ACTIVE_ROOMS.get(roomId);
  if (!room) throw new Error('Battle not found.');
  if (room.status !== 'BATTLING') return room;

  const currentRound = room.rounds[roundIdx];
  if (!currentRound) return room;

  const isPlayer1 = room.player1.username.toLowerCase() === username.toLowerCase();
  const player = isPlayer1 ? room.player1 : room.player2;
  const opponent = isPlayer1 ? room.player2 : room.player1;

  if (player.answeredRounds[roundIdx] !== undefined) {
    return room; // Already answered this round
  }

  const isCorrect = answerIdx === currentRound.correct;
  player.answeredRounds[roundIdx] = { isCorrect, answerIdx, timestamp: Date.now() };

  if (isCorrect) {
    // Damage opponent shield
    const damage = 25;
    opponent.hp = Math.max(0, opponent.hp - damage);
    player.score += 100;
    room.combatLog.push(`💥 ${player.username} deployed accurate countermeasure! Deals -${damage} HP to ${opponent.username}!`);
  } else {
    // Self damage on misconfiguration
    const penalty = 10;
    player.hp = Math.max(0, player.hp - penalty);
    room.combatLog.push(`⚠️ ${player.username} misconfigured defense! Shield leaked -${penalty} HP!`);
  }

  // If Bot match, simulate bot response with realistic delay
  if (room.isBotMatch && !room.player2.answeredRounds[roundIdx]) {
    const botWillGetCorrect = Math.random() < 0.75; // 75% accuracy
    const botAns = botWillGetCorrect ? currentRound.correct : (currentRound.correct + 1) % 4;
    room.player2.answeredRounds[roundIdx] = { isCorrect: botWillGetCorrect, answerIdx: botAns, timestamp: Date.now() + 1500 };

    if (botWillGetCorrect) {
      room.player1.hp = Math.max(0, room.player1.hp - 25);
      room.player2.score += 100;
      room.combatLog.push(`🤖 ${room.player2.username} fired laser strike! Deals -25 HP to ${room.player1.username}!`);
    }
  }

  // Check victory conditions
  if (room.player1.hp <= 0 || room.player2.hp <= 0 || roundIdx >= room.rounds.length - 1) {
    room.status = 'FINISHED';

    if (room.player1.hp > room.player2.hp) {
      room.winner = room.player1.username;
    } else if (room.player2.hp > room.player1.hp) {
      room.winner = room.player2.username;
    } else {
      room.winner = 'DRAW';
    }

    room.combatLog.push(`🏆 BATTLE CONCLUDED! Victor: ${room.winner}`);

    // Update trophies & record match history in persistent store
    if (room.winner !== 'DRAW') {
      const loser = room.winner === room.player1.username ? room.player2.username : room.player1.username;
      recordBattleResult({
        winnerUsername: room.winner,
        loserUsername: loser,
        isBot: room.isBotMatch && loser === room.player2.username
      });
    }
  } else {
    // Advance round
    room.currentRoundIdx = roundIdx + 1;
    room.roundStartedAt = Date.now();
  }

  return room;
}

export function sendBattleChat({ roomId, username, text, type = 'chat' }) {
  const room = ACTIVE_ROOMS.get(roomId);
  if (!room) throw new Error('Battle room not found or expired.');

  const isPlayer1 = room.player1 && room.player1.username.toLowerCase() === username.toLowerCase();
  const isPlayer2 = room.player2 && room.player2.username.toLowerCase() === username.toLowerCase();

  if (!isPlayer1 && !isPlayer2) {
    throw new Error('You are not a member of this duel.');
  }

  const sender = isPlayer1 ? room.player1 : room.player2;
  const cleanText = String(text || '').trim().slice(0, 120);
  if (!cleanText) throw new Error('Message cannot be empty.');

  if (!room.chatMessages) room.chatMessages = [];

  const chatEntry = {
    id: crypto.randomUUID(),
    sender: sender.username,
    gender: sender.gender || 'male',
    avatar: sender.avatar,
    text: cleanText,
    type,
    timestamp: Date.now()
  };

  room.chatMessages.push(chatEntry);
  if (room.chatMessages.length > 50) room.chatMessages.shift();

  // If Bot Match and sender is human, trigger realistic bot banter
  if (room.isBotMatch && isPlayer1) {
    setTimeout(() => {
      const botTaunts = [
        "🛡️ Your attack was blocked by my zero-trust gate!",
        "⚡ Deploying counter-intrusion script now...",
        "💥 Nice try! My cloud scrubbers absorbed that!",
        "🔥 Zero-day incoming, get ready!",
        "🤝 Well fought! Let's see your next move!"
      ];
      const botPick = botTaunts[Math.floor(Math.random() * botTaunts.length)];
      if (room.status === 'BATTLING') {
        room.chatMessages.push({
          id: crypto.randomUUID(),
          sender: room.player2.username,
          gender: room.player2.gender || 'female',
          avatar: room.player2.avatar,
          text: botPick,
          type: 'taunt',
          timestamp: Date.now()
        });
        if (room.chatMessages.length > 50) room.chatMessages.shift();
      }
    }, 1000);
  }

  return room;
}

export function getBattleRoomState(roomId) {
  const room = ACTIVE_ROOMS.get(roomId);
  if (!room) return null;

  // Clean old rooms (older than 1 hour)
  if (Date.now() - room.createdAt > 3600000) {
    ACTIVE_ROOMS.delete(roomId);
    return null;
  }

  return room;
}
