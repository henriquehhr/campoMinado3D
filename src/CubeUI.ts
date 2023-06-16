import * as THREE from 'three';

export default class CubeUI {

  public static cubeSize = 0.5;
  public static spacing = 0;

  private static cubeGeometry = new THREE.BoxGeometry(CubeUI.cubeSize, CubeUI.cubeSize, CubeUI.cubeSize);
  private static materials = [
    new THREE.MeshBasicMaterial({ color: 0xCFCFCF }),
    new THREE.MeshBasicMaterial({ color: 0xCFCFCF }),
    new THREE.MeshBasicMaterial({ color: 0x807C7D }),
    new THREE.MeshBasicMaterial({ color: 0x807C7D }),
    new THREE.MeshBasicMaterial({ color: 0xB9B6B7 }),
    new THREE.MeshBasicMaterial({ color: 0xB9B6B7 }),
  ];
  private static selectedMaterial = [
    new THREE.MeshBasicMaterial({ color: 0xbbb3ff }),
    new THREE.MeshBasicMaterial({ color: 0xbbb3ff }),
    new THREE.MeshBasicMaterial({ color: 0x6868a7 }),
    new THREE.MeshBasicMaterial({ color: 0x6868a7 }),
    new THREE.MeshBasicMaterial({ color: 0x9391ed }),
    new THREE.MeshBasicMaterial({ color: 0x9391ed }),
  ];
  private static wronglyFlaggedMaterial = [
    new THREE.MeshBasicMaterial({ color: 0xff9c8e }),
    new THREE.MeshBasicMaterial({ color: 0xff9c8e }),
    new THREE.MeshBasicMaterial({ color: 0xd98c7e }),
    new THREE.MeshBasicMaterial({ color: 0xd98c7e }),
    new THREE.MeshBasicMaterial({ color: 0xb55651 }),
    new THREE.MeshBasicMaterial({ color: 0xb55651 }),
  ];

  private static edgesGeometry = new THREE.EdgesGeometry(CubeUI.cubeGeometry);
  private static edgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: false, opacity: 0.1 });

  cubeMesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>;
  edgesMesh: THREE.LineSegments<THREE.EdgesGeometry, THREE.Material>;

  constructor(position: THREE.Vector3) {
    this.cubeMesh = new THREE.Mesh(CubeUI.cubeGeometry, CubeUI.materials);
    this.edgesMesh = new THREE.LineSegments(CubeUI.edgesGeometry, CubeUI.edgeMaterial);

    this.edgesMesh.position.copy(position);
    this.cubeMesh.position.copy(position);
  }

  public changeColor(color: 'normal' | 'selected' | 'wronglyFlagged') {
    if (color == 'normal')
      this.cubeMesh.material = CubeUI.materials;
    else if (color == 'selected')
      this.cubeMesh.material = CubeUI.selectedMaterial;
    else if (color == 'wronglyFlagged')
      this.cubeMesh.material = CubeUI.wronglyFlaggedMaterial;
  }

}