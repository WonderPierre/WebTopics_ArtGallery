let mySound;

function preload() {
  soundFormats('mp3', 'ogg');
  mySound = loadSound('pad/naar/jouw/geluidsbestand.mp3');
}

function setup() {
  let cnv = createCanvas(100, 100);
  cnv.mousePressed(canvasPressed);
  background(220);
  text('Klik om geluid af te spelen', 10, 20);
}

function canvasPressed() {
  if (mySound.isPlaying()) {
    mySound.stop();
  } else {
    mySound.play();
  }
}