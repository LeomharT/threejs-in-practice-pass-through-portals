varying vec2 vUv;

void main() {
    float radtio  = 2.0 / 3.0;
    vec2  uv      = vUv;
          uv.y   /= radtio;

    vec2 center    = vec2(0.5, 0.5);
         center.y /= radtio;

    vec3  color  = vec3(0.0);

    float dist = length(uv - center);

    if(dist < 0.5) color = vec3(1.0);
    
    gl_FragColor = vec4(color, 1.0);
}
