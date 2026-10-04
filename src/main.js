const appRoot = document.getElementById('app');
const game = new (await import('./core/GameEngine.js')).default(appRoot, 'gameCanvas');
window.cyberGame = game;

const savedScores = JSON.parse(localStorage.getItem('cyber-defense-command-leaderboard') || '[]');
if (!savedScores.length) {
  localStorage.setItem('cyber-defense-command-leaderboard', JSON.stringify([
    { name: 'Delta', score: 1200, wave: 4 },
    { name: 'Nova', score: 980, wave: 3 },
    { name: 'Cipher', score: 760, wave: 2 },
  ]));
}
