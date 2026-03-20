varying vec2 vUv;

uniform float uBorderRadius;
uniform float uBorderWidth;
uniform float uTime;

void main() {
    vec3  color = vec3(0.0);
    float r1    = uBorderRadius + 0.02;
    float r2    = uBorderRadius;
    float w     = uBorderWidth;
    float a     = 2.0 / 3.0;

    vec2 uv    = vUv;
         uv.y /= a;

    vec2 center    = vec2(0.5);
         center.y /= a;

    vec2 c = abs(uv - center);

    vec2 p = c - (center - r1);

    if(p.x > 0.0 && p.y > 0.0) {
        if(length(p) > r1) discard;
    }

    vec2 p2 = c - (center - r2 - (w * a));

    bool isInsideX = (p2.x < 0.0 && p2.y < r2);
    bool isInsideY = (p2.y < 0.0 && p2.x < r2);

    if(isInsideX || isInsideY || length(p2) < r2) {
        color = vec3(1.0);
    }

    gl_FragColor = vec4(color, 1.0);
}
