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

const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const uploadButton = document.getElementById("upload__button");
const list = document.getElementById("videos");

const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: "eburrell",
    tags: ["video"],
    resourceType: "video",
    multiple: false,
    clientAllowedFormats: ["mp4", "mov"],
    uploadPreset: "fwmyv5i7"
  },
  function(error, result) {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info.url);
      video.src = result.info.url;
      console.log(result);
      let li = document.createElement("li");
      li.innerHTML = result.info.created_at;
      const att = document.createAttribute("id");
      att.value = result.info.url;
      li.setAttributeNode(att);
      li.addEventListener("click", loadVideo);
      list.prepend(li);
      this.close();
    }
  }
);

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
function getVideos() {
  fetch("https://res.cloudinary.com/eburrell/video/list/video.json")
    .then((response) => response.json())
    .then((data) => addVideos(data.resources));
}

function addVideos(videos) {
  console.log(videos);
  videos.forEach((video) => {
    let li = document.createElement("li");
    li.innerHTML = video.created_at;
    const att = document.createAttribute("id");
    att.value = `https://res.cloudinary.com/eburrell/video/upload/v${video.version}/${video.public_id}.${video.format}`;
    li.setAttributeNode(att);
    li.addEventListener("click", loadVideo);
    list.appendChild(li);
  });
}

function loadVideo(event) {
  video.src = event.target.id;
  video.play();
  console.log(event);
}

getVideos();

//filter additions
function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  console.log(width, height);
  canvas.width = width;
  canvas.height = height;
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them
    pixels = colorEffect(pixels);
    // pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.8;
    // pixels = greenScreen(pixels);
    // put them back
    ctx.putImageData(pixels, 0, 0);
  }, 1000);
}

function colorEffect(pixels) {
  const rmin = document.querySelector("#rmin").value;
  console.log(rmin > 0);
  if (rmin > 0) {
    video.style.position = "absolute";
    canvas.style.display = "block";
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i + 0] = pixels.data[i + 0] + rmin; // RED
      pixels.data[i + 1] = pixels.data[i + 1] - rmin; // GREEN
      pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }
  } else {
    video.style.position = "relative";
    canvas.style.display = "none";
  }

  return pixels;
}

video.addEventListener("click", togglePlay);
video.addEventListener("play", updateButton);
video.addEventListener("pause", updateButton);
video.addEventListener("timeupdate", handleProgress);
fullscreen.addEventListener("click", toggleFullscreen);

let mousedown = false;
progress.addEventListener("click", scrub);
progress.addEventListener("mousemove", (e) => mousedown && scrub(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

toggle.addEventListener("click", togglePlay);
skipButtons.forEach((button) => button.addEventListener("click", skip));
ranges.forEach((range) => range.addEventListener("change", handleRangeUpdate));
ranges.forEach((range) => range.addEventListener("mousemove", handleRangeUpdate));

video.addEventListener("canplay", paintToCanvas);

uploadButton.addEventListener(
  "click",
  () => {
    uploadWidget.open();
  },
  false
);

// Speech recognition

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = "en-US";

function checkForControls(transcript) {
  console.log(transcript);
  const PLAY_COMMAND = "play video";
  if (transcript.includes(PLAY_COMMAND)) {
    togglePlay();
  }
  const PAUSE_COMMAND = "pause video";
  if (transcript.includes(PAUSE_COMMAND)) {
    togglePlay();
  }
  const FULLSCREEN_COMMAND = "full screen";
  if (transcript.includes(FULLSCREEN_COMMAND)) {
    toggleFullscreen();
  }
}

recognition.addEventListener("result", (e) => {
  console.log(e);
  const transcript = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  if (e.results[0].isFinal) {
    console.log(transcript);
    checkForControls(transcript);
  }
});

recognition.addEventListener("end", recognition.start);
console.log(recognition);
recognition.start();
