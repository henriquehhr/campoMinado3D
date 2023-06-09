import MineSweeper3D from './MineSweeper3D.js';
import SceneInit from './SceneInit.js';

import * as THREE from 'three';
import { Position } from './types.js';

const x = 6;
const y = 6;
const z = 6;
const mineSweeper = new MineSweeper3D(x, y, z, 4);
const sceneInit = new SceneInit();

// Tamanho e quantidade de cubos menores
const cubeSize = 0.4;
const cubeCount = mineSweeper.x;

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

const cubeColor = 0x006655;
const flaggedCubeColor = 0xF73970;
//@ts-ignore
const alternativeCubeColor = 0x21ABCD;
const edgeColor = 0xFFFFFF;
//@ts-ignore
const selectedCubeColor = 0x224444;

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

// Crie uma função para criar um objeto de texto
function createTextObject(text: string, position: THREE.Vector3, color: number) {

  const textMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide
  });
  const shapes = font.generateShapes(text, 0.17);
  const textGeometry = new THREE.ShapeGeometry(shapes);

  /*const textMaterial = new THREE.MeshBasicMaterial({ color: color });
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 0.2,
    height: 0.05,
    curveSegments: 12,
  });*/
  /*textGeometry.computeBoundingBox();
  if (textGeometry.boundingBox) {
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
    textGeometry.translate(-0.5 * textWidth, 0, 0);
    textGeometry.translate(0, -0.5 * textHeight, 0);
  }*/
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.copy(position);

  return textMesh;
}

// Crie um grupo para os cubos menores
const cubeGroup = new THREE.Group();

const cubeMap = new Map<string, THREE.Mesh<THREE.BoxGeometry>>;

const adjacentCubes: THREE.Mesh<THREE.BoxGeometry>[][][] = [];
// Crie os cubos menores e adicione-os ao grupo
for (let i = 0; i < cubeCount; i++) {
  const line: Array<any> = [];
  adjacentCubes.push(line);
  for (let j = 0; j < cubeCount; j++) {
    const column: Array<any> = [];
    adjacentCubes[i].push(column);
    for (let k = cubeCount - 1; k >= 0; k--) {
      const material = new THREE.MeshBasicMaterial({ color: cubeColor, transparent: false, opacity: 0.5 });
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cube = new THREE.Mesh(geometry, material);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.1 });
      const edges = new THREE.EdgesGeometry(geometry);
      const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);
      adjacentCubes[i][j][k] = cube;

      const positionX = (i - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
      const positionY = (j - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
      const positionZ = (k - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;

      const adjacentMines = mineSweeper.fields[i][j][k].adjacentMines;
      const isMine = mineSweeper.fields[i][j][k].mine;
      if (adjacentMines > 0 || isMine) {
        let textMesh: THREE.Mesh;
        if (!isMine) {
          textMesh = createTextObject('' + adjacentMines, new THREE.Vector3(positionX, positionY, positionZ), numberColor[adjacentMines]);
        }
        else {
          textMesh = createTextObject('X', new THREE.Vector3(positionX, positionY, positionZ), 0xFFc0cb)
        }
        sceneInit.setRotationFromQuaternion(textMesh);
        cubeGroup.add(textMesh);
        edgesMesh.position.set(positionX, positionY, positionZ);
        cubeGroup.add(edgesMesh);
      }
      cube.position.set(positionX, positionY, positionZ);
      cubeGroup.add(cube);
      cubeMap.set(`${i}${j}${k}`, cube);
    }
  }
}

const geometry = new THREE.BoxGeometry((cubeSize + spacing) * x, (cubeSize + spacing) * y, (cubeSize + spacing) * z);
const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.1 });
const edges = new THREE.EdgesGeometry(geometry);
const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);

sceneInit.scene.add(cubeGroup);
sceneInit.scene.add(edgesMesh);

let isDragging = 0;

window.addEventListener("keydown", event => {
  if (event.ctrlKey)
    window.addEventListener("mousemove", selectAdjacentCubes, false);
});
window.addEventListener("keyup", () => {
  window.removeEventListener("mousemove", selectAdjacentCubes, false);
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

function leftClickCube(cube: any) {
  //reduceCube(cube);
  const p = getFieldPosition(cube.position);
  const response = mineSweeper.clickField(p);
  const positionsToUncover = response.fieldsToUncover;
  if (positionsToUncover?.length == 0) return;
  cubeGroup.remove(cube);
  if (!positionsToUncover) return;
  for (const position of positionsToUncover) {
    const cubeToRemove = cubeMap.get(`${position.x}${position.y}${position.z}`)
    if (!cubeToRemove) continue;
    cubeGroup.remove(cubeToRemove);
  }
  if (response.gameOver)
    alert(response.gameOver);
}
function rightClickCube(cube: any) {
  const p = getFieldPosition(cube.position);
  const status = mineSweeper.flagAField(p);
  let color;
  if (status == 'flagged')
    color = flaggedCubeColor;
  else if (status == 'covered')
    color = cubeColor;
  if (status != 'uncovered')
    //@ts-ignore
    cube.material.color.set(color);
}

let lastIntersectedObject: THREE.Mesh | null = null;
function selectAdjacentCubes(event: MouseEvent) {
  const intersects = sceneInit.getIntersectedObjects(event.clientX, event.clientY);
  for (const mesh of intersects) {
    if (mesh.object.geometry instanceof THREE.ShapeGeometry)
      break;
    if (mesh.object.geometry instanceof THREE.BoxGeometry) {
      if (lastIntersectedObject)
        changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), cubeColor);
      return;
    }
  }
  const { object: number } = intersects.find(shape => shape.object.geometry instanceof THREE.ShapeGeometry) ?? { object: null };

  if (!number) {// está com o mouse fora do número ou saiu do número
    if (lastIntersectedObject)
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), cubeColor);
    lastIntersectedObject = null;
    return;
  }
  if (lastIntersectedObject !== number) { //acabou de entrar no número
    if (lastIntersectedObject)
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), cubeColor);
    changeColorOfAdjacentCubes(getFieldPosition(number.position), selectedCubeColor);
    lastIntersectedObject = number;
  } else {
    changeColorOfAdjacentCubes(getFieldPosition(number.position), selectedCubeColor);
  }
}

function changeColorOfAdjacentCubes(p: Position, color: number) {
  for (const a of adjacentFields) {
    if (!adjacentCubes[p.x + a.x]) continue;
    if (!adjacentCubes[p.x + a.x][p.y + a.y]) continue;
    if (!adjacentCubes[p.x + a.x][p.y + a.y][p.z + a.z]) continue;
    //@ts-ignore
    adjacentCubes[p.x + a.x][p.y + a.y][p.z + a.z].material.color.set(color);
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
  const x = Math.round(((cubeCount * s) / 2 - (s / 2) + v.x) / s);
  const y = Math.round(((cubeCount * s) / 2 - (s / 2) + v.y) / s);
  const z = Math.round(((cubeCount * s) / 2 - (s / 2) + v.z) / s);
  return { x, y, z };
}
sceneInit.animate();