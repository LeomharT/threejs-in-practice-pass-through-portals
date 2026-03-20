varying vec2 vUv;

uniform float uBorderRadius;
uniform float uTime;

void main() {
    vec3  color = vec3(0.0);
    float r     = uBorderRadius;
    float ratio = 2.0 / 3.0;

    vec2 uv    = vUv;
         uv.y /= ratio;

    vec2 center    = vec2(0.5);
         center.y /= ratio;

    vec2 c = abs(uv - center);

    vec2 p = c - (center - r);

    if(p.x > 0.0 && p.y > 0.0) {
        if(length(p) > r) discard;
    }

    gl_FragColor = vec4(color, 1.0);
}
