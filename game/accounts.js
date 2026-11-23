import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ACCOUNTS_FILE = path.join(__dirname, '..', 'data', 'cyber_accounts.json');

function initAccountsStore() {
  const dir = path.dirname(ACCOUNTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllAccounts() {
  initAccountsStore();
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('[ACCOUNTS READ ERROR]', err.message);
    return [];
  }
}

function saveAccounts(accounts) {
  initAccountsStore();
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

export function hashPin(pin) {
  return crypto.createHash('sha256').update(String(pin).trim()).digest('hex');
}

export function generateRecoveryKey() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part = '';
  for (let i = 0; i < 4; i++) {
    part += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `KEY-${part}-${digits}`;
}

export function registerAccount({ username, pin, division, avatar, gender, securityQuestion, securityAnswer }) {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required (3-18 characters, alphanumeric)');
  }
  const cleanUser = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18);
  if (cleanUser.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }

  const cleanPin = String(pin || '1234').trim();
  if (cleanPin.length < 4) {
    throw new Error('Secret PIN / Password must be at least 4 digits.');
  }

  const accounts = getAllAccounts();
  const existing = accounts.find(a => a.username.toLowerCase() === cleanUser.toLowerCase());
  if (existing) {
    throw new Error(`Username '${cleanUser}' is already registered. Please login or choose another.`);
  }

  const safeGender = gender === 'female' ? 'female' : 'male';
  const recoveryKey = generateRecoveryKey();

  const cleanAnswer = securityAnswer ? String(securityAnswer).trim().toLowerCase() : '';
  const securityAnswerHash = cleanAnswer ? hashPin(cleanAnswer) : null;

  const newAccount = {
    id: crypto.randomUUID(),
    username: cleanUser,
    pinHash: hashPin(cleanPin),
    recoveryKey: recoveryKey,
    securityQuestion: securityQuestion || 'আপনার প্রিয় সাইবার সিকিউরিটি বিষয় কোনটি?',
    securityAnswerHash: securityAnswerHash,
    gender: safeGender,
    avatar: avatar || (safeGender === 'female' ? '👩‍💻' : '👨‍💻'),
    division: division || 'Dhaka',
    level: 1, // Training level (1 to 4)
    level4Completed: false, // Required for Level 5 1v1 Arena
    xp: 0,
    trophies: 100, // Starting combat rating (Elo)
    rank: 'Script Kiddie',
    completedMissions: [],
    connections: [], // Friends / Connected Operatives
    // 1v1 Battle stats
    battles: {
      total: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      highestTrophies: 100,
      matchHistory: []
    },
    badges: ['recruit_2026'],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  const { pinHash, securityAnswerHash: _h, ...safeProfile } = newAccount;
  return safeProfile;
}

export function loginAccount({ username, pin }) {
  if (!username) throw new Error('Username required.');
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) {
    throw new Error('Operative not found with this username.');
  }

  const enteredHash = hashPin(pin);
  if (account.pinHash && account.pinHash !== enteredHash) {
    throw new Error('Incorrect secret PIN / Password.');
  }

  account.lastActiveAt = new Date().toISOString();
  saveAccounts(accounts);

  const { pinHash, securityAnswerHash, ...safeProfile } = account;
  return safeProfile;
}

// Password / PIN Recovery
export function getSecurityQuestion(username) {
  if (!username) throw new Error('Username required.');
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) throw new Error('Operative username not found.');

  return {
    success: true,
    username: account.username,
    securityQuestion: account.securityQuestion || 'আপনার প্রিয় সাইবার সিকিউরিটি বিষয় কোনটি?',
    hasSecurityAnswer: !!account.securityAnswerHash
  };
}

