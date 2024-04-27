import * as THREE from 'three';

export default class MineUI {

  private static explosionPicture = new THREE.TextureLoader().load('assets/explosão2.png');
  private static minePicture = new THREE.TextureLoader().load('assets/mine2.webp');
  private static radius = 0.11;
  private static segments = 20;
  private static initialAngle = 0;
  private static fullAngle = Math.PI * 2;
  private static circleGeometry = new THREE.CircleGeometry(MineUI.radius + 0.08, MineUI.segments, MineUI.initialAngle, MineUI.fullAngle);

  public circleMesh: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;

  constructor(position: THREE.Vector3, explosion: boolean) {
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 });
    circleMaterial.map = explosion ? MineUI.explosionPicture : MineUI.minePicture;
    this.circleMesh = new THREE.Mesh(MineUI.circleGeometry, circleMaterial);
    this.circleMesh.position.copy(position);
  }

}