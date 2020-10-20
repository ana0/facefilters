// let facemesh = require("@tensorflow-models/facemesh");
// let tf = require("@tensorflow/tfjs-core");
// let tfbe = require("@tensorflow/tfjs-backend-cpu");

// let model;
// let video;

// async function loadModel() {
//   // Load the MediaPipe facemesh model.
//   model = await facemesh.load({ maxFaces: 1 });
//   video = document.getElementById( 'video' );
// }

// async function predictionLoop() {
//   console.log(video)
//   if (!model || !video) {
//     window.requestAnimationFrame(predictionLoop);

//     return null;
//   }

//   // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
//   // array of detected faces from the MediaPipe graph.
//   const predictions = await model.estimateFaces(video);

//   if (predictions.length > 0) {
//     for (let i = 0; i < predictions.length; i++) {
//       keypoints = predictions[i].annotations;
//       dirty = true;
//       console.log(keypoints);
//       // keypoints = predictions[i].scaledMesh;
//     }
//   }
//   window.requestAnimationFrame(predictionLoop);
// }

// module.exports = { loadModel, predictionLoop };