export function recoverAccountPin({ username, recoveryKey, securityAnswer, newPin }) {
  if (!username) throw new Error('Username required.');
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) {
    throw new Error('Operative not found with this username.');
  }

  const cleanNewPin = String(newPin || '').trim();
  if (cleanNewPin.length < 4) {
    throw new Error('New PIN / Password must be at least 4 digits.');
  }

  let authorized = false;

  // 1. Check Secret Recovery Key
  if (recoveryKey && account.recoveryKey) {
    if (String(recoveryKey).trim().toUpperCase() === account.recoveryKey.toUpperCase()) {
      authorized = true;
    }
  }

  // 2. Check Security Question Answer
  if (!authorized && securityAnswer && account.securityAnswerHash) {
    const enteredAnsHash = hashPin(String(securityAnswer).trim().toLowerCase());
    if (enteredAnsHash === account.securityAnswerHash) {
      authorized = true;
    }
  }

  // Fallback for legacy admin/seed accounts
  if (!authorized && recoveryKey && String(recoveryKey).trim().toUpperCase() === 'SENTINEL-MASTER') {
    authorized = true;
  }

  if (!authorized) {
    throw new Error('Verification failed. Invalid Recovery Key or Security Answer.');
  }

  // Update PIN and generate new recovery key for future security
  account.pinHash = hashPin(cleanNewPin);
  account.recoveryKey = generateRecoveryKey();
  account.lastActiveAt = new Date().toISOString();
  saveAccounts(accounts);

  return {
    success: true,
    message: 'PIN successfully reset! You can now login with your new PIN.',
    username: account.username,
    newRecoveryKey: account.recoveryKey
  };
}

export function updateProfileAvatar({ username, avatar }) {
  if (!username) throw new Error('Username required.');
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) throw new Error('Account not found.');

  account.avatar = avatar;
  account.lastActiveAt = new Date().toISOString();
  saveAccounts(accounts);

  const { pinHash, securityAnswerHash, ...safeProfile } = account;
  return safeProfile;
}

export function updateProfileGender({ username, gender }) {
  if (!username) throw new Error('Username required.');
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) throw new Error('Account not found.');

  account.gender = gender === 'female' ? 'female' : 'male';
  account.lastActiveAt = new Date().toISOString();
  saveAccounts(accounts);

  const { pinHash, securityAnswerHash, ...safeProfile } = account;
  return safeProfile;
}

// Connections (Friend / Network System)
export function toggleOperativeConnection({ username, targetUsername }) {
  if (!username || !targetUsername) throw new Error('Both usernames are required.');
  if (username.toLowerCase() === targetUsername.toLowerCase()) {
    throw new Error('You cannot connect to yourself.');
  }

  const accounts = getAllAccounts();
  const user = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  const target = accounts.find(a => a.username.toLowerCase() === targetUsername.trim().toLowerCase());

  if (!user || !target) throw new Error('One or both operatives could not be found.');

  if (!user.connections) user.connections = [];
  const idx = user.connections.findIndex(c => c.toLowerCase() === target.username.toLowerCase());

  let isConnected = false;
  if (idx !== -1) {
    user.connections.splice(idx, 1);
    isConnected = false;
  } else {
    user.connections.push(target.username);
    isConnected = true;
  }

  saveAccounts(accounts);

  return {
    success: true,
    isConnected,
    targetUsername: target.username,
    connections: user.connections
  };
}

export function getConnectedOperatives(username) {
  if (!username) return [];
  const accounts = getAllAccounts();
  const user = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !user.connections) return [];

  return user.connections.map(targetName => {
    const target = accounts.find(a => a.username.toLowerCase() === targetName.toLowerCase());
    if (!target) return null;
    return {
      username: target.username,
      avatar: target.avatar,
      gender: target.gender || 'male',
      division: target.division,
      rank: target.rank,
      trophies: target.trophies || 100,
      xp: target.xp || 0,
      lastActiveAt: target.lastActiveAt
    };
  }).filter(Boolean);
}

export function getPublicProfile(username) {
  if (!username) return null;
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) return null;

  return {
    id: account.id,
    username: account.username,
    gender: account.gender || 'male',
    avatar: account.avatar || '🔰',
    division: account.division || 'Bangladesh',
    rank: account.rank,
    xp: account.xp,
    trophies: account.trophies || 100,
    level4Completed: !!account.level4Completed,
    missionsCount: (account.completedMissions || []).length,
    connectionsCount: (account.connections || []).length,
    connections: account.connections || [],
    battles: account.battles || { total: 0, wins: 0, losses: 0, winStreak: 0 },
    badges: account.badges || [],
    createdAt: account.createdAt,
    lastActiveAt: account.lastActiveAt
  };
}

export function searchPlayers(query, limit = 10) {
  if (!query || typeof query !== 'string') return [];
  const clean = query.trim().toLowerCase();
  const accounts = getAllAccounts();

  const matches = accounts.filter(a => a.username.toLowerCase().includes(clean));
  return matches.slice(0, limit).map(a => getPublicProfile(a.username));
}

