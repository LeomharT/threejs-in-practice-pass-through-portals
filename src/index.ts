/**
 * @author Leo Liao
 * @see https://codesandbox.io/p/sandbox/qvk72r
 */

import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { AxesHelper, Mesh, Object3D, PerspectiveCamera, Plane, PlaneGeometry, Scene, ShaderMaterial, Uniform, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
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
dracoLoader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/');
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

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;

const frameRenderTarget = new WebGLRenderTarget(size.width, size.height, {
  generateMipmaps: false,
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

gltfLoader.load('/low_poly_mccree-transformed.glb', (data) => {
  mccree = data.scene;

  mccree.position.y -= 2.0;

  scene.add(mccree);
});

/**
 * Helper
 */

const axesHelper = new AxesHelper(1);
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

/**
 * Events
 */

function renderPortal() {
  renderer.setRenderTarget(frameRenderTarget);
  portal.visible = false;
  renderer.render(scene, camera);
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
  fpsGraph.begin();

  // Update
  controls2.update();
  controls1.update();
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
