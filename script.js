// get elements from the html
const canvas = document.querySelector("#canvas");
const playButton = document.querySelector("#play");
const resetButton = document.querySelector("#reset");
const mass1Input = document.querySelector("#mass1");
const mass2Input = document.querySelector("#mass2");
const mass1velInput = document.querySelector("#mass1vel");
const mass2velInput = document.querySelector("#mass2vel");
// get canvas
const ctx = canvas.getContext("2d");

// things to run once everything has loaded
function initialise() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - (window.innerHeight/3);
  // hide the reset button and show the play button
  resetButton.style.display = "none";
  playButton.style.display = "block";
  mass1Input.value = b1Mass;
  mass2Input.value = b2Mass;
  mass1velInput.value = b1vel;
  mass2velInput.value = b2vel;
  renderFrame();
}
document.addEventListener("DOMContentLoaded", initialise);

// things to run whenever the window changes size
function resize() {
  // resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - (window.innerHeight/3);
  // re-render canvas to prevent canvas from being blank
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

// default values for the blocks
const b1Pos = 100;
const b1Mass = 1;
const b2Mass = 1000000;
const b2Pos = 250;
// use let instead of const so that the velocity can change during runtime
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
  ctx.font = canvas.height/17 + "px googlesans";
  ctx.textAlign = "center";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#000";
  ctx.fillText(`Collisions: ${numberWithCommas(count)}`, canvas.width/2, canvas.height/4);
  ctx.fillText(`Velocity 1: ${Math.floor(block1.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/12);
  ctx.fillText(`Velocity 2: ${Math.floor(block2.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/6);
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
  playButton.style.display = "none";
  resetButton.style.display = "block";
  block1.vel = Math.floor(mass1velInput.value);
  block2.vel = Math.floor(mass2velInput.value);
  requestAnimationFrame(loop);
}

playButton.addEventListener("click", play);

// Make a reset function and bind it to the reset button
function reset() {
  quit = true;
  playButton.style.display = "block";
  resetButton.style.display = "none";
  block1.pos = b1Pos;
  block1.vel = b1vel;
  block2.pos = b2Pos;
  block2.vel = b2vel;
  count = 0;
  lastTime = null;
  renderFrame();
}

resetButton.addEventListener("click", reset);

// Make update mass function
function updateMass(mass, blk, input) {
  if (input === mass1Input) {
    if (mass > 1000000) {
      mass = 1000000;
      input.value = 1000000;
    }
    if (mass < 1) {
      mass = 1;
      input.value = 1;
    }
  }
  else if (mass > 10000000000000) {
    mass = 10000000000000;
    input.value = 10000000000000;
  }
  blk.mass = mass;
  if (mass < 1) {
    blk.size = 5;
  } else {
    blk.size = mass.toString().length * 20;
  }
  renderFrame();
}


mass1Input.addEventListener("input", e => updateMass(e.target.value, block1, mass1Input));
mass2Input.addEventListener("input", e => updateMass(e.target.value, block2, mass2Input));


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
