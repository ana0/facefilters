#define OCTAVES 6

float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitud = .5;
    float frequency = 0.;
    
    mat2 rot = mat2(cos(0.5), sin(0.5), 
                    -sin(0.5), cos(0.50));
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitud * noise(st);
        st *= rot * 2.;
        amplitud *= .5;
    }
    return value;
}

vec3 cloud() {
    float scale = mix(1.5,7.,sin(time*.06));
    vec2 st = vec2(0.);
    
    st.x = st.x + sin(time*0.07)*2.;
    st.y = st.y + sin(time*0.09)*2.;
    
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*time);
    q.y = fbm( st + vec2(1.0));
    
    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time);
    
    vec3 color = vec3(0.0);
    float f = fbm(st*scale);// - (sin(time)*.5);
    
    color = mix(vec3(0.101961,0.10608,0.266667),
                vec3(0.966667,0.96667,0.998039),
                clamp((f*f)*2.0,0.0,1.0));
    color = color * .5 + clamp(abs(sin(time*0.2)), .2, .8);
    
    color = mix(color,
            vec3(0.06667,.46,.6),
            clamp(length(r.x),0.0,1.0));
    return color;
}

void main() {

  vec3 cam = getCam(uv);
  vec3 glac = getGlacier(uv);

  float face = getFace(uv);
  float eye = getEye(uv);
  float mouth = getMouth(uv);

  vec3 color = getGlacier(uv);// + (cam.rg-cam.bb)*0.1);

  vec2 ed = 3. * pixel;
  float edge = dot((getCam(uv) * 4. - getCam(uv + vec2(ed.x, 0)) -
                    getCam(uv + vec2(-ed.x, 0)) - getCam(uv + vec2(0., ed.y)) -
                    getCam(uv + vec2(0, -ed.y)))
                       .rgb,
                   vec3(0.333));

  cam = vec3(0.7, .8, 1.0) * dot(cam, vec3(0.333));

  //color = (edge + 0.1) * cam * 15.;
  //color = 0.1 * cam * 15.;
  color = cloud();
  color = mix(color, cam, 0.5);

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
