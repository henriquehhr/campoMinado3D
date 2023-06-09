import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';

export default class SceneInit {
  // NOTE: Core components to initialize Three.js app.
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  // NOTE: Camera params;
  fov = 65;
  nearPlane = 0.1;
  farPlane = 1000;

  // ambientLight: THREE.AmbientLight;
  // directionalLight: THREE.DirectionalLight;

  // NOTE: Additional components.
  controls: TrackballControls;
  quaternion: THREE.Quaternion;

  rotateWithCamera: THREE.Mesh[] = [];
  raycaster: THREE.Raycaster;
  position: THREE.Vector2;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      this.nearPlane,
      this.farPlane
    );
    this.camera.position.z = 5;
    this.camera.updateProjectionMatrix();

    // this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // this.ambientLight.castShadow = true;
    // this.scene.add(this.ambientLight);

    // // directional light - parallel sun rays
    // this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // // this.directionalLight.castShadow = true;
    // this.directionalLight.position.set(0, 32, 64);
    // this.scene.add(this.directionalLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 4;
    this.quaternion = new THREE.Quaternion();
    this.raycaster = new THREE.Raycaster();
    this.position = new THREE.Vector2();

    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  public loadFont(fontPath: string): Promise<Font> {
    const fontLoader = new FontLoader();
    const font = new Promise((resolve) => {
      fontLoader.load(fontPath, resolve);
    });
    return font as Promise<Font>;
  }

  public setRotationFromQuaternion(object: THREE.Mesh) {
    this.rotateWithCamera.push(object);
  }

  public getIntersectedObjects(x: number, y: number) {
    this.position.x = (x / window.innerWidth) * 2 - 1;
    this.position.y = - (y / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.position, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children) as THREE.Intersection<THREE.Mesh>[];
    return intersects;
  }

  public animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.camera.getWorldQuaternion(this.quaternion);
    this.rotateWithCamera.forEach(obj => obj.setRotationFromQuaternion(this.quaternion));
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}