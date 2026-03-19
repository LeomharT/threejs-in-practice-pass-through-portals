varying vec2 vUv;

uniform float uBorderRadius;

void main() {
    vec3  color = vec3(0.0);
    float ratio = 2.0 / 3.0;
    float r     = uBorderRadius;

    vec2 uv    = vUv;
         uv.y /= ratio;

    vec2 center    = vec2(0.5);
         center.y /= ratio;

    float dist = length(uv - center);

    if(dist < r) {
        color = vec3(0.127, 0.348, 0.697);
    }

    gl_FragColor = vec4(color, 1.0);
}
