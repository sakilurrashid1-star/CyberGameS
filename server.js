import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  registerAccount,
  loginAccount,
  getPublicProfile,
  searchPlayers,
  updateTrainingProgress,
  getTrophyLeaderboard,
  updateProfileAvatar,
  updateProfileGender,
  getSecurityQuestion,
  recoverAccountPin,
  toggleOperativeConnection,
  getConnectedOperatives
} from './game/accounts.js';
import {
  createBattleRoom,
  joinBattleRoom,
  quickMatch,
  submitBattleMove,
  getBattleRoomState,
  sendBattleChat
} from './game/battles.js';
import {
  getGlobalComms,
  sendGlobalComms,
  getDirectComms,
  sendDirectComms
} from './game/comms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Optimization Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files from repository root
app.use(express.static(__dirname));

// ==========================================
// 🎮 CYBERGAMES REST API ENDPOINTS
// ==========================================

// 1. Auth: Register
app.post('/api/cyber/auth/register', (req, res) => {
  try {
    const profile = registerAccount(req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Auth: Login
app.post('/api/cyber/auth/login', (req, res) => {
  try {
    const profile = loginAccount(req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Auth: Get Security Question for Recovery
app.get('/api/cyber/auth/security-question/:username', (req, res) => {
  try {
    const data = getSecurityQuestion(req.params.username);
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Auth: Recover Forgotten PIN / Password
app.post('/api/cyber/auth/recover', (req, res) => {
  try {
    const result = recoverAccountPin(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Profile: Get Public Profile
app.get('/api/cyber/profile/:username', (req, res) => {
  try {
    const profile = getPublicProfile(req.params.username);
    if (!profile) return res.status(404).json({ success: false, error: 'Player not found.' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Profile: Update Photo / Avatar
app.post('/api/cyber/profile/update-avatar', (req, res) => {
  try {
    const profile = updateProfileAvatar(req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Profile: Update Gender
app.post('/api/cyber/profile/update-gender', (req, res) => {
  try {
    const profile = updateProfileGender(req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. Social: Connect / Disconnect Friend (Operative Network)
app.post('/api/cyber/connections/toggle', (req, res) => {
  try {
    const result = toggleOperativeConnection(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. Social: Get Connected Operatives List
app.get('/api/cyber/connections/:username', (req, res) => {
  try {
    const connections = getConnectedOperatives(req.params.username);
    res.json({ success: true, connections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Social Comms: Global Cyber Lounge Feed
app.get('/api/cyber/comms/global', (req, res) => {
  try {
    const messages = getGlobalComms(50);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Social Comms: Post to Global Cyber Lounge
app.post('/api/cyber/comms/global', (req, res) => {
  try {
    const message = sendGlobalComms(req.body);
    res.json({ success: true, message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 12. Social Comms: Direct 1v1 Encrypted Comms Thread
app.get('/api/cyber/comms/direct/:user1/:user2', (req, res) => {
  try {
    const messages = getDirectComms(req.params.user1, req.params.user2, 50);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Social Comms: Send Direct 1v1 Encrypted Message
app.post('/api/cyber/comms/direct', (req, res) => {
  try {
    const message = sendDirectComms(req.body);
    res.json({ success: true, message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 14. Search Players
app.get('/api/cyber/search', (req, res) => {
  try {
    const q = req.query.q || '';
    const results = searchPlayers(q, 10);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Training Progress Sync (Levels 1 to 4)
app.post('/api/cyber/progress/sync', (req, res) => {
  try {
    const profile = updateTrainingProgress(req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 16. 1v1 Battle: QuickMatch
app.post('/api/cyber/battle/quickmatch', (req, res) => {
  try {
    const room = quickMatch(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 17. 1v1 Battle: Create Custom Room
app.post('/api/cyber/battle/create-room', (req, res) => {
  try {
    const room = createBattleRoom(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 18. 1v1 Battle: Join Custom Room
app.post('/api/cyber/battle/join-room', (req, res) => {
  try {
    const room = joinBattleRoom(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 19. 1v1 Battle: Submit Move (Attack / Defense)
app.post('/api/cyber/battle/submit-move', (req, res) => {
  try {
    const room = submitBattleMove(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 20. 1v1 Battle: Poll Room State
app.get('/api/cyber/battle/poll/:roomId', (req, res) => {
  try {
    const room = getBattleRoomState(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found.' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. 1v1 Battle: Live Chat & Tactical Quick-Taunts
app.post('/api/cyber/battle/send-chat', (req, res) => {
  try {
    const room = sendBattleChat(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 22. National Trophy Leaderboard
app.get('/api/cyber/trophy-leaderboard', (req, res) => {
  try {
    const leaderboard = getTrophyLeaderboard(30);
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all: Route all other requests to index.html for SPA/PWA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log('🎮 CYBERGAMES MULTIPLAYER SERVER LISTENING ON PORT ' + PORT);
  console.log('🔗 Live Access: http://localhost:' + PORT);
  console.log('⚔️  1v1 Live Arena & Cyber Comms Social Hub Ready');
  console.log('====================================================');
});
