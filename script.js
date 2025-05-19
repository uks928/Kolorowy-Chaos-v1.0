const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const player = {
  x: W / 2,
  y: H / 2,
  r: 30,
  colors: ['red', 'green', 'blue', 'yellow'],
  colorIndex: 0,
  get color() { return this.colors[this.colorIndex]; }
};

let score = 0;
let lives = 3;
const balls = [];
let spawnInterval = 2000;
let lastSpawn = 0;
const speedIncreaseRate = 0.98;

const uiScore = document.getElementById('score');
const uiLives = document.getElementById('lives');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restart');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const lastScoreDiv = document.getElementById('lastScore');
const highScoreDiv = document.getElementById('highScore');

restartBtn.addEventListener('click', () => {
  gameOverDiv.style.display = 'none';
  startScreen.style.display = 'flex';
  canvas.style.display = 'none';
});

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
  requestAnimationFrame(loop);
});

window.addEventListener('keydown', e => {
  if (e.key === 'z' || e.key === 'Z') {
    player.colorIndex = (player.colorIndex - 1 + player.colors.length) % player.colors.length;
  }
  if (e.key === 'x' || e.key === 'X') {
    player.colorIndex = (player.colorIndex + 1) % player.colors.length;
  }
});

function spawnBall() {
  const color = player.colors[Math.floor(Math.random() * player.colors.length)];
  let x, y, angle;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: x = 0; y = Math.random() * H; break;
    case 1: x = W; y = Math.random() * H; break;
    case 2: x = Math.random() * W; y = 0; break;
    case 3: x = Math.random() * W; y = H; break;
  }
  angle = Math.atan2(player.y - y, player.x - x);
  const speed = 2 + Math.random() * 2;
  balls.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 15, color });
}

function update(dt) {
  lastSpawn += dt;
  if (lastSpawn > spawnInterval) {
    spawnBall();
    lastSpawn = 0;
    spawnInterval = Math.max(500, spawnInterval * speedIncreaseRate);
  }

  balls.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    const dx = b.x - player.x;
    const dy = b.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < b.r + player.r) {
      if (b.color === player.color) {
        score++;
        flash('#0f0');
      } else {
        lives--;
        flash('#f00');
        if (lives <= 0) {
          endGame();
        }
      }
      balls.splice(i, 1);
      uiScore.textContent = 'Wynik: ' + score;
      uiLives.textContent = 'Życia: ' + lives;
    }
  }
}

let flashColor = null;
let flashTimer = 0;
function flash(color) {
  flashColor = color;
  flashTimer = 100;
}

function draw() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, W, H);

  if (flashTimer > 0) {
    ctx.fillStyle = flashColor;
    ctx.globalAlpha = flashTimer / 100;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    flashTimer -= 5;
  }

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();

  balls.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
  });
}

let lastTime = performance.now();
function loop(time) {
  const dt = time - lastTime;
  lastTime = time;
  if (lives > 0) {
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
}

function endGame() {
  canvas.style.display = 'none';
  gameOverDiv.style.display = 'block';

  let highScore = localStorage.getItem('highScore') || 0;
  if (score > highScore) {
    localStorage.setItem('highScore', score);
    highScore = score;
  }

  lastScoreDiv.textContent = `Twój wynik: ${score}`;
  highScoreDiv.textContent = `Rekord: ${highScore}`;
  lastScoreDiv.style.display = 'block';
  highScoreDiv.style.display = 'block';
}

function resetGame() {
  score = 0;
  lives = 3;
  spawnInterval = 2000;
  lastSpawn = 0;
  balls.length = 0;
  uiScore.textContent = 'Wynik: 0';
  uiLives.textContent = 'Życia: 3';
  gameOverDiv.style.display = 'none';
  lastScoreDiv.style.display = 'none';
  highScoreDiv.style.display = 'none';
  player.x = W / 2;
  player.y = H / 2;
}
