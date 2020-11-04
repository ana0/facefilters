const { setupWebcam } = require("./src/setUpWebcam.js");
let { paintFace } = require("./src/paint");
let shaders = require("./src/pack.shaders.js");
const multiRegl = require("./src/multi.js");
// let fs = require("fs");
// let prefix = fs.readFileSync(__dirname + "/src/prefix.glsl").toString();

let knownGoodShader = shaders.fragment;

const div1 = document.getElementById("target1");
const regl1 = multiRegl()(div1);
const div2 = document.getElementById("target2");
const regl2 = multiRegl()(div2);

const lastFrame = regl2.texture();

const targetAspect = 1.0;
let paintElement = document.getElementById("paint");
let faceDetectionTexture1;
let faceDetectionTexture2;
let hasFace = false;
let faceCenter = [0.5, 0.5];

function convertCoordinate([fx, fy], videoWidth, videoHeight) {
  x = fx / videoWidth;
  y = fy / videoHeight;
  x = 1 - x;
  y = 1 - y;
  x = 2 * x - 1.0;
  y = 2 * y - 1.0;
  let targetAspect = 1.;
  let videoAspect = videoWidth / videoHeight;
  let uvA_x = x / (targetAspect / videoAspect);
  let uvA_y = y;
  if (targetAspect < videoAspect) {
    uvA_x = x;
    uvA_y = y / (videoAspect / targetAspect);
  }

  return [uvA_x, uvA_y];
}

var image = document.getElementById("glacier");

setupWebcam({
  regl1,
  regl2,
  done: (webcam1, webcam2, { videoWidth, videoHeight, getKeyPoints }) => {
    faceDetectionTexture1 = regl1.texture(paintElement);
    faceDetectionTexture2 = regl2.texture(paintElement);

    const glacierTexture2 = regl2.texture(image);
    const glacierTexture1 = regl1.texture(image);


    let drawTriangle1 = regl1({
      uniforms: {
        camTex: webcam1,
        previousTex: lastFrame,
        maskTex: faceDetectionTexture1,
        glacierTex: glacierTexture1,
        videoResolution: [videoWidth, videoHeight],
        time: ({ time }) => time % 10000,
        hasFace: () => hasFace,
        resolution: ({ viewportWidth, viewportHeight }) => [
          500,
          500
        ],
        targetAspect: () => 1, 
        scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
          return 1;
        },
        faceCenter: () =>
          convertCoordinate(faceCenter, videoWidth, videoHeight),
        leftEye: () =>
          convertCoordinate(window.leftEye, videoWidth, videoHeight),
        rightEye: () =>
          convertCoordinate(window.rightEye, videoWidth, videoHeight)
      },

      frag: () => (shaders.fragment),
      vert: () => shaders.vertex,
      attributes: {
        // Full screen triangle
        position: [
          [-1, 4],
          [-1, -1],
          [4, -1]
        ]
      },
      // Our triangle has 3 vertices
      count: 3
    });

    let drawTriangle2 = regl2({
      uniforms: {
        camTex: webcam2,
        previousTex: lastFrame,
        maskTex: faceDetectionTexture2,
        glacierTex: glacierTexture2,
        videoResolution: [videoWidth, videoHeight],
        time: ({ time }) => time % 10000,
        hasFace: () => hasFace,
        resolution: ({ viewportWidth, viewportHeight }) => [
          500,
          500
        ],
        targetAspect: () => 1,
        scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
          return 1;
        },
        faceCenter: () =>
          convertCoordinate(faceCenter, videoWidth, videoHeight),
        leftEye: () =>
          convertCoordinate(window.leftEye, videoWidth, videoHeight),
        rightEye: () =>
          convertCoordinate(window.rightEye, videoWidth, videoHeight)
      },

      frag: () => (shaders.fragment),
      vert: () => shaders.vertex,
      attributes: {
        // Full screen triangle
        position: [
          [-1, 4],
          [-1, -1],
          [4, -1]
        ]
      },
      // Our triangle has 3 vertices
      count: 3
    });

    regl1.frame(function(context) {
      let keyPoints = getKeyPoints();
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        ctx = paintFace(keyPoints);
        faceDetectionTexture1.subimage(ctx);
      }
      try {
        drawTriangle1();
      } catch (e) {
        console.log(e);
        shaders.fragment = knownGoodShader;

        return;
      }
      knownGoodShader = shaders.fragment;

      lastFrame({
        copy: true
      });
    });

    regl2.frame(function(context) {
      let keyPoints = getKeyPoints();
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        ctx = paintFace(keyPoints);
        faceDetectionTexture2.subimage(ctx);
      }
      try {
        drawTriangle2();
      } catch (e) {
        console.log(e);
        shaders.fragment = knownGoodShader;

        return;
      }
      knownGoodShader = shaders.fragment;

      lastFrame({
        copy: true
      });
    });
  }
})
