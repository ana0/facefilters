const { setupWebcam } = require("./src/setUpWebcam.js");
let { paintFace } = require("./src/paint");
let shaders = require("./src/pack.shaders.js");
const multiRegl = require("./src/multi.js");
let fs = require("fs");
let prefix = fs.readFileSync(__dirname + "/src/prefix.glsl").toString();

let knownGoodShader = shaders.fragment;

const div1 = document.getElementById("target1");
div1.style.width = '500px'
div1.style.height = '500px'
div1.style.margin = '100px'
const regl1 = multiRegl(div1)(div1);
const div2 = document.getElementById("target2");
div2.style.width = '500px'
div2.style.height = '500px'
div2.style.margin = '100px'
div2.style.position = 'absolute'
div2.style.left = '500px'
const regl2 = multiRegl(div2)(div2);

const lastFrame1 = regl1.texture();
const lastFrame2 = regl2.texture();

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

setupWebcam({
  regl1,
  regl2,
  done: (webcam1, webcam2, { videoWidth, videoHeight, getKeyPoints }) => {
    faceDetectionTexture1 = regl1.texture(paintElement);
    faceDetectionTexture2 = regl2.texture(paintElement);
    // faceDetectionTexture.resize(videoWidth, videoHeight);

    let drawTriangle1 = regl1({
      uniforms: {
        camTex: webcam1,
        previousTex: lastFrame1,
        maskTex: faceDetectionTexture1,
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

      frag: () => (hasFace ? prefix + shaders.fragment : loadingShader),
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
        previousTex: lastFrame2,
        maskTex: faceDetectionTexture2,
        videoResolution: [videoWidth, videoHeight],
        time: ({ time }) => time % 10000,
        hasFace: () => hasFace,
        resolution: ({ viewportWidth, viewportHeight }) => [
          500,
          500
        ],
        targetAspect: () => 1,//window.innerWidth / window.innerHeight,
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

      frag: () => (hasFace ? prefix + shaders.fragment : loadingShader),
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
      console.log('regl1 keyPoints', keyPoints)
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
        // debugger;
        // editor.flashCode(100, 200);
        shaders.fragment = knownGoodShader;

        return;
      }
      knownGoodShader = shaders.fragment;

      lastFrame1({
        copy: true
      });
    });

    regl2.frame(function(context) {
      let keyPoints = getKeyPoints();
      console.log('regl2 keyPoints', keyPoints)
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        console.log(faceCenter[0]);
        // console.log(keyPoints.midwayBetweenEyes);
        // debugger;
        ctx = paintFace(keyPoints);
        faceDetectionTexture2.subimage(ctx);
      }
      try {
        drawTriangle2();
      } catch (e) {
        console.log(e);
        // debugger;
        // editor.flashCode(100, 200);
        shaders.fragment = knownGoodShader;

        return;
      }
      knownGoodShader = shaders.fragment;

      lastFrame2({
        copy: true
      });
    });
  }
})

//init()
//animate()