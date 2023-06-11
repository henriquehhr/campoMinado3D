import MineSweeper3D from './MineSweeper3D.js';
import SceneInit from './SceneInit.js';

import * as THREE from 'three';
import { Position } from './types.js';

const x = 6;
const y = 6;
const z = 6;
const mineSweeper = new MineSweeper3D(x, y, z, 12);
const sceneInit = new SceneInit('container');

// Tamanho e quantidade de cubos menores
const cubeSize = 0.5;

// Espaço vazio entre os cubos
const spacing = 0;

const numberColor = [
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

const materials = [
  new THREE.MeshBasicMaterial({ color: 0xCFCFCF }),
  new THREE.MeshBasicMaterial({ color: 0xCFCFCF }),
  new THREE.MeshBasicMaterial({ color: 0x807C7D }),
  new THREE.MeshBasicMaterial({ color: 0x807C7D }),
  new THREE.MeshBasicMaterial({ color: 0xB9B6B7 }),
  new THREE.MeshBasicMaterial({ color: 0xB9B6B7 }),
];

const flaggedMaterial = [
  new THREE.MeshBasicMaterial({ color: 0xDCAFAC }),
  new THREE.MeshBasicMaterial({ color: 0xDCAFAC }),
  new THREE.MeshBasicMaterial({ color: 0xCDA098 }),
  new THREE.MeshBasicMaterial({ color: 0xCDA098 }),
  new THREE.MeshBasicMaterial({ color: 0xAA7F79 }),
  new THREE.MeshBasicMaterial({ color: 0xAA7F79 }),
];

const selectedMaterial = [
  new THREE.MeshBasicMaterial({ color: 0xbbb3ff }),
  new THREE.MeshBasicMaterial({ color: 0xbbb3ff }),
  new THREE.MeshBasicMaterial({ color: 0x6868a7 }),
  new THREE.MeshBasicMaterial({ color: 0x6868a7 }),
  new THREE.MeshBasicMaterial({ color: 0x9391ed }),
  new THREE.MeshBasicMaterial({ color: 0x9391ed }),
];

const selectedFlagged = [
  new THREE.MeshBasicMaterial({ color: 0xff9c8e }),
  new THREE.MeshBasicMaterial({ color: 0xff9c8e }),
  new THREE.MeshBasicMaterial({ color: 0xd98c7e }),
  new THREE.MeshBasicMaterial({ color: 0xd98c7e }),
  new THREE.MeshBasicMaterial({ color: 0xb55651 }),
  new THREE.MeshBasicMaterial({ color: 0xb55651 }),
];


// const cubeColor = 0x006655;
// const alternativeCubeColor = 0x005040;
// const flaggedCubeColor = 0xF73970;
// const alternativeFlaggedColor = 0xDD3050;
// const selectedCubeColor = 0x224444;
const edgeColor = 0xFFFFFF;

const adjacentFields: Position[] = [];
for (let i = -1; i <= 1; i++) {
  for (let j = -1; j <= 1; j++) {
    for (let k = -1; k <= 1; k++) {
      const position = { x: i, y: j, z: k };
      adjacentFields.push(position);
    }
  }
}

const fontPath = 'assets/helvetiker_regular.typeface.json';
const font = await sceneInit.loadFont(fontPath);

const explosionPicture = new THREE.TextureLoader().load('assets/explosão2.png');
const minePicture = new THREE.TextureLoader().load('assets/mine2.webp');
function createTextObject(text: string, position: THREE.Vector3, color: number) {

  const raio = 0.11;
  const segmentos = 20;
  const anguloInicial = 0;
  const anguloCompleto = Math.PI * 2;
  let geometriaCirculo = new THREE.CircleGeometry(raio, segmentos, anguloInicial, anguloCompleto);
  let materialCirculo = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 });
  let circuloMesh = new THREE.Mesh(geometriaCirculo, materialCirculo);
  circuloMesh.position.copy(position);

  const textMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide
  });
  const shapes = font.generateShapes(text, 0.17);
  const textGeometry = new THREE.ShapeGeometry(shapes);
  // textGeometry.computeBoundingBox();
  // if (textGeometry.boundingBox) {
  //   const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  //   const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
  //   textGeometry.translate(-0.5 * textWidth, 0, 0);
  //   textGeometry.translate(0, -0.5 * textHeight, 0);
  // }
  textGeometry.translate(-0.6 * raio, 0, 0);
  textGeometry.translate(0, -0.6 * raio, 0);
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  //textMesh.position.copy(position);

  circuloMesh.add(textMesh);

  if (text === 'X' || text === 'x') {
    geometriaCirculo = new THREE.CircleGeometry(raio + 0.08, segmentos, anguloInicial, anguloCompleto);
    materialCirculo = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 });
    materialCirculo.map = text === 'X' ? explosionPicture : minePicture;
    circuloMesh = new THREE.Mesh(geometriaCirculo, materialCirculo);
    circuloMesh.position.copy(position);
  }

  return circuloMesh;
}

