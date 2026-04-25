// ===============================
//  midasflight.js — Main Game Logic
//  Includes guest handling + score saving
// ===============================

import { leaderboard, currentuser } from "./module.js"; // Import shared data

// ------------------------------
//  Midas Class — player character
// ------------------------------
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

  // Draws Midas on the canvas
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  // Updates Midas position (gravity + movement)
  update(gravity, boardHeight) {
    this.velocityY += gravity;
    this.y += this.velocityY;

    // Returns false if Midas falls off screen → triggers game over
    if (this.y > boardHeight) return false;
    return true;
  }

  // Makes Midas “jump” upward
  jump() {
    this.velocityY = -6;
  }

  // Resets Midas to starting position after restart
  reset(startY) {
    this.y = startY;
    this.velocityY = 0;
  }
}

// ------------------------------
//  Pipe Class — obstacles
// ------------------------------
class Pipe {
  constructor(x, y, width, height, imgSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.img = new Image();
    this.img.src = imgSrc;

    this.passed = false; // Used to track scoring
  }

  // Draw pipe on screen
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  // Move pipe to the left
  update(speed) {
    this.x += speed;
  }
}

// ------------------------------
//  Game Class — main controller
// ------------------------------
class Game {
  constructor() {
    // Setup canvas
    this.board = document.getElementById("board");
    this.ctx = this.board.getContext("2d");
    this.width = 750;
    this.height = 650;
    this.board.width = this.width;
    this.board.height = this.height;

    // Initialize player
    this.midas = new Midas(
      this.width / 8,
      this.height / 2,
      "../Assets/midasstack1.png"
    );

    // Pipe configuration
    this.pipes = [];
    this.pipeWidth = 64;
    this.pipeHeight = 512;
    this.pipeX = this.width;
    this.pipeY = 0;

    this.topPipeImg = "../Assets/toppipe.png";
    this.bottomPipeImg = "../Assets/bottompipe.png";

    // Physics
    this.gravity = 0.4;
    this.velocityX = -4; // pipe speed

    // Game state
    this.gameOver = false;
    this.scoresaved = false;
    this.score = 0;

    // Keyboard control
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Start update + pipe spawn loops
    this.start();
  }

  // --------------------------
  //  Main game loop
  // --------------------------
  start() {
    setInterval(() => this.update(), 1000 / 60); // 60 FPS update
    setInterval(() => this.spawnPipes(), 2000); // spawn new pipes every 2s
  }

  // --------------------------
  //  Game frame update logic
  // --------------------------
  update() {
    if (this.gameOver) {
      // Save score only once when game ends
      if (!this.scoresaved) {
        this.saveScore(this.score);
        this.scoresaved = true;
      }
      return;
    }

    // Clear frame
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update Midas position (gravity) and draw
    const stillInBounds = this.midas.update(this.gravity, this.height);
    this.midas.draw(this.ctx);

    // If out of bounds → end game
    if (!stillInBounds) this.gameOver = true;

    // Move, draw, and check all pipes
    for (let pipe of this.pipes) {
      pipe.update(this.velocityX);
      pipe.draw(this.ctx);

      // Add score when Midas passes a pipe pair
      if (!pipe.passed && this.midas.x > pipe.x + pipe.width) {
        this.score += 0.5; // each pair = 1 full point
        pipe.passed = true;
      }

      // Collision check → game over
      if (this.checkCollision(this.midas, pipe)) {
        this.gameOver = true;
      }
    }

    // Draw score + text overlays
    this.drawHUD();
  }

  // --------------------------
  //  Save score to leaderboard
  // --------------------------
  saveScore(score) {
    // Get current user from sessionStorage
    const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));

    // Skip saving for guests (guest scores are ignored)
    if (!currentuser || currentuser.isGuest) {
      console.log("Guest user - score not saved to leaderboard");
      return;
    }

    // Load leaderboard from localStorage or create new
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const firstname = currentuser.firstname || "Unknown";

    // Add user’s latest score
    leaderboard.push({
      firstname: firstname,
      score: score,
      isGuest: false,
    });

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);

    // Save updated leaderboard
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    console.log(`Score ${score} saved for ${firstname}`);
  }

  // --------------------------
  //  Draw score + messages
  // --------------------------
  drawHUD() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "45px serif";
    this.ctx.fillText(this.score, 5, 45);

    if (this.gameOver) {
      // Get user type (guest or logged in)
      const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));
      const isGuest = !currentuser || currentuser.isGuest;

      // Main game over text
      this.ctx.fillText("GAME OVER!", 5, 90);

      // Guest vs Registered player messages
      if (isGuest) {
        this.ctx.font = "25px serif";
        this.ctx.fillText("Guest scores not saved", 5, 140);
        this.ctx.fillText("Press Space to Restart", 5, 175);
      } else {
        this.ctx.font = "30px serif";
        this.ctx.fillText("Score Saved!", 5, 140);
        this.ctx.fillText("Press Space to Restart", 5, 175);
      }
    }
  }

  // --------------------------
  //  Pipe Spawning
  // --------------------------
  spawnPipes() {
    if (this.gameOver) return;

    // Randomize vertical position and keep a fixed gap
    const randomY =
      this.pipeY - this.pipeHeight / 4 - Math.random() * (this.pipeHeight / 2);
    const gap = this.height / 4;

    const topPipe = new Pipe(
      this.pipeX,
      randomY,
      this.pipeWidth,
      this.pipeHeight,
      this.topPipeImg
    );
    const bottomPipe = new Pipe(
      this.pipeX,
      randomY + this.pipeHeight + gap,
      this.pipeWidth,
      this.pipeHeight,
      this.bottomPipeImg
    );

    // Add both pipes to array
    this.pipes.push(topPipe, bottomPipe);
  }

  // --------------------------
  //  Controls (Space / ArrowUp)
  // --------------------------
  handleKeyPress(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      // Restart if game is over, otherwise jump
      if (this.gameOver) {
        this.resetGame();
      } else {
        this.midas.jump();
      }
    }
  }

  // --------------------------
  //  Collision detection logic
  // --------------------------
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // --------------------------
  //  Restart game to initial state
  // --------------------------
  resetGame() {
    this.gameOver = false;
    this.scoresaved = false;
    this.pipes = [];
    this.score = 0;
    this.midas.reset(this.height / 2);
  }
}

// Initialize game when page loads
window.onload = () => {
  new Game();
};
