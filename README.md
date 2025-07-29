# 🚀 Cosmic Defender - 2D Shoot'em Up Game

A retro-style 2D arcade shoot'em up game built with pure HTML5, CSS3, and JavaScript. Navigate your spaceship through three challenging levels, defeat enemies, collect power-ups, and save the galaxy!

![Game Preview](https://img.shields.io/badge/Game-Playable-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Game Features

- **3 Unique Levels** with distinct themes and challenges
  - Level 1: Deep Space (Blue/Cyan theme)
  - Level 2: Asteroid Field (Orange/Red theme)  
  - Level 3: Alien Mothership (Purple/Green theme)
- **Progressive Difficulty** - Each level introduces new enemy types and challenges
- **Power-up System** - Collect weapon upgrades, health, and special abilities
- **Smooth Gameplay** - 60fps performance with responsive controls
- **Visual Effects** - Particle systems, screen shake, and dynamic backgrounds
- **Audio Feedback** - Sound effects using Web Audio API
- **Local High Scores** - Your best scores are saved locally

## 🕹️ How to Play

### Controls
- **Arrow Keys** - Move your spaceship
- **Spacebar** - Shoot bullets
- **Mouse** - Navigate menus

### Objective
- Destroy all enemies to progress through levels
- Collect power-ups to upgrade your weapons
- Avoid enemy bullets and collisions
- Survive all three levels to win!

### Power-ups
- 🔵 **Health** - Restore your ship's health
- 🔴 **Rapid Fire** - Increased firing rate
- 🟡 **Spread Shot** - Multiple bullets per shot
- 🟢 **Piercing** - Bullets go through multiple enemies

## 🚀 Quick Start

### Option 1: Double-click to Run
1. Download/clone this repository
2. Double-click `start-server.bat`
3. Open your browser to `http://localhost:8000`
4. Click "Start Game" and enjoy!

### Option 2: Manual Server Setup
If you have Node.js installed:
```bash
npx http-server -p 8000
```

If you have Python installed:
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Direct File Access
Double-click `index.html` to open directly in your browser (some features may be limited).

## 📁 Project Structure

```
cosmic-defender/
├── index.html          # Main HTML file
├── styles.css          # All styling and themes
├── game.js             # Complete game logic
├── start-server.bat    # Automated server launcher
└── README.md           # This file
```

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** for rendering
- **CSS3** for UI styling and animations
- **Vanilla JavaScript** for game logic
- **Web Audio API** for sound effects
- **LocalStorage** for high score persistence

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Optimized for 60fps gameplay
- Efficient collision detection
- Memory-conscious particle systems
- Responsive design for different screen sizes

## 🎯 Game Levels

### Level 1: Deep Space
- **Theme**: Dark space with stars
- **Enemies**: Basic fighters with simple movement
- **Challenge**: Learn the controls and basic combat

### Level 2: Asteroid Field
- **Theme**: Orange/red rocky environment
- **Enemies**: Destructible asteroids + aggressive ships
- **Challenge**: Navigate obstacles while fighting

### Level 3: Alien Mothership
- **Theme**: Purple/green alien technology
- **Enemies**: Advanced aliens with complex patterns
- **Challenge**: Final boss battle with multiple phases

## 🏆 Scoring System

- **Enemy Destroyed**: 100-500 points (varies by type)
- **Power-up Collected**: 50 points
- **Level Completion Bonus**: 1000 points
- **Health Remaining Bonus**: 100 points per health point

## 🤝 Contributing

Feel free to contribute to this project! Some ideas:
- Add more levels or enemy types
- Implement new power-ups or weapons
- Improve graphics or add sprite animations
- Add background music
- Create mobile touch controls

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Play Now!

Ready to defend the cosmos? Clone this repo and start playing immediately!

```bash
git clone https://github.com/yourusername/cosmic-defender.git
cd cosmic-defender
# Double-click start-server.bat or run your preferred web server
```

---

**Enjoy the game!** 🚀✨

*Built with ❤️ using vanilla web technologies*
