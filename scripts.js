window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/* Get Our Elements */
const player = document.querySelector(".player");
const video = player.querySelector(".viewer");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggle = player.querySelector(".toggle");
const skipButtons = player.querySelectorAll("[data-skip]");
const ranges = player.querySelectorAll(".player__slider");
const fullscreen = player.querySelector(".fullscreen");

/* Build out functions */
function togglePlay() {
  const method = video.paused ? "play" : "pause";
  video[method]();
}

function updateButton() {
  const icon = this.paused ? "►" : "❚ ❚";
  toggle.textContent = icon;
}

function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
}

function handleRangeUpdate() {
  video[this.name] = this.value;
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
}

function scrub(e) {
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}

function toggleFullscreen() {
  console.log("click is working");
  video.requestFullscreen();
}

video.addEventListener("click", togglePlay);
video.addEventListener("play", updateButton);
video.addEventListener("pause", updateButton);
video.addEventListener("timeupdate", handleProgress);
fullscreen.addEventListener("click", toggleFullscreen);

let mousedown = false;
progress.addEventListener("click", scrub);
progress.addEventListener("mousemove", e => mousedown && scrub(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

toggle.addEventListener("click", togglePlay);
skipButtons.forEach(button => button.addEventListener("click", skip));
ranges.forEach(range => range.addEventListener("change", handleRangeUpdate));
ranges.forEach(range => range.addEventListener("mousemove", handleRangeUpdate));

// Speech recognition

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = "en-US";

function checkForControls(transcript) {
  const PLAY_COMMAND = "play video";
  if (transcript.includes(PLAY_COMMAND)) {
    togglePlay();
  }
  const PAUSE_COMMAND = "pause video";
  if (transcript.includes(PAUSE_COMMAND)) {
    togglePlay();
  }
  const FULLSCREEN_COMMAND = "";
  if (transcript.includes(FULLSCREEN_COMMAND)) {
    toggleFullscreen();
  }
}

recognition.addEventListener("result", e => {
  const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join("");

  if (e.results[0].isFinal) {
    console.log(transcript);
    checkForControls(transcript);
  }
});

recognition.addEventListener("end", recognition.start);
recognition.start();
