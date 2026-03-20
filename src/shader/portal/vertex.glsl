varying vec2 vUv;
varying vec3 vNDC;


void main() {
    vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vec3 ndc = gl_Position.xyz / gl_Position.w;

    // Varying
    vUv  = uv;
    vNDC = ndc * 0.5 + 0.5;
}