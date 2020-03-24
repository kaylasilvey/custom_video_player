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
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");
const uploadButton = document.getElementById("upload__button");
const list = document.getElementById("videos");

const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: "heydanhey",
    tags: ["video"],
    resourceType: "video",
    multiple: false,
    clientAllowedFormats: ["mp4", "mov"],
    uploadPreset: "tycwqdaj"
  },
  function(error, result) {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info.url);
      video.src = result.info.url;
      console.log(result);
      video.removeEventListener("canplay", paintToCanvas);
      video.addEventListener("canplay", paintToCanvas);

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
  fetch("https://res.cloudinary.com/heydanhey/video/list/video.json")
    .then(response => response.json())
    .then(data => addVideos(data.resources));
}

function addVideos(videos) {
  videos.forEach(video => {
    let li = document.createElement("li");
    li.innerHTML = video.public_id;
    const att = document.createAttribute("id");
    att.value = `https://res.cloudinary.com/heydanhey/video/upload/v${video.version}/${video.public_id}.${video.format}`;
    li.setAttributeNode(att);
    li.addEventListener("click", loadVideo);
    list.appendChild(li);
  });
}

function loadVideo(event) {
  video.src = event.target.id;
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
  }, 100);
}

function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "handsome");
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);
}

function colorEffect(pixels) {
  const levels = {};
  document.querySelectorAll(".rgb input").forEach(input => {
    levels[input.name] = input.value;
  });
  console.log(levels.rmin, levels.gmin, levels.bmin);

  //to do - make work for all range sliders

  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + levels.rmin; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - levels.rmin; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
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
progress.addEventListener("mousemove", e => mousedown && scrub(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

toggle.addEventListener("click", togglePlay);
skipButtons.forEach(button => button.addEventListener("click", skip));
ranges.forEach(range => range.addEventListener("change", handleRangeUpdate));
ranges.forEach(range => range.addEventListener("mousemove", handleRangeUpdate));

video.addEventListener("canplay", paintToCanvas);

uploadButton.addEventListener(
  "click",
  () => {
    uploadWidget.open();
  },
  false
);
