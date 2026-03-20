varying vec2 vUv;
varying vec3 vNDC;

uniform float uBorderRadius;
uniform float uBorderWidth;
uniform float uTime;
uniform float uGoldenRatio;
uniform sampler2D uFrameBuffer;

void main() {
    vec3  ndc   = vNDC;
    vec3  color = vec3(0.0);
    float r1    = uBorderRadius + 0.02;
    float r2    = uBorderRadius;
    float w     = uBorderWidth;
    float a     = 1.0 / uGoldenRatio;

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
        vec4 frameColor = texture2D(uFrameBuffer, ndc.xy);
        color = frameColor.rgb;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
