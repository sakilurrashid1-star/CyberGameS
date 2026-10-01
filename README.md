<!-- markdownlint-disable MD041 -->
# 🛡️ CyberGameS - Cybersecurity Defense Game

An addictive interactive browser-based game where you defend your network firewall against cyber threats! Learn cybersecurity concepts while having fun.

## 🎮 Game Overview

CyberGameS is an engaging cybersecurity-themed game that teaches network defense concepts through interactive gameplay. Protect your system from malware, spyware, and other cyber threats while collecting security updates.

### Features

- 🎯 **Challenging Gameplay** - Progressive difficulty levels that increase with your score
- 🛡️ **Firewall Defense** - Control your firewall shield to block incoming threats
- 📊 **Real-time Statistics** - Track your health, score, level, and survival time
- 🏆 **Leaderboard System** - Save scores and compete with others locally
- 🎨 **Modern UI** - Sleek cybersecurity-themed interface with smooth animations
- 📱 **Responsive Design** - Play on desktop, tablet, or mobile devices
- 🔊 **Visual Feedback** - Explosion effects and particle systems for satisfying gameplay
- ⚡ **Power-ups** - Limited Shield Boost ability to help you survive tough moments

## 🕹️ How to Play

### Objective
Defend your network firewall by blocking malicious packets and preventing cyber attacks from breaching your system.

### Controls
- **Mouse Movement**: Move your firewall shield left and right
- **Space Bar or Click**: Activate Shield Boost (limited uses per level)
- **Pause Button**: Temporarily pause the game
- **Quit Button**: End the current game session

### Threat Types
- **🦠 Malware (Red)** - Dangerous threats worth 10 points each. Get blocked by your firewall for points.
- **👁️ Spyware (Yellow)** - Dangerous threats that deal 15 damage if they hit. Worth fewer points if blocked.
- **✓ Updates (Green)** - Beneficial packets that restore 15 health points.

### Gameplay Mechanics
1. **Health System** - You start with 100 health points
2. **Scoring** - Block malware (+10 points), collect updates (+5 points)
3. **Level Progression** - Every 500 points increases your level
4. **Difficulty Scaling** - More threats spawn as you level up
5. **Shield Boost** - Use your 3 shield boosts strategically to block threats for 3 seconds