const cubeGroup = new THREE.Group();

interface Cube {
  selected: boolean;
  mesh: THREE.Mesh<THREE.BoxGeometry>;
  edge: THREE.LineSegments;
}

const cubes: Cube[][][] = [];

// Crie os cubos menores e adicione-os ao grupo
for (let i = 0; i < x; i++) {
  const line: Array<any> = [];
  cubes.push(line);
  for (let j = 0; j < y; j++) {
    const column: Array<any> = [];
    cubes[i].push(column);
    for (let k = z - 1; k >= 0; k--) {
      //const material = new THREE.MeshBasicMaterial({ color: cubeColor, transparent: false, opacity: 0.5 });
      // const material = new THREE.MeshNormalMaterial();
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cube = new THREE.Mesh(geometry, materials);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, transparent: false, opacity: 0.1 });
      const edges = new THREE.EdgesGeometry(geometry);
      const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);

      const positionX = (i - x / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
      const positionY = (j - y / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
      const positionZ = (k - z / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;

      edgesMesh.position.set(positionX, positionY, positionZ);
      cubeGroup.add(edgesMesh);
      cube.position.set(positionX, positionY, positionZ);
      cubeGroup.add(cube);

      cubes[i][j][k] = {
        selected: false,
        mesh: cube,
        edge: edgesMesh
      };
    }
  }
}

// const geometry = new THREE.BoxGeometry((cubeSize + spacing) * x, (cubeSize + spacing) * y, (cubeSize + spacing) * z);
// const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, transparent: false, opacity: 0.1 });
// const edges = new THREE.EdgesGeometry(geometry);
// const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);
// sceneInit.scene.add(edgesMesh);

sceneInit.scene.add(cubeGroup);

let isDragging = 0;
let ctrlPressed = false;
window.addEventListener("keydown", event => {
  if (event.ctrlKey) {
    window.addEventListener("mousemove", selectAdjacentCubes, false);
    ctrlPressed = true;
  }
});
window.addEventListener("keyup", () => {
  if (!ctrlPressed) return;
  window.removeEventListener("mousemove", selectAdjacentCubes, false);
  ctrlPressed = false;
});
window.addEventListener('mousedown', () => isDragging = 0);
window.addEventListener('mousemove', () => isDragging++);
window.addEventListener('mouseup', event => {
  if (isDragging > 5) {
    isDragging = 0;
    return;
  }
  const intersects = sceneInit.getIntersectedObjects(event.clientX, event.clientY);
  const { object: cube } = intersects.find(shape => (shape.object.geometry instanceof THREE.BoxGeometry)) ?? { object: null };
  if (!cube) return;
  if (cube.scale.x !== 1) return;

  if (event.button == 2 || event.which == 3) {
    rightClickCube(cube);
  } else {
    leftClickCube(cube);
  }
});

function leftClickCube(cube: any) { //TODO renderizar números somente quando descobertos
  //reduceCube(cube);
  const p = getFieldPosition(cube.position);
  const response = mineSweeper.clickField(p);
  const positionsToUncover = response.fieldsToUncover;
  if (positionsToUncover?.length == 0) return;
  cubeGroup.remove(cube);
  if (!positionsToUncover) return;
  for (const { x, y, z, adjacentMines, mine } of positionsToUncover) {
    renderNumberOfAdjacentMines(x, y, z, adjacentMines, mine);
    const cubeToRemove = cubes[x][y][z].mesh;
    if (!cubeToRemove) continue;
    cubeGroup.remove(cubeToRemove);
    //if (cubes[x][y][z].field.adjacentMines > 0) continue;
    const edgeToRemove = cubes[x][y][z].edge
    if (!edgeToRemove) continue;
    cubeGroup.remove(edgeToRemove);
  }
  if (response.gameOver) {
    setTimeout(() => alert(response.gameOver), 10);
    if (!response.mineFields) return;
    for (const { x, y, z } of response.mineFields) {
      if (p.x === x && p.y === y && p.z === z) continue;
      renderMine(x, y, z, false);
      const cubeToRemove = cubes[x][y][z].mesh;
      if (!cubeToRemove) continue;
      cubeGroup.remove(cubeToRemove);
    }
  }
}
function rightClickCube(cube: any) {
  const p = getFieldPosition(cube.position);
  const status = mineSweeper.flagAField(p);
  const selected = cubes[p.x][p.y][p.z].selected;
  let color;
  if (status == 'flagged')
    color = selected ? selectedFlagged : flaggedMaterial;
  else if (status == 'covered')
    color = selected ? selectedMaterial : materials;
  if (status != 'uncovered') {
    //@ts-ignore
    cube.material = color;
  };
}

