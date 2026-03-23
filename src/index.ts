/**
 * @author Leo Liao
 * @see https://codesandbox.io/p/sandbox/qvk72r
 */

import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  ACESFilmicToneMapping,
  AxesHelper,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls, Sky, TrackballControls } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import { Text } from 'troika-three-text';
import { Pane } from 'tweakpane';
import './index.css';
import portalFragmentShader from './shader/portal/fragment.glsl?raw';
import portalVertexShader from './shader/portal/vertex.glsl?raw';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio)
};

const el = document.querySelector('#root');

/**
 * Loader
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/libs/draco/');
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Cores
 */

const renderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.localClippingEnabled = true;
el?.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 1.25);
camera.lookAt(scene.position);

const controls1 = new OrbitControls(camera, renderer.domElement);
controls1.enableDamping = true;
controls1.enablePan = true;
controls1.enableRotate = true;
controls1.enableZoom = false;
controls1.dampingFactor = 0.05;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.dynamicDampingFactor = 0.1;

const time = new Timer();

const frameRenderTarget = new WebGLRenderTarget(size.width * 2, size.height * 2, {
  generateMipmaps: true,
  anisotropy: 8
});

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uGoldenRatio: new Uniform(1.61803398875),
  uBorderRadius: new Uniform(0.1),
  uBorderWidth: new Uniform(0.05),
  uFrameBuffer: new Uniform(frameRenderTarget.texture)
};

const planeGeometry = new PlaneGeometry(1, uniforms.uGoldenRatio.value, 32, 32);
const portalMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader
});
const portal = new Mesh(planeGeometry, portalMaterial);
scene.add(portal);

let mccree: Object3D | undefined;
const yPlane = new Plane(new Vector3(0, 1, 0), 1);
const zPlane = new Plane(new Vector3(0, 0, 1), 0);
/*
  Author: Seafoam (https://sketchfab.com/seafoam)
  License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
  Source: https://sketchfab.com/3d-models/low-poly-mccree-38aedc02c0b2412babdc4d0eac7c6803
  Title: Low poly McCree
*/
gltfLoader.load('/low_poly_mccree-transformed.glb', (data) => {
  mccree = data.scene;
  mccree.position.y -= 2.0;
  scene.add(mccree);
});

const effectController = {
  turbidity: 10,
  rayleigh: 0.5,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  elevation: 0.6,
  azimuth: 0.1,
  exposure: renderer.toneMappingExposure,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5
};
const sun = new Vector3();

function updateSky() {
  const uniforms = sky.material.uniforms;
  uniforms['turbidity'].value = effectController.turbidity;
  uniforms['rayleigh'].value = effectController.rayleigh;
  uniforms['mieCoefficient'].value = effectController.mieCoefficient;
  uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
  uniforms['cloudCoverage'].value = effectController.cloudCoverage;
  uniforms['cloudDensity'].value = effectController.cloudDensity;
  uniforms['cloudElevation'].value = effectController.cloudElevation;

  const theta = Math.PI * (effectController.elevation - 0.5);
  const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

  sun.x = Math.cos(phi);
  sun.y = Math.sin(theta);
  sun.z = Math.sin(phi);

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  uniforms['sunPosition'].value.copy(sun);
}
const sky = new Sky();
sky.scale.setScalar(450000);
updateSky();
scene.add(sky);

const text = new Text();
text.text = 'Jesse';
text.fontSize = 0.3;
text.position.y = 0.8;
text.position.x = -0.32;
text.position.z = 0.01;
text.color = '#000';

text.sync();
scene.add(text);

const text1 = new Text();
text1.text = 'McCree';
text1.fontSize = 0.05;
text1.position.y = -0.67;
text1.position.x = 0;
text1.position.z = 0.01;
text1.color = '#000';

text1.sync();
scene.add(text1);

const text2 = new Text();
text2.text = '/01';
text2.fontSize = 0.15;
text2.position.y = -0.558;
text2.position.x = 0.23;
text2.position.z = 0.02;
text2.color = '#000';

text2.sync();
scene.add(text2);

/**
 * Helper
 */

const axesHelper = new AxesHelper(1);
axesHelper.visible = false;
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Pass Through Portals' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);

const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3
});

pane.addBinding(axesHelper, 'visible', {});

const p_portal = pane.addFolder({ title: '🕳️ Portal' });
p_portal.addBinding(uniforms.uBorderRadius, 'value', {
  label: 'Border Radius',
  step: 0.001,
  min: 0,
  max: 0.5
});
p_portal.addBinding(uniforms.uBorderWidth, 'value', {
  label: 'Border Width',
  step: 0.001,
  min: 0.0,
  max: 1.0
});

const sky_p = pane.addFolder({ title: 'Sky' });
sky_p
  .addBinding(effectController, 'turbidity', {
    step: 0.001,
    max: 20,
    min: 0
  })
  .on('change', updateSky);
sky_p
  .addBinding(effectController, 'elevation', {
    step: 1,
    max: 180,
    min: 0
  })
  .on('change', updateSky);
sky_p
  .addBinding(effectController, 'azimuth', {
    step: 1,
    max: 360,
    min: 0
  })
  .on('change', updateSky);
sky_p
  .addBinding(effectController, 'rayleigh', {
    step: 0.01,
    max: 1.5,
    min: 0
  })
  .on('change', updateSky);

/**
 * Events
 */

function renderPortal() {
  renderer.setRenderTarget(frameRenderTarget);
  portal.visible = false;
  sky.visible = true;
  renderer.render(scene, camera);
  sky.visible = false;
  portal.visible = true;
  renderer.setRenderTarget(null);
}

function clippingModel() {
  mccree?.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.material.clippingPlanes = [yPlane, zPlane];
    }
  });
}

function restoreModel() {
  mccree?.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.material.clippingPlanes = null;
    }
  });
}

function render() {
  const dt = time.getDelta();

  fpsGraph.begin();

  // Update
  controls2.update();
  controls1.update(dt);
  uniforms.uTime.value += 0.01;

  // Render
  restoreModel();
  renderPortal();
  clippingModel();
  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});
