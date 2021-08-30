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
  //set default values for inputs
  mass1Input.value = b1Mass;
  mass2Input.value = b2Mass;
  mass1velInput.value = b1vel;
  mass2velInput.value = b2vel;
  // render canvas so its not blank
  renderCanvas();
}
// called once finished loading
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

// define a block class
class Block {
  // constructor in js is basically __init__ in python
  constructor(mass, pos, vel, color) {
    // js uses this instead of self
    this.mass = mass;
    this.pos = pos;
    this.vel = vel;
    this.color = color;
    // the visual size shown is relative to the number of digits in the desired number
    this.size = Math.floor(mass).toString().length * 30;
  }
  // per instance rendering of the block
  render() {
    // make text white
    ctx.fillStyle = "white";
    ctx.font = "20px googlesans";
    ctx.fillText(
        // get the mass with commas
      numberWithCommas(this.mass),
      this.pos + (this.size/2),
      canvas.height - (this.size + 10)
    );
    // make block colour the one setup when created
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos, canvas.height - this.size, this.size, this.size);
  }
  // called when each block is updated
  update(delta) {
    // displaces the block by the velocity adjusted by the delta
    this.pos += this.vel * delta;
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

// create the blocks from the class with the desired values
const block1 = new Block(b1Mass, b1Pos, b1vel, "#03a1fc");
const block2 = new Block(b2Mass, b2Pos, b2vel, "#fc0303");

// main simulation loop
// set number of collisions
let collisionCounter = 0;
// create var
let previousTimeStamp;
// start simulation paused
let pause = true;
// for ""sub-stepped" physics
let counter = 0;
const maxDelta = 0.0001;
function simulationloop(timestamp) {
  if (previousTimeStamp) {
    // adds frame time to counter
    counter += timestamp - previousTimeStamp;
    // physics "sub-stepping" but for javascript.
    // while the counter var is >= max no. of iterations
    while (counter >= maxDelta) {
      // update the collision and apply velocities
      updateAndCollision(maxDelta);
      // subtract the delta from the counter and repeat (approx 16 times per frame for 60 fps)
      counter -= maxDelta;
    }
    // play a sound if pending
    playClick();
    // update the display
    renderCanvas();
  }
  // if the simulation is allowed to run
  if (!pause) {
    // call the loop again using requestAnimationFrame
    requestAnimationFrame(simulationloop);
    // set the timestamp so that the if statement above can run
    previousTimeStamp = timestamp;
  }
}

// update blocks position with the velocity amplified by the delta
function updateAndCollision(dt) {
  // displace blocks by velocity
  block1.update(dt / 1000);
  block2.update(dt / 1000);
  // perform collision detection
  checkWall(block1);
  checkBlockCollision(block1, block2);
}

// called whenever the canvas needs to be rendered
function renderCanvas() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // glow + drop shadow effect for canvas elements
  ctx.shadowBlur = 20;
  ctx.textAlign = "center";
  // blue
  ctx.shadowColor = "#03a1fc";
  block1.render();
  // red
  ctx.shadowColor = "#fc0303";
  block2.render();
  // text colour white
  ctx.fillStyle = "white";
  // font may revert to default if not installed - haven't been able to check
  ctx.font = canvas.height/17 + "px googlesans";
  ctx.textAlign = "center";
  // black
  ctx.shadowColor = "#000";
  ctx.fillText(`Collisions: ${numberWithCommas(collisionCounter)}`, canvas.width/2, canvas.height/4);
  ctx.fillText(`Velocity 1: ${Math.floor(block1.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/12);
  ctx.fillText(`Velocity 2: ${Math.floor(block2.vel)}`, canvas.width/2, canvas.height/4 + canvas.height/6);
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
    collisionCounter++;
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
    collisionCounter++;
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
  // set the initial velocity of each block to the desired velocity
  block1.vel = Math.floor(mass1velInput.value);
  block2.vel = Math.floor(mass2velInput.value);
  requestAnimationFrame(simulationloop);
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
  collisionCounter = 0;
  previousTimeStamp = null;
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
  else if (mass > 10000000000000000) {
    mass = 10000000000000000;
    input.value = 10000000000000000;
  }
  // update the mass
  blk.mass = mass;
  // update visual representation of size
  blk.size = Math.floor(mass).toString().length * 30;
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
    // if sound is currently playing and a new sound is requested, restart the sound so it plays faster
    sound.currentTime = 0;
    // play sound
    sound.play();
    pendingClick = false;
  }
}
