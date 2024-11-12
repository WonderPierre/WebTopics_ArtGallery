let song;
let button;

function setup() {
  song = loadSound("sound/Fredagain.._BoilerRoom_London.mp3", loaded);
  button = createButton("play some music");
  button.mousePressed(togglePlaying);
}

function loaded() {
  console.log("loaded");
}

function togglePlaying() {
  if (!song.isPlaying()) {
    song.play();
    song.setVolume(0.3);
    button.html("pause");
  } else {
    song.pause();
    button.html("play");
  }
}
