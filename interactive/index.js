const { setupWebcam } = require("./src/setUpWebcam.js");
let { paintFace } = require("./src/paint");
let shaders = require("./src/pack.shaders.js");
// const regl = require("regl")("#target", { pixelRatio: 0.75 });
const multiRegl = require("./src/multi.js");
let fs = require("fs");
let prefix = fs.readFileSync(__dirname + "/src/prefix.glsl").toString();
// const regl2 = require("regl")("#target2", { pixelRatio: 0.7});

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

setupWebcam({
  regl1,
  regl2,
  done: (webcam1, webcam2, { videoWidth, videoHeight, getKeyPoints }) => {
    faceDetectionTexture1 = regl1.texture(paint);
    faceDetectionTexture2 = regl2.texture(paint);
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
          viewportWidth,
          viewportHeight
        ],
        targetAspect: () => window.innerWidth / window.innerHeight,
        // scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
        //   let i;
        //   i =
        //     vW / vH > videoWidth / videoHeight
        //       ? [videoWidth * (vH / videoHeight), vH]
        //       : [vW, videoHeight * (vW / videoWidth)];
        //   return i;
        // },

        scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
          // let i;
          // i =
          //   vW / vH > videoWidth / videoHeight
          //     ? [videoWidth * (vH / videoHeight), vH]
          //     : [vW, videoHeight * (vW / videoWidth)];
          // return i;
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
          viewportWidth,
          viewportHeight
        ],
        targetAspect: () => window.innerWidth / window.innerHeight,
        // scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
        //   let i;
        //   i =
        //     vW / vH > videoWidth / videoHeight
        //       ? [videoWidth * (vH / videoHeight), vH]
        //       : [vW, videoHeight * (vW / videoWidth)];
        //   return i;
        // },

        scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
          // let i;
          // i =
          //   vW / vH > videoWidth / videoHeight
          //     ? [videoWidth * (vH / videoHeight), vH]
          //     : [vW, videoHeight * (vW / videoWidth)];
          // return i;
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
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        // console.log(faceCenter[0]);
        // console.log(keyPoints.midwayBetweenEyes);
        // debugger;
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

      lastFrame({
        copy: true
      });
    });

    regl2.frame(function(context) {
      let keyPoints = getKeyPoints();
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        // console.log(faceCenter[0]);
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

      lastFrame({
        copy: true
      });
    });
  }
})

//init()
//animate()