// Cosmic Defender - 2D Shoot'em Up Game
// Game State Management and Core Logic

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.highScore = localStorage.getItem('cosmicDefenderHighScore') || 0;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        
        // Level management
        this.levelData = this.initializeLevels();
        this.enemySpawnTimer = 0;
        this.levelScore = 0;
        this.enemiesKilled = 0;
        this.shotsFired = 0;
        this.levelStartTime = 0;
        
        // Input handling
        this.keys = {};
        this.lastShotTime = 0;
        
        // Animation
        this.lastTime = 0;
        this.animationId = null;
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        this.initializeAudio();
        
        this.initializeEventListeners();
        this.initializeUI();
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sounds = {
                shoot: this.createTone(800, 0.1, 'square'),
                enemyHit: this.createTone(400, 0.2, 'sawtooth'),
                explosion: this.createTone(200, 0.5, 'sawtooth'),
                powerUp: this.createTone(600, 0.3, 'sine'),
                levelComplete: this.createTone(1000, 1.0, 'sine')
            };
        } catch (e) {
            console.log('Audio not supported');
            this.audioContext = null;
        }
    }
    
    createTone(frequency, duration, type) {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    initializeLevels() {
        return {
            1: {
                name: "Deep Space Patrol",
                theme: "space",
                enemyTypes: ['fighter'],
                spawnRate: 120,
                enemySpeed: 1,
                enemyHealth: 1,
                enemiesToKill: 15,
                backgroundColor: 'linear-gradient(180deg, #001122 0%, #000033 100%)'
            },
            2: {
                name: "Asteroid Field",
                theme: "asteroid",
                enemyTypes: ['fighter', 'asteroid'],
                spawnRate: 90,
                enemySpeed: 1.5,
                enemyHealth: 2,
                enemiesToKill: 20,
                backgroundColor: 'linear-gradient(180deg, #331100 0%, #441100 100%)'
            },
            3: {
                name: "Alien Mothership",
                theme: "alien",
                enemyTypes: ['fighter', 'interceptor', 'asteroid'],
                spawnRate: 70,
                enemySpeed: 2,
                enemyHealth: 3,
                enemiesToKill: 25,
                backgroundColor: 'linear-gradient(180deg, #220033 0%, #330044 50%, #110022 100%)'
            }
        };
    }
    
    initializeEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            
            // Handle pause
            if (e.code === 'KeyP' && this.state === 'playing') {
                this.pauseGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMenu());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('pauseMenuButton').addEventListener('click', () => this.showMenu());
    }
    
    initializeUI() {
        document.getElementById('highScore').textContent = this.highScore;
        this.updateUI();
    }
    
    startGame() {
        this.state = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.levelScore = 0;
        this.enemiesKilled = 0;
        this.shotsFired = 0;
        this.levelStartTime = Date.now();
        
        // Resume audio context if needed
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Clear all game objects
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        
        // Initialize player
        this.player = new Player(this.width / 2, this.height - 100);
        
        // Hide menus
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('levelCompleteScreen').classList.add('hidden');
        
        // Set level theme
        this.setLevelTheme(this.currentLevel);
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
        
        this.updateUI();
    }
    
    setLevelTheme(level) {
        const body = document.body;
        body.className = `level-${level}`;
        
        const levelData = this.levelData[level];
        if (levelData) {
            this.canvas.style.background = levelData.backgroundColor;
        }
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    showMenu() {
        this.state = 'menu';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Hide all screens
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('levelCompleteScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        
        // Show start screen
        document.getElementById('startScreen').classList.remove('hidden');
        
        // Reset theme
        document.body.className = '';
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > 3) {
            this.gameWin();
            return;
        }
        
        // Clear enemies and bullets
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.explosions = [];
        
        // Reset level stats
        this.levelScore = 0;
        this.enemiesKilled = 0;
        this.enemySpawnTimer = 0;
        this.levelStartTime = Date.now();
        
        // Set new theme
        this.setLevelTheme(this.currentLevel);
        
        // Hide level complete screen
        document.getElementById('levelCompleteScreen').classList.add('hidden');
        
        // Resume game
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
        
        this.updateUI();
    }
    
    gameWin() {
        this.state = 'gameOver';
        
        // Calculate final score bonus
        const completionBonus = 10000;
        this.score += completionBonus;
        
        // Check for high score
        let isNewHighScore = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cosmicDefenderHighScore', this.highScore);
            isNewHighScore = true;
        }
        
        // Show win screen (reuse game over screen but with different message)
        document.getElementById('gameOverScreen').querySelector('.screen-title').textContent = 'MISSION ACCOMPLISHED!';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.currentLevel;
        
        if (isNewHighScore) {
            document.getElementById('newHighScore').classList.remove('hidden');
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Check for high score
        let isNewHighScore = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cosmicDefenderHighScore', this.highScore);
            isNewHighScore = true;
        }
        
        // Show game over screen
        document.getElementById('gameOverScreen').querySelector('.screen-title').textContent = 'MISSION FAILED';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.currentLevel;
        
        if (isNewHighScore) {
            document.getElementById('newHighScore').classList.remove('hidden');
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    levelComplete() {
        this.state = 'levelComplete';
        
        // Calculate level stats
        const accuracy = this.shotsFired > 0 ? Math.round((this.enemiesKilled / this.shotsFired) * 100) : 0;
        const bonusPoints = Math.round(this.levelScore * 0.1);
        this.score += bonusPoints;
        
        // Show level complete screen
        document.getElementById('levelScore').textContent = this.levelScore;
        document.getElementById('bonusPoints').textContent = bonusPoints;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.player) {
            const healthPercent = (this.player.health / this.player.maxHealth) * 100;
            document.getElementById('healthFill').style.width = healthPercent + '%';
            
            const ammoPercent = (this.player.ammo / this.player.maxAmmo) * 100;
            document.getElementById('ammoFill').style.width = ammoPercent + '%';
            
            document.getElementById('weaponType').textContent = this.player.weaponType;
        }
    }
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game objects
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        // Update player
        this.player.update(deltaTime, this.keys, this);
        
        // Update enemies
        this.enemies.forEach((enemy, index) => {
            enemy.update(deltaTime, this);
            if (enemy.markedForDeletion) {
                this.enemies.splice(index, 1);
            }
        });
        
        // Update bullets
        this.playerBullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (bullet.markedForDeletion) {
                this.playerBullets.splice(index, 1);
            }
        });
        
        this.enemyBullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (bullet.markedForDeletion) {
                this.enemyBullets.splice(index, 1);
            }
        });
        
        // Update power-ups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update(deltaTime);
            if (powerUp.markedForDeletion) {
                this.powerUps.splice(index, 1);
            }
        });
        
        // Update particles and explosions
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.markedForDeletion) {
                this.particles.splice(index, 1);
            }
        });
        
        this.explosions.forEach((explosion, index) => {
            explosion.update(deltaTime);
            if (explosion.markedForDeletion) {
                this.explosions.splice(index, 1);
            }
        });
        
        // Spawn enemies
        this.spawnEnemies(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check level completion
        this.checkLevelCompletion();
        
        // Update UI
        this.updateUI();
    }
    
    spawnEnemies(deltaTime) {
        const levelData = this.levelData[this.currentLevel];
        if (!levelData) return;
        
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer >= levelData.spawnRate) {
            this.enemySpawnTimer = 0;
            
            // Choose random enemy type
            const enemyTypes = levelData.enemyTypes;
            const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            // Spawn enemy
            const x = Math.random() * (this.width - 60) + 30;
            const y = -30;
            
            this.enemies.push(new Enemy(x, y, randomType, this.currentLevel));
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.playerBullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    // Damage enemy
                    enemy.takeDamage(bullet.damage);
                    
                    // Remove bullet
                    bullet.markedForDeletion = true;
                    
                    // Play hit sound
                    this.playSound('enemyHit');
                    
                    // Create impact particles
                    this.createParticles(enemy.x, enemy.y, '#ffff00', 5);
                    
                    // If enemy is destroyed
                    if (enemy.health <= 0) {
                        // Add score
                        this.score += enemy.points;
                        this.levelScore += enemy.points;
                        this.enemiesKilled++;
                        
                        // Play explosion sound
                        this.playSound('explosion');
                        
                        // Create explosion
                        this.explosions.push(new Explosion(enemy.x, enemy.y, 'enemy'));
                        
                        // Chance to drop power-up
                        if (Math.random() < 0.15) {
                            this.powerUps.push(new PowerUp(enemy.x, enemy.y));
                        }
                        
                        enemy.markedForDeletion = true;
                    }
                }
            });
        });
        
        // Enemy bullets vs player
        this.enemyBullets.forEach((bullet, index) => {
            if (this.checkCollision(bullet, this.player)) {
                // Damage player
                this.player.takeDamage(bullet.damage);
                
                // Remove bullet
                bullet.markedForDeletion = true;
                
                // Create impact particles
                this.createParticles(this.player.x, this.player.y, '#ff0000', 8);
                
                // Screen shake effect
                this.screenShake(5);
                
                // Check if player is destroyed
                if (this.player.health <= 0) {
                    this.lives--;
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        // Respawn player
                        this.player = new Player(this.width / 2, this.height - 100);
                        this.createParticles(this.width / 2, this.height - 100, '#00ffff', 15);
                    }
                }
            }
        });
        
        // Enemies vs player
        this.enemies.forEach((enemy, index) => {
            if (this.checkCollision(enemy, this.player)) {
                // Damage both
                this.player.takeDamage(enemy.contactDamage);
                enemy.takeDamage(999); // Destroy enemy
                
                // Create explosions
                this.explosions.push(new Explosion(enemy.x, enemy.y, 'enemy'));
                this.createParticles(this.player.x, this.player.y, '#ff0000', 10);
                
                // Screen shake
                this.screenShake(8);
                
                enemy.markedForDeletion = true;
                
                // Check if player is destroyed
                if (this.player.health <= 0) {
                    this.lives--;
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.player = new Player(this.width / 2, this.height - 100);
                        this.createParticles(this.width / 2, this.height - 100, '#00ffff', 15);
                    }
                }
            }
        });
        
        // Power-ups vs player
        this.powerUps.forEach((powerUp, index) => {
            if (this.checkCollision(powerUp, this.player)) {
                powerUp.apply(this.player);
                this.playSound('powerUp');
                this.createParticles(powerUp.x, powerUp.y, powerUp.color, 12);
                powerUp.markedForDeletion = true;
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    checkLevelCompletion() {
        const levelData = this.levelData[this.currentLevel];
        if (!levelData) return;
        
        // Check if required enemies have been killed
        if (this.enemiesKilled >= levelData.enemiesToKill) {
            this.playSound('levelComplete');
            this.levelComplete();
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    screenShake(intensity) {
        // Simple screen shake effect
        const canvas = this.canvas;
        const originalTransform = canvas.style.transform;
        
        canvas.style.transform = `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`;
        
        setTimeout(() => {
            canvas.style.transform = originalTransform;
        }, 100);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render background stars/effects
        this.renderBackground();
        
        // Render game objects
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.playerBullets.forEach(bullet => bullet.render(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        this.explosions.forEach(explosion => explosion.render(this.ctx));
    }
    
    renderBackground() {
        // Add moving stars or other background effects based on level
        const levelData = this.levelData[this.currentLevel];
        
        // Simple star field
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width;
            const y = (i * 17 + Date.now() * 0.01) % this.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
}

// Game Object Classes

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 100;
        this.maxAmmo = 100;
        this.weaponType = "PULSE CANNON";
        this.fireRate = 200; // milliseconds between shots
        this.lastShotTime = 0;
        this.color = '#00ffff';
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
    }
    
    update(deltaTime, keys, game) {
        // Movement
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x = Math.min(game.width - this.width, this.x + this.speed);
        }
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.y = Math.max(0, this.y - this.speed);
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.y = Math.min(game.height - this.height, this.y + this.speed);
        }
        
        // Shooting
        if (keys['Space'] && this.canShoot()) {
            this.shoot(game);
        }
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Regenerate ammo slowly
        if (this.ammo < this.maxAmmo) {
            this.ammo = Math.min(this.maxAmmo, this.ammo + deltaTime * 0.05);
        }
    }
    
    canShoot() {
        const now = Date.now();
        return now - this.lastShotTime >= this.fireRate && this.ammo >= 10;
    }
    
    shoot(game) {
        this.lastShotTime = Date.now();
        this.ammo -= 10;
        game.shotsFired++;
        
        // Create bullet
        const bullet = new Bullet(
            this.x + this.width / 2 - 2,
            this.y,
            0, -8, // velocity
            'player',
            25
        );
        
        game.playerBullets.push(bullet);
        
        // Create muzzle flash particles
        game.createParticles(this.x + this.width / 2, this.y, '#ffff00', 3);
    }
    
    takeDamage(damage) {
        if (!this.invulnerable) {
            this.health = Math.max(0, this.health - damage);
            this.invulnerable = true;
            this.invulnerabilityTimer = 1000; // 1 second of invulnerability
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Flash effect when invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw ship
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw ship details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 15, this.y + 5, 10, 30);
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(this.x + 5, this.y + 35, 30, 5);
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type, level) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;
        this.markedForDeletion = false;
        
        // Set properties based on type
        switch (type) {
            case 'fighter':
                this.width = 30;
                this.height = 30;
                this.speed = 1 + level * 0.5;
                this.health = level;
                this.maxHealth = this.health;
                this.points = 100;
                this.contactDamage = 20;
                this.color = '#ff4444';
                this.shootTimer = 0;
                this.shootInterval = 2000;
                break;
            case 'asteroid':
                this.width = 40;
                this.height = 40;
                this.speed = 0.5 + level * 0.3;
                this.health = level * 2;
                this.maxHealth = this.health;
                this.points = 50;
                this.contactDamage = 30;
                this.color = '#888888';
                this.rotation = 0;
                this.rotationSpeed = 0.02;
                break;
            case 'interceptor':
                this.width = 25;
                this.height = 25;
                this.speed = 2 + level * 0.5;
                this.health = Math.ceil(level * 1.5);
                this.maxHealth = this.health;
                this.points = 200;
                this.contactDamage = 25;
                this.color = '#ff00ff';
                this.shootTimer = 0;
                this.shootInterval = 1500;
                this.zigzag = 0;
                break;
        }
    }
    
    update(deltaTime, game) {
        // Movement patterns based on type
        switch (this.type) {
            case 'fighter':
                this.y += this.speed;
                this.shootTimer += deltaTime;
                if (this.shootTimer >= this.shootInterval) {
                    this.shoot(game);
                    this.shootTimer = 0;
                }
                break;
            case 'asteroid':
                this.y += this.speed;
                this.rotation += this.rotationSpeed;
                break;
            case 'interceptor':
                this.y += this.speed;
                this.zigzag += deltaTime * 0.003;
                this.x += Math.sin(this.zigzag) * 2;
                this.shootTimer += deltaTime;
                if (this.shootTimer >= this.shootInterval) {
                    this.shoot(game);
                    this.shootTimer = 0;
                }
                break;
        }
        
        // Remove if off screen
        if (this.y > game.height + 50) {
            this.markedForDeletion = true;
        }
    }
    
    shoot(game) {
        if (this.type === 'asteroid') return; // Asteroids don't shoot
        
        const bullet = new Bullet(
            this.x + this.width / 2 - 2,
            this.y + this.height,
            0, 3, // velocity
            'enemy',
            15
        );
        
        game.enemyBullets.push(bullet);
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    render(ctx) {
        ctx.save();
        
        if (this.type === 'asteroid') {
            // Rotate asteroids
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-this.width / 2, -this.height / 2);
        }
        
        // Draw enemy
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Add type-specific details
        if (this.type === 'fighter') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 5, 10, 20);
        } else if (this.type === 'interceptor') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(5, 5, 15, 15);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(8, 8, 9, 9);
        }
        
        ctx.restore();
        
        // Health bar for stronger enemies
        if (this.maxHealth > 1) {
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width, 4);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width * healthPercent, 4);
        }
    }
}

