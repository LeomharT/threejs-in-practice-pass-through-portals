varying vec2 vUv;

uniform float uBorderRadius;

void main() {
    vec3  color  = vec3(0.0);
    float radtio = 2.0 / 3.0;
    float r      = uBorderRadius;

    vec2 uv    = vUv;
         uv.y /= radtio;

    vec2 center    = vec2(0.5);
         center.y /= radtio;

    vec2 p = abs(uv - center);
    vec2 q = p - (center - r);

    if (q.x > 0.0 && q.y > 0.0) {
        if(length(q) > r) discard;
    }
  
    gl_FragColor = vec4(color, 1.0);
}
