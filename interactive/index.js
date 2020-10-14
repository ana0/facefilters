const { setupWebcam } = require("./src/setUpWebcam.js");
let { paintFace } = require("./src/paint");
let shaders = require("./src/pack.shaders.js");
const regl = require("regl")("#target", { pixelRatio: 0.75 });
let fs = require("fs");
let prefix = fs.readFileSync(__dirname + "/src/prefix.glsl").toString();

const lastFrame = regl.texture();
let knownGoodShader = shaders.fragment;

setupWebcam({
  regl,
  done: (webcam, { videoWidth, videoHeight, getKeyPoints }) => {
    faceDetectionTexture = regl.texture(paint);
    // faceDetectionTexture.resize(videoWidth, videoHeight);

    let drawTriangle = regl({
      uniforms: {
        camTex: webcam,
        previousTex: lastFrame,
        maskTex: faceDetectionTexture,
        videoResolution: [videoWidth, videoHeight],
        time: ({ time }) => time % 10000,
        hasFace: () => hasFace,
        resolution: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight
        ],
        targetAspect: () => window.innerWidth / window.innerHeight,
        scaledVideoResolution: ({ viewportWidth: vW, viewportHeight: vH }) => {
          let i;
          i =
            vW / vH > videoWidth / videoHeight
              ? [videoWidth * (vH / videoHeight), vH]
              : [vW, videoHeight * (vW / videoWidth)];
          return i;
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

    regl.frame(function(context) {
      let keyPoints = getKeyPoints();
      // regl.clear({
      //   color: [0, 0, 0, 1]
      // });
      if (keyPoints) {
        hasFace = true;
        faceCenter = keyPoints.noseTip[0];
        // console.log(faceCenter[0]);
        // console.log(keyPoints.midwayBetweenEyes);
        // debugger;
        ctx = paintFace(keyPoints);
        faceDetectionTexture.subimage(ctx);
      }
      try {
        drawTriangle();
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