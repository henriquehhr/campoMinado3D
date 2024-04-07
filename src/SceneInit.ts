import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { renderer } from './store.js';

export default class SceneInit {
  // NOTE: Core components to initialize Three.js app.
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer | WebGPURenderer;

  // NOTE: Camera params;
  fov = 65;
  nearPlane = 0.1;
  farPlane = 1000;

  // NOTE: Additional components.
  controls: TrackballControls;
  quaternion: THREE.Quaternion;

  rotateWithCamera: THREE.Mesh[] = [];
  raycaster: THREE.Raycaster;
  position: THREE.Vector2;

  onWindowResizeCallback = this.onWindowResize.bind(this);

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      this.nearPlane,
      this.farPlane
    );
    this.camera.position.z = 5;
    this.camera.updateProjectionMatrix();

    if (!canvas) throw new Error("Canvas not found");
    if (renderer.value() == 'WebGPU')
      this.renderer = new WebGPURenderer({ canvas, antialias: true });
    else
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.append(this.renderer.domElement);

    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 4;
    this.quaternion = new THREE.Quaternion();
    this.raycaster = new THREE.Raycaster();
    this.position = new THREE.Vector2();
    // this.startRotationAnimation();
  }

  public addEventListener() {
    window.addEventListener('resize', this.onWindowResizeCallback, false);
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
    // TWEEN.update();
    this.controls.update();
    this.camera.getWorldQuaternion(this.quaternion);
    this.rotateWithCamera.forEach(obj => obj.setRotationFromQuaternion(this.quaternion));
    this.renderer.render(this.scene, this.camera);
  }

  private startRotationAnimation() {
    const rotation = { x: 0, y: 0, z: 0 };
    const scene = this.scene;

    const tween = new TWEEN.Tween(rotation)
      .to({ x: Math.PI / 3, y: Math.PI / 3, z: Math.PI / 3 }, 3000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function () {
        scene.rotation.x = rotation.x;
        scene.rotation.y = rotation.y;
        scene.rotation.z = rotation.z;
      })
      .start();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public resetScene() {
    this.rotateWithCamera = [];

    let objectsToRemove: (THREE.Mesh | THREE.LineSegments)[] = [];
    this.scene.traverse(function (node) {
      if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
        objectsToRemove.push(node);
      }
    });

    this.scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return
      mesh.geometry.dispose()

      if (!Array.isArray(mesh.material)) {
        cleanMaterial(mesh.material)
      } else {
        // an array of materials
        for (const material of mesh.material) cleanMaterial(material)
      }
    });

    objectsToRemove.forEach(node => {
      let parent = node.parent;
      parent?.remove(node);
    });

    function cleanMaterial(material: THREE.Material) {
      material.dispose()

      // dispose textures
      for (const key of Object.keys(material)) {
        //@ts-ignore
        const value = material[key]
        if (value && typeof value === 'object' && 'minFilter' in value) {
          value.dispose()
        }
      }
    }
  }
}