### Strategies
- Save your shield boosts for critical moments
- Prioritize blocking red (malware) packets for maximum points
- Collect green packets to restore health
- The more threats on screen, the harder the game becomes

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sakilurrashid1-star/CyberGameS.git
cd CyberGameS
```

2. Open in your browser:
   - Simply open `index.html` in any modern web browser
   - No server or installation required!
   - Works offline once loaded

### Browser Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTML5 Canvas support
- JavaScript enabled
- Local Storage support (for leaderboard)

## 📁 Project Structure

```
CyberGameS/
├── index.html          # Main HTML structure and UI
├── styles.css          # Styling and animations
├── game.js             # Game logic and mechanics
└── README.md           # This file
```

### File Descriptions

#### `index.html`
- Game structure and layout
- Screen definitions (Menu, Game, Game Over, Leaderboard, etc.)
- UI elements and buttons
- Canvas element for game rendering

#### `styles.css`
- Modern cybersecurity-themed styling
- Responsive design for all screen sizes
- Animations and transitions
- Color scheme with cyan accents
- Mobile-friendly breakpoints

#### `game.js`
- Complete game logic and mechanics
- Canvas rendering and drawing functions
- Game state management
- Collision detection
- Score system and leaderboard management
- Event handling (mouse, keyboard)

## 🎨 Game Features Breakdown

### 1. **Main Menu**
- Start Game button
- View Leaderboard
- Access Instructions
- Glowing title with cybersecurity theme

### 2. **Game Screen**
- Real-time health bar
- Score counter
- Level indicator
- Boost count display
- Game canvas with animated background grid

### 3. **Leaderboard**
- Top 50 scores displayed
- Player name, score, level, and survival time
- Persistent storage using browser's Local Storage
- Automatic sorting by score

### 4. **Instructions**
- Clear gameplay objectives
- Control instructions
- Threat type explanations
- Strategic tips

### 5. **Game Over Screen**
- Final score display
- Level reached
- Survival time
- Option to save score with player name
- Play again or return to menu

## 🔧 Customization

### Adjusting Difficulty

Edit `game.js` configuration in `GAME_CONFIG`:

```javascript
GAME_CONFIG = {
    player: {
        initialHealth: 100,      // Starting health
        maxBoosts: 3            // Shield boosts per game
    },
    enemies: {
        initialCount: 3,
        maxPerLevel: 12,
        spawnInterval: 1500     // Milliseconds between spawns
    },
    packets: {
        speeds: {
            malware: 4,         // Red packets speed
            spyware: 3,         // Yellow packets speed
            update: 2           // Green packets speed
        }
    }
};
```

### Customizing Appearance

Edit `styles.css` CSS variables:

```css
:root {
    --primary-color: #0d47a1;
    --accent-cyan: #00bcd4;
    --success-color: #4caf50;
    --danger-color: #f44336;
    /* ... more colors ... */
}
```

### Adjusting Game Mechanics

- **Scoring**: Modify `handlePacketBlock()`, `handleUpdatePacket()` functions
- **Health damage**: Change values in `handleSpywareHit()`, packet escape logic
- **Spawn rate**: Adjust `spawnRate` calculation in `update()` function
- **Level progression**: Modify score threshold in level calculation

## 💾 Local Storage

The game uses browser's Local Storage to persist:
- **Leaderboard scores** - Stored as `cybergames_scores` JSON array
- **Top 100 scores** - Automatically maintained
- **Score data** - Name, score, level, time, timestamp

To clear data:
```javascript
localStorage.removeItem('cybergames_scores');
```

## 🐛 Known Issues & Improvements

### Potential Future Features
- [ ] Sound effects and background music
- [ ] Multiple game modes
- [ ] Different difficulty levels (Easy, Normal, Hard)
- [ ] Power-up system with various effects
- [ ] Achievements and badges
- [ ] Cloud leaderboard integration
- [ ] Mobile touch controls
- [ ] Tutorial mode
- [ ] Customizable player profiles
- [ ] Particle effects enhancements

### Performance Optimization
- Canvas rendering is optimized for 60 FPS
- Particles are limited to prevent lag
- Responsive canvas resizing
- Efficient collision detection

## 🌐 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full Support |
| Firefox | ✅ Full Support |
| Safari | ✅ Full Support |
| Edge | ✅ Full Support |
| Mobile Chrome | ✅ Full Support |
| Mobile Safari | ✅ Full Support |

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly buttons
- Mouse tracking works on mobile
- Adjusted UI for smaller screens
- Landscape mode recommended for best experience

## 🎓 Learning Outcomes

Playing CyberGameS helps you understand:
- **Firewall concepts** - How firewalls protect networks
- **Threat types** - Different kinds of cyber threats (malware, spyware)
- **Defense mechanisms** - How to respond to security threats
- **System health** - Importance of updates and security patches
- **Incident response** - Making quick decisions under pressure

## 🔐 Security Note

This is an educational game and does NOT:
- Connect to real networks
- Perform actual hacking or security scanning
- Store personal information
- Require any permissions
- Collect any data

## 📄 License

This project is open source and free to use. Feel free to modify and share!

## 🤝 Contributing

Found a bug? Have a suggestion? Feel free to:
1. Report issues
2. Suggest improvements
3. Create pull requests
4. Share feedback

## 👨‍💻 Author

Created by **Sakil Ur Rashid**

## 🌟 Enjoy the Game!

CyberGameS is designed to be fun while teaching cybersecurity concepts. Challenge yourself, climb the leaderboard, and protect your network!

**Happy Defending! 🛡️**

---

## 🔗 Quick Links

- **Play Game**: Open `index.html` in your browser
- **Report Issues**: Create an issue on GitHub
- **Source Code**: Visit the [GitHub Repository](https://github.com/sakilurrashid1-star/CyberGameS)

## 📊 Game Statistics

- **Canvas Resolution**: Up to 1200x700px (responsive)
- **Max Concurrent Threats**: ~60 packets
- **Frame Rate**: 60 FPS
- **Game States**: 4 (Menu, Playing, Paused, Game Over)
- **Leaderboard Capacity**: Top 100 scores

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Status**: Active Development ✨

May the best defender win! 🏆
