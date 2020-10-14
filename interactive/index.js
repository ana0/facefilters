const { setupWebcam } = require("./setUpWebcam.js");
const { init, animate } = require("./setUpScene.js");

const video = document.createElement("VIDEO");
video.id = "video"
video.autoplay = true
video.playsinline = true
video.style.display = 'none'

document.body.appendChild(video)

//setupWebcam({})

init()
animate()