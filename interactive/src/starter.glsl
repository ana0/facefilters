precision highp float;
varying vec2 uv;
uniform float time;
uniform float targetAspect;
uniform vec2 resolution;
uniform vec2 videoResolution;
uniform vec2 scaledVideoResolution;
uniform vec2 faceCenter;
uniform vec2 leftEye;
uniform vec2 rightEye;
uniform sampler2D camTex;
uniform sampler2D maskTex;
uniform sampler2D glacierTex;
uniform sampler2D previousTex;
vec2 pixel = 1.0 / resolution;

#define PI 3.1415926538
#define TAU 6.283185307

vec3 getCam(vec2 pos) {
  float videoAspect = videoResolution.x / videoResolution.y;
  vec2 uvA = vec2(pos.x * targetAspect / videoAspect, pos.y);
  vec2 webcamCoord = (uvA) / 2.0 + vec2(0.5);
  vec2 flipwcord = vec2(1.) - webcamCoord;
  return texture2D(camTex, flipwcord).rgb;
}

vec3 getGlacier(vec2 pos) {
  vec2 backCoord = (pos / 2.0) + vec2(0.5);
  vec2 flipwcord = vec2(1.) - backCoord;
  return texture2D(glacierTex, flipwcord).rgb;
}

vec3 getPrevious(vec2 pos) {
  vec2 backCoord = (pos / 2.0) + vec2(0.5);
  return texture2D(previousTex, backCoord).rgb;
}

// Access Facial Feature Masks

float getFace(vec2 pos) {
  float videoAspect = videoResolution.x / videoResolution.y;
  vec2 uvA = vec2(pos.x * targetAspect / videoAspect, pos.y);
  vec2 webcamCoord = (uvA) / 2.0 + vec2(0.5);
  vec2 flipwcord = vec2(1.) - webcamCoord;
  return texture2D(maskTex, flipwcord).b;
}

float getEye(vec2 pos) {
  float videoAspect = videoResolution.x / videoResolution.y;
  vec2 uvA = vec2(pos.x * targetAspect / videoAspect, pos.y);
  vec2 webcamCoord = (uvA) / 2.0 + vec2(0.5);
  vec2 flipwcord = vec2(1.) - webcamCoord;
  return texture2D(maskTex, flipwcord).g;
}

float getMouth(vec2 pos) {
  float videoAspect = videoResolution.x / videoResolution.y;
  vec2 uvA = vec2(pos.x * targetAspect / videoAspect, pos.y);
  vec2 webcamCoord = (uvA) / 2.0 + vec2(0.5);
  vec2 flipwcord = vec2(1.) - webcamCoord;
  return texture2D(maskTex, flipwcord).r;
}

// SPACER
vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}
// SPACER

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// SPACER
float rand(float n) { return fract(sin(n) * 43758.5453123); }

// 1D, 2D, 3D Simplex Noise
float noise(float p) {
  float fl = floor(p);
  float fc = fract(p);
  return mix(rand(fl), rand(fl + 1.0), fc);
}

// INTERNAL
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// INTERNAL
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// INTERNAL
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

// INTERNAL
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// INTERNAL
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
// INTERNAL
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// Use these parameters to fiddle with settings
float step = 1.0;

float intensity(in vec3 color){
  return sqrt((color.x*color.x)+(color.y*color.y)+(color.z*color.z));
}

// Basic sobel filter implementation
// Jeroen Baert - jeroen.baert@cs.kuleuven.be
vec3 sobel(float stepx, float stepy, vec2 center){
    // get samples around pixel
    float tleft = intensity(getCam(center + vec2(-stepx,stepy)));
    float left = intensity(getCam(center + vec2(-stepx,0)));
    float bleft = intensity(getCam(center + vec2(-stepx,-stepy)));
    float top = intensity(getCam(center + vec2(0,stepy)));
    float bottom = intensity(getCam(center + vec2(0,-stepy)));
    float tright = intensity(getCam(center + vec2(stepx,stepy)));
    float right = intensity(getCam(center + vec2(stepx,0)));
    float bright = intensity(getCam(center + vec2(stepx,-stepy)));
 
  // Sobel masks (see http://en.wikipedia.org/wiki/Sobel_operator)
  //        1 0 -1     -1 -2 -1
  //    X = 2 0 -2  Y = 0  0  0
  //        1 0 -1      1  2  1
  
  // You could also use Scharr operator:
  //        3 0 -3        3 10   3
  //    X = 10 0 -10  Y = 0  0   0
  //        3 0 -3        -3 -10 -3
 
    float x = tleft + 2.0*left + bleft - tright - 2.0*right - bright;
    float y = -tleft - 2.0*top - tright + bleft + 2.0 * bottom + bright;
    float color = sqrt((x*x) + (y*y));
    return vec3(color,color,color);
 }

void main() {

  vec3 cam = getCam(uv);
  vec3 glac = getGlacier(uv);

  float face = getFace(uv);
  float eye = getEye(uv);
  float mouth = getMouth(uv);

  vec3 color = getGlacier(uv);

  //vec2 ed = 3. * pixel;
  //float edge = dot((getCam(uv) * 4. - getCam(uv + vec2(ed.x, 0)) -
  //                  getCam(uv + vec2(-ed.x, 0)) - getCam(uv + vec2(0., ed.y)) -
  //                  getCam(uv + vec2(0, -ed.y)))
  //                     .rgb,
  //                 vec3(0.333));



  //cam = vec3(0.7, .8, 1.0) * dot(cam, vec3(0.333));

  //color = (edge + 0.1) * cam * 15.;
  vec3 edge = sobel(step/resolution.x, step/resolution.y, uv);
  edge = (edge + 0.1) * cam * 15.;

  if (face < 0.2) {
    color = mix(color, cam, 0.8);
  }

  if (face > 0.2) {
    //cam = vec3(0.7, .8, 1.0) * dot(cam, vec3(0.333));

    //color = (edge + 0.1) * cam * 15.;
    //color = mix(color, cam, 0.5);
    color = mix(color, glac, 0.8);
  }

  if (eye > 0.3) {
    color = getGlacier(uv);
  }
  gl_FragColor = vec4(color, 1);
}