class Bullet {
    constructor(x, y, vx, vy, owner, damage) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.damage = damage;
        this.width = 4;
        this.height = 10;
        this.markedForDeletion = false;
        this.color = owner === 'player' ? '#00ffff' : '#ff4444';
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Remove if off screen
        if (this.y < -20 || this.y > 620 || this.x < -20 || this.x > 820) {
            this.markedForDeletion = true;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 1;
        this.markedForDeletion = false;
        this.pulse = 0;
        
        // Random power-up type
        const types = ['health', 'ammo', 'weapon', 'shield'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        switch (this.type) {
            case 'health':
                this.color = '#ff6666';
                break;
            case 'ammo':
                this.color = '#66ff66';
                break;
            case 'weapon':
                this.color = '#ffff66';
                break;
            case 'shield':
                this.color = '#6666ff';
                break;
        }
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.pulse += deltaTime * 0.005;
        
        if (this.y > 620) {
            this.markedForDeletion = true;
        }
    }
    
    apply(player) {
        switch (this.type) {
            case 'health':
                player.health = Math.min(player.maxHealth, player.health + 25);
                break;
            case 'ammo':
                player.ammo = player.maxAmmo;
                break;
            case 'weapon':
                player.fireRate = Math.max(50, player.fireRate - 20);
                break;
            case 'shield':
                player.invulnerable = true;
                player.invulnerabilityTimer = 3000;
                break;
        }
    }
    
    render(ctx) {
        const scale = 1 + Math.sin(this.pulse) * 0.2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Add glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.markedForDeletion = false;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.restore();
    }
}

class Explosion {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.particles = [];
        this.life = 1.0;
        this.decay = 0.05;
        this.markedForDeletion = false;
        
        // Create explosion particles
        const particleCount = type === 'enemy' ? 15 : 25;
        const colors = type === 'enemy' ? ['#ff4444', '#ff8844', '#ffff44'] : ['#4444ff', '#44ffff', '#ffffff'];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2
            });
        }
    }
    
    update(deltaTime) {
        this.life -= this.decay;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
        
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                this.x + particle.x,
                this.y + particle.y,
                particle.size,
                particle.size
            );
        });
        
        ctx.restore();
    }
}

// Initialize and start the game when the page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});
