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

  private static flagImage = new THREE.TextureLoader().load('assets/flag.png');
  private static flagMaterial = new THREE.MeshBasicMaterial({
    map: CubeUI.flagImage,
    transparent: true
  });
  private static faceGeometry = new THREE.PlaneGeometry(CubeUI.cubeSize, CubeUI.cubeSize);

  cubeMesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>;
  edgesMesh: THREE.LineSegments<THREE.EdgesGeometry, THREE.Material>;
  flagOverlay?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[];

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

  public flagCube() {
    this.flagOverlay = [];
    for (let i = 0; i < 6; i++) {
      const faceMesh = new THREE.Mesh(CubeUI.faceGeometry, CubeUI.flagMaterial);
      this.flagOverlay.push(faceMesh);
    }
    const p = this.cubeMesh.position;
    this.flagOverlay[0].position.set(p.x, p.y + (CubeUI.cubeSize / 2), p.z);
    this.flagOverlay[0].rotation.x = (3 * Math.PI) / 2;
    this.flagOverlay[1].position.set(p.x, p.y - (CubeUI.cubeSize / 2), p.z);
    this.flagOverlay[1].rotation.x = Math.PI / 2;
    this.flagOverlay[2].position.set(p.x, p.y, p.z + (CubeUI.cubeSize / 2));
    this.flagOverlay[3].position.set(p.x, p.y, p.z - (CubeUI.cubeSize / 2));
    this.flagOverlay[3].rotation.x = Math.PI;
    this.flagOverlay[4].position.set(p.x - (CubeUI.cubeSize / 2), p.y, p.z);
    this.flagOverlay[4].rotation.y = (3 * Math.PI) / 2;
    this.flagOverlay[5].position.set(p.x + (CubeUI.cubeSize / 2), p.y, p.z);
    this.flagOverlay[5].rotation.y = Math.PI / 2;
  }

}