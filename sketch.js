const W = 600;
const H = 600;
let playerX = W/2;
const SPEED = 0.09;
const TURN_SPEED = 0.2;
let playerY = H/2;
const playerW = 20;
const playerH = 20;
const POV = 0.66;
let time = 0;
let finalTime = 0;
let highscore = 99999999999;
let theta = 0;
let hasWon = 0;
let rayLength = 150;
let thetaIncrement = 3;
const world = [
  ['2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2'],
  ['2', '1', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '1', '0', '2'],
  ['2', '1', '1', '1', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '2'],
  ['2', '0', '1', '1', '0', '0', '1', '0', '1', '1', '1', '1', '0', '0', '2'],
  ['2', '0', '0', '0', '1', '0', '1', '0', '1', '1', '0', '0', '0', '1', '2'],
  ['2', '0', '1', '0', '0', '1', '1', '0', '1', '1', '0', '1', '0', '0', '2'],
  ['2', '0', '0', '1', '1', '1', '1', '0', '0', '1', '1', '0', '1', '0', '2'],
  ['2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '0', '2'],
  ['2', '0', '1', '1', '1', '1', '1', '0', '0', '1', '0', '0', '0', '0', '2'],
  ['2', '0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '1', '2'],
  ['2', '0', '1', '0', '0', '0', '0', '1', '0', '0', '0', '1', '0', '1', '2'],
  ['2', '0', '0', '1', '1', '1', '0', '0', '0', '1', '0', '1', '0', '0', '2'],
  ['2', '0', '1', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '0', '2'],
  ['2', '0', '0', '0', '0', '1', '0', '0', '0', '1', '3', '1', '0', '0', '2'],
  ['2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2']
];
function setup() {
  createCanvas(W, H);
  textSize(32);
  // load highscore
  let savedScore = localStorage.getItem("mazeHighscore");
  if (savedScore !== null) {
    highscore = parseFloat(savedScore);
  }
}
function convertTime(t) { 
  let minutes = floor(t / 1000 / 60);
  let seconds = floor(t / 1000) % 60;
  let milliseconds = floor(t % 1000);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let displayTime = minutes + ":" + seconds + ":" + milliseconds;

  return displayTime;
}
function displayTimer() {
  textSize(32);
  text(convertTime(time), 20, 50);
}
function draw() {
  background(220);

  if (hasWon == 1) {
    noStroke();
    textSize(32);
    text("You have beaten the maze!", W/5, H/2);
    if (finalTime < highscore) {
      highscore = finalTime;
      localStorage.setItem("mazeHighscore", highscore);
    }
    text("Time: " + convertTime(finalTime) + ", Highscore: " + convertTime(highscore), 10, H/2 + 30);
    textSize(25);
    text("Click or press 'r' to play again!", W/5, H/2 + 60);
    return;
  }
  time += deltaTime;
  const tileW = W / world[0].length;
  const tileH = H / world.length;
  
  let sx = playerX + (playerW / 2);
  let sy = playerY + (playerH / 2);
  
  let dirX = cos(radians(theta));
  let dirY = sin(radians(theta));
  let planeX = -dirY * POV;
  let planeY = dirX * POV;

  // Player position in grid-units (crucial for DDA and collision)
  let pos = createVector(sx / tileW, sy / tileH);

  for (let x = 0; x < W; x++) {
    let cameraX = 2 * x / W - 1; 
    let rayDirX = dirX + planeX * cameraX;
    let rayDirY = dirY + planeY * cameraX;

    let mapX = floor(pos.x);
    let mapY = floor(pos.y);

    let deltaDistX = (rayDirX === 0) ? 1e30 : abs(1 / rayDirX);
    let deltaDistY = (rayDirY === 0) ? 1e30 : abs(1 / rayDirY);

    let stepX, stepY, sideDistX, sideDistY;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (pos.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - pos.x) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (pos.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - pos.y) * deltaDistY;
    }

    let hit = 0;
    let side;
    while (hit == 0) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      
      // Boundary check
      if (mapY < 0 || mapY >= world.length || mapX < 0 || mapX >= world[0].length) break;
      
      if (world[mapY][mapX] !== '0') {
        hit = parseInt(world[mapY][mapX]);
      }
    }

    if (hit > 0) {
      let perpWallDist = (side === 0) ? (sideDistX - deltaDistX) : (sideDistY - deltaDistY);
      
      // Draw Wall
      let lineHeight = floor(H / perpWallDist);
      let drawStart = max(0, -lineHeight / 2 + H / 2);
      let drawEnd = min(H - 1, lineHeight / 2 + H / 2);

      let col = (side === 1) ? 150 : 255; // Shading
      strokeWeight(1);
      if (hit === 1) stroke(col, 0, 0);
      else if (hit === 2) stroke(col * 0.2);
      else if (hit === 3) stroke(0, col, 0);
      
      line(x, drawStart, x, drawEnd);
    }
  }

  let moveX = 0;
  let moveY = 0;
  if (keyIsDown(87)) { // W
    moveX += dirX; moveY += dirY;
  } 
  if (keyIsDown(83)) { // S
    moveX -= dirX; moveY -= dirY;
  } 
  if (keyIsDown(65)) { // A 
    moveX += dirY; moveY -= dirX;
  } 
  if (keyIsDown(68)) { // D
    moveX -= dirY; moveY += dirX;
  }

  if (moveX !== 0 || moveY !== 0) {
    // Normalize movement so diagonal isn't faster
    let mag = sqrt(moveX * moveX + moveY * moveY);
    moveX /= mag;
    moveY /= mag;

    let nextPX = playerX + moveX * SPEED * deltaTime;
    let nextPY = playerY + moveY * SPEED * deltaTime;
    
    let margin = 0.2; 

    // Slide on X
    let gridXWithMargin = (nextPX + (moveX > 0 ? playerW + margin * tileW : -margin * tileW)) / tileW;
    if (world[floor(pos.y)][floor(gridXWithMargin)] === '0') {
      playerX = nextPX;
    }

    // Slide on Y
    let gridYWithMargin = (nextPY + (moveY > 0 ? playerH + margin * tileH : -margin * tileH)) / tileH;
    if (world[floor(gridYWithMargin)][floor(pos.x)] === '0') {
      playerY = nextPY;
    }

    if (world[floor(gridYWithMargin)][floor(pos.x)] === '3') {
      finalTime = time;
      hasWon = 1;
    }
  }

  // 4. Rotation
  if (keyIsDown(LEFT_ARROW)) {
    theta -= TURN_SPEED * deltaTime;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    theta += TURN_SPEED * deltaTime;
  }
  displayTimer();
}

function mouseClicked() {
  if (hasWon == 0) {
    return;
  }
  resetGame(); 
}
function keyPressed() {
  if (key === 'r') {
    resetGame();
  }
}
function resetGame() {
  hasWon = 0;
  time = 0;
  playerX = W/2;
  playerY = H/2;
  theta = 0;
}