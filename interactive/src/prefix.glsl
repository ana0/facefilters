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
// Color Shorthands

vec3 black = vec3(0.0);
vec3 white = vec3(1.0);
vec3 red = vec3(0.86, 0.22, 0.27);
vec3 orange = vec3(0.92, 0.49, 0.07);
vec3 yellow = vec3(0.91, 0.89, 0.26);
vec3 green = vec3(0.0, 0.71, 0.31);
vec3 blue = vec3(0.05, 0.35, 0.65);
vec3 purple = vec3(0.38, 0.09, 0.64);
vec3 pink = vec3(.9, 0.758, 0.798);
vec3 lime = vec3(0.361, 0.969, 0.282);
vec3 teal = vec3(0.396, 0.878, 0.878);
vec3 magenta = vec3(1.0, 0.189, 0.745);
vec3 brown = vec3(0.96, 0.474, 0.227);
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

// INTERNAL

float hue2rgb(float f1, float f2, float hue) {
  // http://www.chilliant.com/rgb2hsv.html

  if (hue < 0.0)
    hue += 1.0;
  else if (hue > 1.0)
    hue -= 1.0;
  float res;
  if ((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
  else if ((2.0 * hue) < 1.0)
    res = f2;
  else if ((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  else
    res = f1;
  return res;
}

// Color Space Conversion

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb;

  if (hsl.y == 0.0) {
    rgb = vec3(hsl.z); // Luminance
  } else {
    float f2;

    if (hsl.z < 0.5)
      f2 = hsl.z * (1.0 + hsl.y);
    else
      f2 = hsl.z + hsl.y - hsl.y * hsl.z;

    float f1 = 2.0 * hsl.z - f2;

    rgb.r = hue2rgb(f1, f2, hsl.x + (1.0 / 3.0));
    rgb.g = hue2rgb(f1, f2, hsl.x);
    rgb.b = hue2rgb(f1, f2, hsl.x - (1.0 / 3.0));
  }
  return rgb;
}

vec3 hsl2rgb(float h, float s, float l) { return hsl2rgb(vec3(h, s, l)); }

// INTERNAL
vec3 RGBtoHCV(vec3 rgb) {
  // Based on work by Sam Hocevar and Emil Persson
  vec4 p = (rgb.g < rgb.b) ? vec4(rgb.bg, -1.0, 2.0 / 3.0)
                           : vec4(rgb.gb, 0.0, -1.0 / 3.0);
  vec4 q = (rgb.r < p.x) ? vec4(p.xyw, rgb.r) : vec4(rgb.r, p.yzx);
  float c = q.x - min(q.w, q.y);
  float h = abs((q.w - q.y) / (6.0 * c + 1e-10) + q.z);
  return vec3(h, c, q.x);
}

vec3 rgb2hsl(vec3 rgb) {
  vec3 hcv = RGBtoHCV(rgb);
  float l = hcv.z - hcv.y * 0.5;
  float s = hcv.y / (1.0 - abs(l * 2.0 - 1.0) + 1e-10);
  return vec3(hcv.x, s, l);
}

vec3 rgb2hsl(float r, float g, float b) { return rgb2hsl(vec3(r, g, b)); }

float luma(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); } 