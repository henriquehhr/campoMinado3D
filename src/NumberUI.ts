import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export default class NumberUI {
  public static fontPath = 'assets/helvetiker_regular.typeface.json';

  private static numberColor = [
    0,
    0x1E69FF,
    0x278201,
    0xFE3500,
    0x0B3384,
    0x851700,
    0x068284,
    0x853984,
    0x757575
  ];
  private static radius = 0.11;
  private static segments = 20;
  private static initialAngle = 0;
  private static fullAngle = Math.PI * 2;
  private static circleGeometry = new THREE.CircleGeometry(NumberUI.radius, NumberUI.segments, NumberUI.initialAngle, NumberUI.fullAngle);
  private static opacity = 0.3;

  public circleMesh: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;

  constructor(position: THREE.Vector3, number: number, font: Font) {
    const color = NumberUI.numberColor[number];
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 });
    this.circleMesh = new THREE.Mesh(NumberUI.circleGeometry, circleMaterial);
    this.circleMesh.position.copy(position);

    const textMaterial = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide
    });
    const shapes = font.generateShapes('' + number, 0.17);
    const textGeometry = new THREE.ShapeGeometry(shapes);
    textGeometry.translate(-0.6 * NumberUI.radius, 0, 0);
    textGeometry.translate(0, -0.6 * NumberUI.radius, 0);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    this.circleMesh.add(textMesh);
  }

  public selectNumber(select: boolean) {
    this.circleMesh.material.opacity = select ? NumberUI.opacity : 0;
    //this.circleMesh.scale.multiplyScalar(2);
  }

}