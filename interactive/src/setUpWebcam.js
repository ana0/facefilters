let facemesh = require("@tensorflow-models/facemesh");
let tf = require("@tensorflow/tfjs-core");
let tfbe = require("@tensorflow/tfjs-backend-cpu");

let model;
let video = null;
async function loadModel() {
  // Load the MediaPipe facemesh model.
  model = await facemesh.load({ maxFaces: 1 });
}
let keypoints;
let dirty = false;
async function predictionLoop() {
  if (!model || !video) {
    window.requestAnimationFrame(predictionLoop);

    return null;
  }

  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
  // array of detected faces from the MediaPipe graph.
  const predictions = await model.estimateFaces(video);
  // console.log(tf.backend());
  // console.log(model);
  // console.log(facemesh);
  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i++) {
      keypoints = predictions[i].annotations;
      dirty = true;
      // console.log(keypoints);
      // keypoints = predictions[i].scaledMesh;
    }
  }
  window.requestAnimationFrame(predictionLoop);
}
function getKeyPoints() {
  if (dirty) {
    //console.log()
    dirty = false;
    return keypoints;
  } else {
    // console.log("saved work");
    return keypoints;
    return false;
  }
}
loadModel();
function setupWebcam(options) {
  const regl1 = options.regl1;
  const regl2 = options.regl2;

  function startup() {
    video = document.getElementById("video");
    let startbutton = document.getElementById("start");
    let paint = document.getElementById("paint");
    let target1 = document.getElementById("target1");
    let target2 = document.getElementById("target2");
    var trackingStarted = false;

    function tryGetUserMedia() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false
        })
        .then(gumSuccess)
        .catch(e => {
          console.log("initial gum failed");
        });
      // video.play();
      startbutton.hidden = true;
    }

    tryGetUserMedia();

    startbutton.onclick = function() {
      console.log("play!");
      tryGetUserMedia();
      // startVideo();
    };

    function gumSuccess(stream) {
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL && window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function() {
        console.log("metadata loaded");
        console.log(regl1)
        const webcam1 = regl1.texture(video);
        const webcam2 = regl2.texture(video);

        const { videoWidth, videoHeight } = video;

        var w = videoHeight;
        var h = videoHeight;
        paint.height = h;
        paint.width = h*1.33;
        target1.height = h;
        target1.width = h*1.25;
        predictionLoop();

        regl1.frame(() => webcam1.subimage(video));
        regl2.frame(() => webcam2.subimage(video));
        options.done(webcam1, webcam2, {
          videoWidth,
          videoHeight,
          getKeyPoints
        });
      };
    }
    // function adjustVideoProportions() {
    //   // resize overlay and video if proportions of video are not 4:3
    //   // keep same height, just change width
    //   debugger
    //   var proportion = video.videoWidth/video.videoHeight;
    //   video_width = Math.round(video_height * proportion);
    //   video.width = video_width;
    // }
    video.onresize = function() {
      // adjustVideoProportions();
    };
    video.addEventListener(
      "canplay",
      function(ev) {
        video.play();
      },
      false
    );
  }

  window.onload = startup;
}

module.exports = { setupWebcam };
