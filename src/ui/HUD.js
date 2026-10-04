export class HUD {
  constructor() {
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.creditsDisplay = document.getElementById('creditsDisplay');
    this.waveDisplay = document.getElementById('waveDisplay');
    this.threatCount = document.getElementById('threatCount');
    this.healthText = document.getElementById('healthText');
    this.healthFill = document.getElementById('healthFill');
    this.finalScore = document.getElementById('finalScore');
    this.finalWave = document.getElementById('finalWave');
    this.finalKills = document.getElementById('finalKills');
    this.leaderboardList = document.getElementById('leaderboardList');
  }

  renderMainMenu() {
    document.getElementById('mainMenu')?.classList.add('active');
  }

  showGameView() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('gameScreen')?.classList.add('active');
  }

  showPauseModal() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('pauseScreen')?.classList.add('active');
  }

  hidePauseModal() {
    document.getElementById('pauseScreen')?.classList.remove('active');
    document.getElementById('gameScreen')?.classList.add('active');
  }

  showMainMenu() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('mainMenu')?.classList.add('active');
  }

  showLeaderboard() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('leaderboardScreen')?.classList.add('active');
    this.renderLeaderboard();
  }

  showInstructions() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('instructionsScreen')?.classList.add('active');
  }

  hideAllPanels() {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('mainMenu')?.classList.add('active');
  }

  renderLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('cyber-defense-command-leaderboard') || '[]');
    this.leaderboardList.innerHTML = '';
    if (!scores.length) {
      this.leaderboardList.innerHTML = '<div class="leader-row"><span class="rank">—</span><span class="name">No missions recorded</span><span class="score">0</span><span class="wave">0</span></div>';
      return;
    }

    scores.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = 'leader-row';
      row.innerHTML = `
        <span class="rank">${index + 1}</span>
        <span class="name">${entry.name}</span>
        <span class="score">${entry.score}</span>
        <span class="wave">${entry.wave}</span>
      `;
      this.leaderboardList.appendChild(row);
    });
  }

  showGameOver({ score, wave }) {
    this.finalScore.textContent = score;
    this.finalWave.textContent = wave;
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById('gameOverScreen')?.classList.add('active');
  }

  update({ score, credits, wave, health, maxHealth, threats }) {
    if (this.scoreDisplay) this.scoreDisplay.textContent = score;
    if (this.creditsDisplay) this.creditsDisplay.textContent = credits;
    if (this.waveDisplay) this.waveDisplay.textContent = wave;
    if (this.threatCount) this.threatCount.textContent = threats;
    if (this.healthText) this.healthText.textContent = `${Math.ceil((health / maxHealth) * 100)}%`;
    if (this.healthFill) this.healthFill.style.width = `${Math.max(0, (health / maxHealth) * 100)}%`;
  }
}