function renderMine(i: number, j: number, k: number, revelead: boolean) {
  const positionX = (i - x / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  const positionY = (j - y / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  const positionZ = (k - z / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  const textMesh = createTextObject('x', new THREE.Vector3(positionX, positionY, positionZ), 0xFFc0cb);
  sceneInit.setRotationFromQuaternion(textMesh);
  cubeGroup.add(textMesh);
}

function renderNumberOfAdjacentMines(i: number, j: number, k: number, adjacentMines: number, mine: boolean) {
  if (adjacentMines === 0 && !mine) return;
  const positionX = (i - x / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  const positionY = (j - y / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  const positionZ = (k - z / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
  let textMesh: THREE.Mesh;
  if (!mine) {
    textMesh = createTextObject('' + adjacentMines, new THREE.Vector3(positionX, positionY, positionZ), numberColor[adjacentMines]);
  }
  else {
    textMesh = createTextObject('X', new THREE.Vector3(positionX, positionY, positionZ), 0xFFc0cb)
  }
  sceneInit.setRotationFromQuaternion(textMesh);
  cubeGroup.add(textMesh);
}

let lastIntersectedObject: THREE.Mesh | null = null;
const opacity = 0.3;
function selectAdjacentCubes(event: MouseEvent) {
  const intersects = sceneInit.getIntersectedObjects(event.clientX, event.clientY);
  for (const mesh of intersects) {
    if (mesh.object.geometry instanceof THREE.CircleGeometry)
      break;
    if (mesh.object.geometry instanceof THREE.BoxGeometry) {
      if (lastIntersectedObject) {
        changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
        //@ts-ignore
        lastIntersectedObject.material.opacity = 0;
      }
      return;
    }
  }
  const { object: number } = intersects.find(shape => shape.object.geometry instanceof THREE.CircleGeometry) ?? { object: null };
  if (!number) {// está com o mouse fora do número ou saiu do número
    if (lastIntersectedObject) {
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
      //@ts-ignore
      lastIntersectedObject.material.opacity = 0;
    }
    lastIntersectedObject = null;
    return;
  }
  if (lastIntersectedObject !== number) { //acabou de entrar no número
    if (lastIntersectedObject) {
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
      //@ts-ignore
      lastIntersectedObject.material.opacity = 0;
    }
    changeColorOfAdjacentCubes(getFieldPosition(number.position), true);
    //@ts-ignore
    number.material.opacity = opacity;
    //number.scale.multiplyScalar(2);
    lastIntersectedObject = number;
  } else {
    changeColorOfAdjacentCubes(getFieldPosition(number.position), true);
    //@ts-ignore
    number.material.opacity = opacity;
  }
}

function changeColorOfAdjacentCubes(p: Position, select: boolean) {
  for (const a of adjacentFields) {
    if (!cubes[p.x + a.x]) continue;
    if (!cubes[p.x + a.x][p.y + a.y]) continue;
    if (!cubes[p.x + a.x][p.y + a.y][p.z + a.z]) continue;
    const color = mineSweeper.fields[p.x + a.x][p.y + a.y][p.z + a.z].status == 'flagged' ? flaggedMaterial : materials;
    const alternativeColor = mineSweeper.fields[p.x + a.x][p.y + a.y][p.z + a.z].status == 'flagged' ? selectedFlagged : selectedMaterial;
    //@ts-ignore
    cubes[p.x + a.x][p.y + a.y][p.z + a.z].mesh.material = (select ? alternativeColor : color);
    cubes[p.x + a.x][p.y + a.y][p.z + a.z].selected = select;
  }
}
//function leftAndRightClickCube(intersect: THREE.Intersection[]) { }
/*
  function reduceCube(cube: THREE.Object3D) {
    if (!cube) return;
    const initialScale = cube.scale.clone();
    const targetScale = new THREE.Vector3(0, 0, 0);
    const duration = 1; // Duração da animação em segundos
    const interval = 10; // Intervalo entre os frames em milissegundos

    let currentTime = 0;

    const timer = setInterval(function () {
      currentTime += interval / 1000; // Converter para segundos

      if (currentTime > duration) {
        clearInterval(timer);
        cubeGroup.remove(cube);
      } else {
        const t = currentTime / duration;
        cube.scale.lerpVectors(initialScale, targetScale, t);
      }
    }, interval);
  }
*/

function getFieldPosition(v: THREE.Vector3): Position {
  const s = cubeSize + spacing;
  const i = Math.round(((x * s) / 2 - (s / 2) + v.x) / s);
  const j = Math.round(((y * s) / 2 - (s / 2) + v.y) / s);
  const k = Math.round(((z * s) / 2 - (s / 2) + v.z) / s);
  return { x: i, y: j, z: k };
}
sceneInit.animate();