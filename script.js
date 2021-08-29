// Grab DOM elements
const canvas = document.querySelector("#canvas");
const playBtn = document.querySelector("#play");
const resetBtn = document.querySelector("#reset");
const m1Input = document.querySelector("#m1");
const m2Input = document.querySelector("#m2");
const m1velInput = document.querySelector("#m1vel");
const m2velInput = document.querySelector("#m2vel");

// Get context
const ctx = canvas.getContext("2d");

// Create and call an init function once the DOM has loaded
function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - (window.innerHeight/3);
  resetBtn.style.display = "none";
  playBtn.style.display = "block";
  m1Input.value = b1Mass;
  m2Input.value = b2Mass;
  m1velInput.value = b1vel;
  m2velInput.value = b2vel;
  renderFrame();
}

document.addEventListener("DOMContentLoaded", init);

// Create and call a resize function
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - (window.innerHeight/3);
  renderFrame();
}

window.addEventListener("resize", resize);

// Create block class
class Block {
  constructor(mass, pos, vel, color) {
    this.mass = mass;
    this.pos = pos;
    this.vel = vel;
    this.color = color;
    this.size = mass.toString().length * 20;
  }
  render() {
    ctx.fillStyle = "white";
    ctx.font = "20px googlesans";
    ctx.fillText(
      numberWithCommas(this.mass),
      this.pos + (this.size/2),
      canvas.height - (this.size + 10)
    );
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos, canvas.height - this.size, this.size, this.size);
  }

  update(dt) {
    this.pos += this.vel * dt;
  }
}

// Instantiate two blocks
const b1Pos = 100;
const b1Mass = 1;
const b2Mass = 1000000;
const b2Pos = 250;
let b1vel = 0;
let b2vel = -50;

const block1 = new Block(b1Mass, b1Pos, b1vel, "#03a1fc");
const block2 = new Block(b2Mass, b2Pos, b2vel, "#fc0303");

// Set up a recursive loop
let count = 0;
let lastTime;
let quit = true;
let accumulator = 0;
const dt = 0.0001;
function loop(ts) {
  if (lastTime) {
    let frameTime = ts - lastTime;
    if (frameTime > 250) {
      frameTime = 250;
    }
    accumulator += frameTime;
    while (accumulator >= dt) {
      update(dt);
      accumulator -= dt;
    }
    playClack();
    renderFrame();
  }
  if (!quit) {
    requestAnimationFrame(loop);
    lastTime = ts;
  }
}

// Make an update function
function update(dt) {
  block1.update(dt / 1000);
  block2.update(dt / 1000);
  checkWall(block1);
  checkBlockCollision(block1, block2);
}

// Make a render function
function renderFrame() {
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px googlesans";
  ctx.textAlign = "center";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#000";
  ctx.fillText(`Collisions: ${numberWithCommas(count)}`, canvas.width/2, canvas.height/4);
  ctx.fillText(`Velocity 1: ${Math.floor(block1.vel)}`, canvas.width/2, canvas.height/4 + 25);
  ctx.fillText(`Velocity 2: ${Math.floor(block2.vel)}`, canvas.width/2, canvas.height/4 + 50);
  ctx.shadowColor = "#03a1fc";
  block1.render();
  ctx.shadowColor = "#fc0303";
  block2.render();
}

// Make check wall function
function checkWall(blk) {
  if (blk.pos <= 0) {
    blk.pos = 0;
    blk.vel *= -1;
    count++;
    clacking = true;
  }
}
// Check collisions between blocks
function checkBlockCollision(blk1, blk2) {
  if (blk1.pos + blk1.size >= blk2.pos) {
    blk1.pos = blk2.pos - blk1.size;

    const m1 = blk1.mass;
    const m2 = blk2.mass;
    const v1i = blk1.vel;
    const v2i = blk2.vel;

    const mom1 = m1 * v1i + m2 * v2i;

    const v2f = (m1 * v2i - m1 * v1i - mom1) / (-1 * m2 - m1);
    const v1f = v2i + v2f - v1i;

    blk1.vel = v1f;
    blk2.vel = v2f;
    count++;
    clacking = true;
  }
}

// Make a play function and bind it to the play button
function play() {
  quit = false;
  playBtn.style.display = "none";
  resetBtn.style.display = "block";
  block1.vel = Math.floor(m1velInput.value);
  block2.vel = Math.floor(m2velInput.value);
  requestAnimationFrame(loop);
}

playBtn.addEventListener("click", play);

// Make a reset function and bind it to the reset button
function reset() {
  quit = true;
  playBtn.style.display = "block";
  resetBtn.style.display = "none";
  block1.pos = b1Pos;
  block1.vel = b1vel;
  block2.pos = b2Pos;
  block2.vel = b2vel;
  count = 0;
  lastTime = null;
  renderFrame();
}

resetBtn.addEventListener("click", reset);

// Make update mass function
function updateMass(mass, blk) {
  blk.mass = mass;
  if (mass < 1) {
    blk.size = 5;
  } else {
    blk.size = mass.toString().length * 20;
  }
  renderFrame();
}


m1Input.addEventListener("input", e => updateMass(e.target.value, block1));
m2Input.addEventListener("input", e => updateMass(e.target.value, block2));


// Number formatting utility
function numberWithCommas(x) {
  if (parseFloat(x) >= 1) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x;
  }
}

// BONUS --- Clack sound!
const clack = new Audio("clack.wav");
let clacking = false;

const playClack = () => {
  if (clacking === true) {
    clack.currentTime = 0;
    clack.play();
    clacking = false;
  }
};
