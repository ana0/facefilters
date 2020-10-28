void main() {

  vec3 cam = getCam(uv);
  //vec3 prev = getPrevious(uv * 1.05 + pixel * 20.);

  float face = getFace(uv);
  float eye = getEye(uv);
  float mouth = getMouth(uv);

  vec3 color = cam;

  // try uncommenting this line:
  color = getGlacier(uv + (cam.rg-cam.bb)*0.1);

  if (face > 0.2) {
    vec2 ed = 6. * pixel;
    float edge = dot((getCam(uv) * 4. - getCam(uv + vec2(ed.x, 0)) -
                      getCam(uv + vec2(-ed.x, 0)) - getCam(uv + vec2(0., ed.y)) -
                      getCam(uv + vec2(0, -ed.y)))
                         .rgb,
                     vec3(0.333));

    cam = vec3(0.7, .8, 1.0) * dot(cam, vec3(0.333));

    color = (edge + 0.1) * cam * 15.;
    color = mix(color, cam, 0.5);
    //color = getPrevious(rotate(uv, 0.1) * 1.1);
  }

  // eye black
  if (eye > 0.3) {
    //color = black;
  }
  if (eye > 0.6) {
    color = mix(cam, getGlacier(uv), 0.5);
  }
  // lipstick
  if (mouth > 0.4) {
    //color = cam * red;
  }
  if (mouth > 0.6) {
    color = mix(cam, getGlacier(uv), 0.5);
  }
  gl_FragColor = vec4(color, 1);
}
