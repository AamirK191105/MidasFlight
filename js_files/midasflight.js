// Midas Flight game logic: progressive levels, combo scoring, and collectibles.

class Midas {
  constructor(x, y, imgSrc) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.velocityY = 0;
    this.img = new Image();
    this.img.src = imgSrc;
  }
  draw(ctx) {
    ctx.save();
    ctx.shadowColor = "rgba(255, 215, 0, 0.75)";
    ctx.shadowBlur = 12;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  update(gravity, boardHeight) {
    this.velocityY += gravity;
    this.y += this.velocityY;
    return this.y < boardHeight;
  }
  jump() {
    this.velocityY = -5.2;
  }
  reset(startY) {
    this.y = startY;
    this.velocityY = 0;
  }
}

class Pipe {
  constructor(x, y, width, height, imgSrc, isTop) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isTop = isTop;
    this.passed = false;
    this.img = new Image();
    this.img.src = imgSrc;
  }
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  update(speed) {
    this.x += speed;
  }
}

class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 13;
    this.collected = false;
    this.spin = Math.random() * Math.PI;
  }
  update(speed) {
    this.x += speed;
    this.spin += 0.12;
  }
  draw(ctx) {
    const width = Math.max(4, Math.abs(Math.cos(this.spin)) * this.radius);
    ctx.save();
    ctx.fillStyle = "#ffd84a";
    ctx.strokeStyle = "#fff3a1";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(255, 216, 74, 0.8)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, width, this.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.board = document.getElementById("board");
    this.ctx = this.board.getContext("2d");
    this.width = 750;
    this.height = 650;
    this.board.width = this.width;
    this.board.height = this.height;
    this.midas = new Midas(
      this.width / 8,
      this.height / 2,
      "../Assets/midasstack1.png",
    );
    this.pipeWidth = 64;
    this.pipeHeight = 512;
    this.pipeX = this.width;
    this.topPipeImg = "../Assets/toppipe.png";
    this.bottomPipeImg = "../Assets/bottompipe.png";
    this.coinImg = "../Assets/coin.png";
    this.levels = [
      {
        name: "GOLDEN DAWN",
        speed: -2.4,
        gravity: 0.15,
        gap: 215,
        spawn: 2400,
        target: 8,
        sky: ["#173b61", "#e9944f"],
      },
      {
        name: "MARKET RUSH",
        speed: -2.8,
        gravity: 0.175,
        gap: 200,
        spawn: 2200,
        target: 14,
        sky: ["#132f52", "#b44b64"],
      },
      {
        name: "CAPITAL CLIMB",
        speed: -3.2,
        gravity: 0.2,
        gap: 185,
        spawn: 2000,
        target: 22,
        sky: ["#101d3c", "#683b75"],
      },
      {
        name: "FORTUNE'S EDGE",
        speed: -3.6,
        gravity: 0.215,
        gap: 170,
        spawn: 1850,
        target: Infinity,
        sky: ["#081527", "#bd6a3d"],
      },
    ];
    this.pipes = [];
    this.coins = [];
    this.particles = [];
    this.level = 1;
    this.levelProgress = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.scoresaved = false;
    this.lastSpawn = 0;
    this.lastTime = 0;
    this.levelBanner = 0;
    document.addEventListener("keydown", (event) => this.handleKeyPress(event));
    this.start();
  }

  start() {
    requestAnimationFrame((time) => this.update(time));
  }

  update(time = performance.now()) {
    const delta = Math.min(32, time - (this.lastTime || time));
    this.lastTime = time;
    if (this.gameOver) {
      if (!this.scoresaved) {
        this.saveScore(this.score);
        this.scoresaved = true;
      }
      this.drawScene();
      this.pipes.forEach((pipe) => pipe.draw(this.ctx));
      this.midas.draw(this.ctx);
      this.drawHUD();
      requestAnimationFrame((nextTime) => this.update(nextTime));
      return;
    }
    if (!this.started) {
      this.drawScene();
      this.midas.draw(this.ctx);
      this.drawHUD();
      requestAnimationFrame((nextTime) => this.update(nextTime));
      return;
    }
    const level = this.getLevel();
    if (time - this.lastSpawn > level.spawn) {
      this.spawnPipes();
      this.lastSpawn = time;
    }
    this.drawScene();
    const stillInBounds = this.midas.update(level.gravity, this.height);
    this.midas.draw(this.ctx);
    if (!stillInBounds || this.midas.y < -this.midas.height) this.endGame();
    for (const pipe of this.pipes) {
      pipe.update(level.speed);
      pipe.draw(this.ctx);
      if (pipe.isTop && !pipe.passed && this.midas.x > pipe.x + pipe.width) {
        pipe.passed = true;
        this.combo += 1;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.score += 10 + Math.min(this.combo * 2, 20);
        this.levelProgress += 1;
        this.addBurst(
          this.midas.x + this.midas.width,
          this.midas.y + 20,
          "#ffd84a",
        );
      }
      if (this.checkCollision(this.midas, pipe)) this.endGame();
    }
    for (const coin of this.coins) {
      coin.update(level.speed);
      if (!coin.collected && this.checkCoinCollision(coin)) {
        coin.collected = true;
        this.score += 25 + this.level * 5;
        this.combo += 1;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.addBurst(coin.x, coin.y, "#fff3a1");
      }
      if (!coin.collected) coin.draw(this.ctx);
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.particles.forEach((particle) => {
      particle.x += particle.vx * (delta / 16);
      particle.y += particle.vy * (delta / 16);
      particle.life -= delta;
      this.ctx.globalAlpha = Math.max(0, particle.life / 500);
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(particle.x, particle.y, 4, 4);
    });
    this.ctx.globalAlpha = 1;
    this.pipes = this.pipes.filter((pipe) => pipe.x + pipe.width > -20);
    this.coins = this.coins.filter(
      (coin) => !coin.collected && coin.x + coin.radius > -20,
    );
    this.checkLevelUp();
    this.drawHUD();
    requestAnimationFrame((nextTime) => this.update(nextTime));
  }

  getLevel() {
    return this.levels[Math.min(this.level - 1, this.levels.length - 1)];
  }

  drawScene() {
    const level = this.getLevel();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, level.sky[0]);
    gradient.addColorStop(1, level.sky[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgba(255, 221, 130, 0.18)";
    for (let index = 0; index < 6; index += 1) {
      const x = index * 170 + ((this.lastTime / 80) % 170) - 170;
      this.ctx.beginPath();
      this.ctx.arc(x, 90 + index * 34, 48, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fillStyle = "rgba(4, 13, 30, 0.32)";
    this.ctx.fillRect(0, this.height - 44, this.width, 44);
  }

  drawHUD() {
    this.ctx.fillStyle = "#fff8dd";
    this.ctx.font = "bold 34px serif";
    this.ctx.fillText(this.score, 18, 45);
    this.ctx.font = "bold 15px sans-serif";
    this.ctx.fillText(`LEVEL ${this.level}  ${this.getLevel().name}`, 20, 68);
    this.ctx.fillText(
      `COMBO x${Math.max(1, this.combo)}`,
      this.width - 130,
      32,
    );
    this.ctx.fillText(`BEST x${this.bestCombo}`, this.width - 130, 53);
    if (Number.isFinite(this.getLevel().target)) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      this.ctx.fillRect(20, this.height - 25, 180, 6);
      this.ctx.fillStyle = "#ffd84a";
      this.ctx.fillRect(
        20,
        this.height - 25,
        180 * Math.min(1, this.levelProgress / this.getLevel().target),
        6,
      );
    }
    if (this.levelBanner > 0) {
      this.levelBanner -= 16;
      this.ctx.save();
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffd84a";
      this.ctx.font = "bold 28px serif";
      this.ctx.fillText(
        `LEVEL ${this.level}: ${this.getLevel().name}`,
        this.width / 2,
        120,
      );
      this.ctx.restore();
    }
    if (this.gameOver) {
      const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));
      const isGuest = !currentuser || currentuser.isGuest;
      this.ctx.fillStyle = "#fff8dd";
      this.ctx.font = "bold 45px serif";
      this.ctx.fillText("GAME OVER!", 18, 112);
      this.ctx.font = "25px serif";
      this.ctx.fillText(
        isGuest ? "Guest scores not saved" : "Score Saved!",
        18,
        155,
      );
      this.ctx.fillText("Press Space to Restart", 18, 190);
    }
    if (!this.started) {
      this.ctx.font = "bold 26px sans-serif";
      this.ctx.fillText("PRESS SPACE TO FLY", 230, this.height / 2 + 95);
    }
  }

  spawnPipes() {
    if (this.gameOver) return;
    const gap = this.getLevel().gap;
    const minTop = -this.pipeHeight + 70;
    const maxTop = this.height - gap - 110 - this.pipeHeight;
    const randomY = minTop + Math.random() * (maxTop - minTop);
    this.pipes.push(
      new Pipe(
        this.pipeX,
        randomY,
        this.pipeWidth,
        this.pipeHeight,
        this.topPipeImg,
        true,
      ),
      new Pipe(
        this.pipeX,
        randomY + this.pipeHeight + gap,
        this.pipeWidth,
        this.pipeHeight,
        this.bottomPipeImg,
        false,
      ),
    );
    this.coins.push(
      new Coin(
        this.pipeX + this.pipeWidth / 2,
        randomY + this.pipeHeight + gap / 2,
      ),
    );
  }

  handleKeyPress(event) {
    if (event.code !== "Space" && event.code !== "ArrowUp") return;
    event.preventDefault();
    if (event.repeat) return;
    if (this.gameOver) this.resetGame();
    else {
      if (!this.started) {
        this.started = true;
        this.lastSpawn = performance.now();
        this.spawnPipes();
      }
      this.midas.jump();
      this.combo = Math.max(0, this.combo - 1);
    }
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  checkCoinCollision(coin) {
    const closestX = Math.max(
      this.midas.x,
      Math.min(coin.x, this.midas.x + this.midas.width),
    );
    const closestY = Math.max(
      this.midas.y,
      Math.min(coin.y, this.midas.y + this.midas.height),
    );
    return Math.hypot(coin.x - closestX, coin.y - closestY) < coin.radius;
  }
  addBurst(x, y, color) {
    for (let index = 0; index < 8; index += 1)
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 500,
        color,
      });
  }
  checkLevelUp() {
    if (
      this.level < this.levels.length &&
      this.levelProgress >= this.getLevel().target
    ) {
      this.level += 1;
      this.levelProgress = 0;
      this.levelBanner = 1500;
      this.addBurst(this.width / 2, 120, "#ffd84a");
    }
  }
  endGame() {
    this.gameOver = true;
    this.combo = 0;
  }

  saveScore(score) {
    const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));
    if (!currentuser || currentuser.isGuest) return;
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({
      firstname: currentuser.firstname || "Unknown",
      score,
      isGuest: false,
    });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }

  resetGame() {
    this.gameOver = false;
    this.scoresaved = false;
    this.pipes = [];
    this.coins = [];
    this.particles = [];
    this.level = 1;
    this.levelProgress = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.score = 0;
    this.started = false;
    this.lastSpawn = performance.now();
    this.lastTime = performance.now();
    this.levelBanner = 0;
    this.midas.reset(this.height / 2);
  }
}

window.onload = () => {
  new Game();
};
