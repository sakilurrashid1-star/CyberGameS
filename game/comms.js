import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMMS_FILE = path.join(__dirname, '..', 'data', 'cyber_comms.json');

function initCommsStore() {
  const dir = path.dirname(COMMS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(COMMS_FILE)) {
    const initialData = {
      globalMessages: [
        {
          id: 'welcome-comms-1',
          sender: 'Sakilur_Leader',
          gender: 'male',
          avatar: '👑',
          text: 'স্বাগতম সাইবার কমস সেন্টারে! এখানে সবাই কানেক্ট হয়ে স্ট্র্যাটেজি ও ডিফেন্স ট্যাকটিক্স শেয়ার করতে পারেন। 🛡️',
          timestamp: Date.now() - 3600000
        },
        {
          id: 'welcome-comms-2',
          sender: 'CyberQueen_Ayesha',
          gender: 'female',
          avatar: '👩‍💻',
          text: 'লেভেল ৪ এর জিরো ট্রাস্ট আর্কিটেকচার কমপ্লিট করলাম! কেউ কি ১v১ ডুয়েলে আসতে চান? ⚡',
          timestamp: Date.now() - 1800000
        }
      ],
      directChats: {}
    };
    fs.writeFileSync(COMMS_FILE, JSON.stringify(initialData, null, 2));
  }
}

function getCommsData() {
  initCommsStore();
  try {
    const raw = fs.readFileSync(COMMS_FILE, 'utf-8');
    return JSON.parse(raw) || { globalMessages: [], directChats: {} };
  } catch (err) {
    console.error('[COMMS READ ERROR]', err.message);
    return { globalMessages: [], directChats: {} };
  }
}

function saveCommsData(data) {
  initCommsStore();
  fs.writeFileSync(COMMS_FILE, JSON.stringify(data, null, 2));
}

// Global Lounge Feed
export function getGlobalComms(limit = 50) {
  const data = getCommsData();
  const list = data.globalMessages || [];
  return list.slice(-limit);
}

export function sendGlobalComms({ sender, text, avatar, gender }) {
  if (!sender || !text) throw new Error('Sender and message text are required.');
  const cleanText = String(text).trim().slice(0, 200);
  if (!cleanText) throw new Error('Message cannot be empty.');

  const data = getCommsData();
  if (!data.globalMessages) data.globalMessages = [];

  const msg = {
    id: crypto.randomUUID(),
    sender: sender.trim(),
    gender: gender === 'female' ? 'female' : 'male',
    avatar: avatar || '🔰',
    text: cleanText,
    timestamp: Date.now()
  };

  data.globalMessages.push(msg);
  if (data.globalMessages.length > 100) {
    data.globalMessages.shift();
  }

  saveCommsData(data);
  return msg;
}

// 1v1 Direct Encrypted Messaging between two Operatives
function getDirectKey(user1, user2) {
  const u1 = String(user1).trim().toLowerCase();
  const u2 = String(user2).trim().toLowerCase();
  return [u1, u2].sort().join('___');
}

export function getDirectComms(user1, user2, limit = 50) {
  if (!user1 || !user2) return [];
  const key = getDirectKey(user1, user2);
  const data = getCommsData();
  const thread = (data.directChats && data.directChats[key]) || [];
  return thread.slice(-limit);
}

export function sendDirectComms({ sender, recipient, text, avatar, gender }) {
  if (!sender || !recipient || !text) {
    throw new Error('Sender, recipient, and text are required.');
  }
  const cleanText = String(text).trim().slice(0, 200);
  if (!cleanText) throw new Error('Message cannot be empty.');

  const key = getDirectKey(sender, recipient);
  const data = getCommsData();
  if (!data.directChats) data.directChats = {};
  if (!data.directChats[key]) data.directChats[key] = [];

  const msg = {
    id: crypto.randomUUID(),
    sender: sender.trim(),
    recipient: recipient.trim(),
    gender: gender === 'female' ? 'female' : 'male',
    avatar: avatar || '🔰',
    text: cleanText,
    timestamp: Date.now()
  };

  data.directChats[key].push(msg);
  if (data.directChats[key].length > 60) {
    data.directChats[key].shift();
  }

  saveCommsData(data);
  return msg;
}