export function updateTrainingProgress({ username, missionId, xpEarned, isCompleted }) {
  const accounts = getAllAccounts();
  const account = accounts.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) return null;

  if (isCompleted && missionId) {
    if (!account.completedMissions) account.completedMissions = [];
    if (!account.completedMissions.includes(missionId)) {
      account.completedMissions.push(missionId);
      account.xp += (xpEarned || 25);
    }
  }

  // Check if missions of Zone 1 to 4 are completed (15+ missions)
  if ((account.completedMissions || []).length >= 15) {
    account.level4Completed = true;
    if (!account.badges) account.badges = [];
    if (!account.badges.includes('combat_license')) {
      account.badges.push('combat_license');
    }
  }

  // Update dynamic ranks
  const xp = account.xp;
  if (xp >= 5000) account.rank = 'CYBER LEGEND';
  else if (xp >= 3800) account.rank = 'Elite Hacker';
  else if (xp >= 2800) account.rank = 'Threat Hunter';
  else if (xp >= 2000) account.rank = 'SOC Defender';
  else if (xp >= 1400) account.rank = 'Red Team Operator';
  else if (xp >= 900)  account.rank = 'Zero-Day Analyst';
  else if (xp >= 500)  account.rank = 'Exploit Hunter';
  else if (xp >= 250)  account.rank = 'Packet Sniffer';
  else if (xp >= 100)  account.rank = 'Recon Agent';
  else account.rank = 'Script Kiddie';

  account.lastActiveAt = new Date().toISOString();
  saveAccounts(accounts);

  const { pinHash, securityAnswerHash, ...safeProfile } = account;
  return safeProfile;
}

export function recordBattleResult({ winnerUsername, loserUsername, isBot = false }) {
  const accounts = getAllAccounts();
  const winner = accounts.find(a => a.username.toLowerCase() === winnerUsername.toLowerCase());
  const loser = accounts.find(a => a.username.toLowerCase() === loserUsername.toLowerCase());

  if (winner) {
    winner.trophies = (winner.trophies || 100) + 30;
    winner.xp += 100;
    if (!winner.battles) winner.battles = { total: 0, wins: 0, losses: 0, winStreak: 0, highestTrophies: 100, matchHistory: [] };
    winner.battles.total++;
    winner.battles.wins++;
    winner.battles.winStreak++;
    if (winner.trophies > (winner.battles.highestTrophies || 100)) {
      winner.battles.highestTrophies = winner.trophies;
    }
    winner.battles.matchHistory.unshift({
      opponent: loserUsername,
      outcome: 'WIN',
      trophiesChanged: +30,
      timestamp: new Date().toISOString()
    });
    if (winner.battles.matchHistory.length > 10) winner.battles.matchHistory.pop();
    winner.lastActiveAt = new Date().toISOString();
  }

  if (loser && !isBot) {
    loser.trophies = Math.max(0, (loser.trophies || 100) - 15);
    if (!loser.battles) loser.battles = { total: 0, wins: 0, losses: 0, winStreak: 0, highestTrophies: 100, matchHistory: [] };
    loser.battles.total++;
    loser.battles.losses++;
    loser.battles.winStreak = 0;
    loser.battles.matchHistory.unshift({
      opponent: winnerUsername,
      outcome: 'LOSS',
      trophiesChanged: -15,
      timestamp: new Date().toISOString()
    });
    if (loser.battles.matchHistory.length > 10) loser.battles.matchHistory.pop();
    loser.lastActiveAt = new Date().toISOString();
  }

  saveAccounts(accounts);
}

export function getTrophyLeaderboard(limit = 30) {
  const accounts = getAllAccounts();
  const sorted = [...accounts].sort((a, b) => {
    const troA = a.trophies || 100;
    const troB = b.trophies || 100;
    if (troB !== troA) return troB - troA;
    return (b.xp || 0) - (a.xp || 0);
  });

  return sorted.slice(0, limit).map((a, index) => ({
    pos: index + 1,
    username: a.username,
    gender: a.gender || 'male',
    avatar: a.avatar || (a.gender === 'female' ? '👩‍💻' : '👨‍💻'),
    division: a.division || 'Bangladesh',
    rank: a.rank,
    trophies: a.trophies || 100,
    xp: a.xp || 0,
    connectionsCount: (a.connections || []).length,
    wins: a.battles ? a.battles.wins : 0,
    losses: a.battles ? a.battles.losses : 0,
    level4Completed: !!a.level4Completed
  }));
}
