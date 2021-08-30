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
  renderCanvas();
}
document.addEventListener("DOMContentLoaded", initialise);

// things to run whenever the window changes size
function resize() {
  // resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - (window.innerHeight/3);
  // re-render canvas to prevent canvas from being blank
  renderCanvas();
}
window.addEventListener("resize", resize);

// Create block class
class Block {
  constructor(mass, pos, vel, color) {
    this.mass = mass;
    this.pos = pos;
    this.vel = vel;
    this.color = color;
    this.size = mass.toString().length * 30;
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
let pause = true;
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
    playClick();
    renderCanvas();
  }
  if (!pause) {
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

// called whenever the canvas needs to be rendered
function renderCanvas() {
  // text colour white
  ctx.fillStyle = "white";
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // font may revert to default if not installed - havent checked
  ctx.font = canvas.height/17 + "px googlesans";
  ctx.textAlign = "center";
  // glow + dropshadow effect for canvas elements
  ctx.shadowBlur = 20;
  // black
  ctx.shadowColor = "#000";
  ctx.fillText(`Collisions: ${numberWithCommas(count)}`, canvas.width/2, canvas.height/4);
  ctx.fillText(`Velocity 1: ${Math.floor(block1.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/12);
  ctx.fillText(`Velocity 2: ${Math.floor(block2.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/6);
  // blue
  ctx.shadowColor = "#03a1fc";
  block1.render();
  // red
  ctx.shadowColor = "#fc0303";
  block2.render();
}

// collision with the left side of the screen
function checkWall(blk) {
  // if the block is at or behind the left of the screen
  if (blk.pos <= 0) {
    // snap to edge
    blk.pos = 0;
    // invert velocity
    blk.vel *= -1;
    // add to collision counter
    count++;
    // play click on next tick
    pendingClick = true;
  }
}
// The implementation of the researched formulas
function checkBlockCollision(blk1, blk2) {
  // if the blocks are touching
  if (blk1.pos + blk1.size >= blk2.pos) {
    // displace them so they are no longer touching
    blk1.pos = blk2.pos - blk1.size;
    // define vars for formula from the values of the blocks at the time of collision
    const m1 = blk1.mass;
    const m2 = blk2.mass;
    const v1i = blk1.vel;
    const v2i = blk2.vel;
    // the momentum formula for elastic collisions
    const momentumFormula = m1 * v1i + m2 * v2i;
    // calculate the velocity of block 2
    const velocityBlock2 = (m1 * v2i - m1 * v1i - momentumFormula) / (-1 * m2 - m1);
    // set the updated velocities
    blk1.vel = v2i + velocityBlock2 - v1i;
    blk2.vel = velocityBlock2;
    // increment collision counter
    count++;
    // play sound on next tick
    pendingClick = true;
  }
}

// things ran when the play button is clicked
function play() {
  // allow simulation loop to run until reset
  pause = false;
  // show reset and hide play
  resetButton.style.display = "block";
  playButton.style.display = "none";
  // set the intial velocity of each block to the desired velocity
  block1.vel = Math.floor(mass1velInput.value);
  block2.vel = Math.floor(mass2velInput.value);
  requestAnimationFrame(loop);
}
// called when clicked
playButton.addEventListener("click", play);

// functionality of the reset button
function reset() {
  pause = true;
  // hide reset and show play
  resetButton.style.display = "none";
  playButton.style.display = "block";
  block1.pos = b1Pos;
  block1.vel = b1vel;
  block2.pos = b2Pos;
  block2.vel = b2vel;
  count = 0;
  lastTime = null;
  // re-render canvas to show updated state
  renderCanvas();
}
// called when clicked
resetButton.addEventListener("click", reset);

// limit max user input + update mass when changed
function updateBlockMass(mass, blk, input) {
  // limit for block 1
  if (input === mass1Input) {
    // upper limit
    if (mass > 1000000) {
      mass = 1000000;
      input.value = 1000000;
    }
    // lower limit
    if (mass < 1) {
      mass = 1;
      input.value = 1;
    }
  }
  // limit for block 2 (and other blocks if they will ever exist)
      // the limit exists purely to protect your computer, remove it if you dare
  else if (mass > 1000000000000000) {
    mass = 1000000000000000;
    input.value = 1000000000000000;
  }
  // update the mass
  blk.mass = mass;
  // update visual representation of size
  blk.size = mass.toString().length * 30;
  // re-render canvas with updated values to reflect changes visually
  renderCanvas();
}

// listeners to call function when changed
mass1Input.addEventListener("input", e => updateBlockMass(e.target.value, block1, mass1Input));
mass2Input.addEventListener("input", e => updateBlockMass(e.target.value, block2, mass2Input));


// by Elias Zamaria (input is a number, returns a string with comma formatting)
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// define audio source for click
const sound = new Audio("clack.wav");
let pendingClick = false;
// if pending click when function called, play click
function playClick() {
  if (pendingClick === true) {
    sound.currentTime = 0;
    sound.play();
    pendingClick = false;
  }
}
