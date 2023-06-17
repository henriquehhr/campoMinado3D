import * as THREE from 'three';

import SceneInit from './SceneInit.js';
import MineSweeper3D from './MineSweeper3D.js';
import CubeUI from './CubeUI.js';
import NumberUI from './NumberUI.js';
import MineUI from './MineUI.js';
import { ClickResponse, Position } from './types.js';

const rows = 6;
const collumns = 6;
const layers = 6;
const numberOfMines = 8;

let scoreboard = document.querySelector('#mines');
if (!scoreboard)
  scoreboard = document.createElement('div');
let flaggedFields = 0;
scoreboard.innerHTML = flaggedFields + ' / ' + numberOfMines;

let clock = document.querySelector('#clock');
if (!clock) clock = document.createElement('div');

function updateClockCallback(time: number) {
  if (!clock) return;
  clock.innerHTML = '' + time;
}

const mineSweeper = new MineSweeper3D(rows, collumns, layers, numberOfMines, updateClockCallback);
const containerID = 'container';
const sceneInit = new SceneInit(containerID);

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

const cubeGroup = new THREE.Group();

interface Cube {
  selected: boolean;
  cubeUI: CubeUI;
  numberUI?: NumberUI;
}

const cubes: Cube[][][] = [];

for (let i = 0; i < rows; i++) {
  const row: Cube[][] = [];
  cubes.push(row);
  for (let j = 0; j < collumns; j++) {
    const column: Cube[] = [];
    cubes[i].push(column);
    for (let k = layers - 1; k >= 0; k--) {
      const position = get3DScenePosition(i, j, k);
      const cubeUI = new CubeUI(position);
      cubeGroup.add(cubeUI.cubeMesh);
      cubeGroup.add(cubeUI.edgesMesh);
      cubes[i][j][k] = {
        selected: false,
        cubeUI
      };
    }
  }
}

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
  const { object } = intersects.find(shape => (shape.object.geometry instanceof THREE.BoxGeometry)) ?? { object: null };
  const cube = object as THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>;
  if (!cube) return;
  if (cube.scale.x !== 1) return;

  if (event.button == 2 || event.which == 3) {
    rightClickCube(cube);
  } else {
    leftClickCube(cube);
  }
});

function leftClickCube(cube: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>) {
  //reduceCube(cube);
  const p = getFieldPosition(cube.position);
  const response = mineSweeper.clickField(p);
  const positionsToUncover = response.fieldsToUncover;
  if (positionsToUncover?.length == 0) return;
  cubeGroup.remove(cube);
  if (!positionsToUncover) return;
  for (const { x, y, z, adjacentMines, mine } of positionsToUncover) {
    if (mine)
      renderMine(x, y, z, true);
    else
      renderNumberOfAdjacentMines(x, y, z, adjacentMines);
    const cubeToRemove = cubes[x][y][z].cubeUI.cubeMesh;
    if (!cubeToRemove) continue;
    cubeGroup.remove(cubeToRemove);
    const edgeToRemove = cubes[x][y][z].cubeUI.edgesMesh;
    if (!edgeToRemove) continue;
    cubeGroup.remove(edgeToRemove);
  }
  if (response.gameOver) {
    gameOver(response, p);
  }
}
function rightClickCube(renderedCube: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>) {
  const { x, y, z } = getFieldPosition(renderedCube.position);
  const status = mineSweeper.flagAField({ x, y, z });
  if (status == 'flagged') {
    flaggedFields++;
    if (!scoreboard) return;
    scoreboard.innerHTML = flaggedFields + ' / ' + numberOfMines;
    cubes[x][y][z].cubeUI.flagCube();
    cubes[x][y][z].cubeUI.flagOverlay?.forEach(faceMesh => {
      sceneInit.scene.add(faceMesh);
    });
  }
  else if (status == 'covered') {
    flaggedFields--;
    if (!scoreboard) return;
    scoreboard.innerHTML = flaggedFields + ' / ' + numberOfMines;
    cubes[x][y][z].cubeUI.flagOverlay?.forEach(flag => sceneInit.scene.remove(flag));
    cubes[x][y][z].cubeUI.flagOverlay = undefined;
  }
}

function renderMine(i: number, j: number, k: number, explosion: boolean) {
  const position = get3DScenePosition(i, j, k);
  const mine = new MineUI(position, explosion);
  sceneInit.setRotationFromQuaternion(mine.circleMesh);
  cubeGroup.add(mine.circleMesh);
}

function renderNumberOfAdjacentMines(i: number, j: number, k: number, adjacentMines: number) {
  if (adjacentMines === 0) return;
  const position = get3DScenePosition(i, j, k);
  const numberUI = new NumberUI(position, adjacentMines, font);
  cubes[i][j][k].numberUI = numberUI;
  const textMesh = numberUI.circleMesh;
  sceneInit.setRotationFromQuaternion(textMesh);
  cubeGroup.add(textMesh);
}

function gameOver(response: ClickResponse, p: Position) {
  setTimeout(() => alert(response.gameOver), 10);
  response.unflaggedMines?.forEach(({ x, y, z }) => {
    if (p.x === x && p.y === y && p.z === z) return;
    renderMine(x, y, z, false);
    const cubeToRemove = cubes[x][y][z].cubeUI.cubeMesh;
    if (!cubeToRemove) return;
    cubeGroup.remove(cubeToRemove);
  });
  cubes.forEach(line => line.forEach(collumn => collumn.forEach(cube => {
    cube.cubeUI.changeColor('normal');
    if (!cube.numberUI) return;
    cube.numberUI.selectNumber(false);
  })));
  response.wronglyFlaggedFields?.forEach(({ x, y, z }) => {
    cubes[x][y][z].cubeUI.changeColor('wronglyFlagged');
  });
}

let lastIntersectedObject: THREE.Mesh<THREE.CircleGeometry, THREE.Material> | null = null;
const opacity = 0.3;

function selectAdjacentCubes(event: MouseEvent) {
  const intersects = sceneInit.getIntersectedObjects(event.clientX, event.clientY);
  for (const mesh of intersects) {
    if (mesh.object.geometry instanceof THREE.CircleGeometry)
      break;
    if (mesh.object.geometry instanceof THREE.BoxGeometry) {
      if (lastIntersectedObject) {
        changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
        lastIntersectedObject.material.opacity = 0;
      }
      return;
    }
  }
  const { object } = intersects.find(shape => shape.object.geometry instanceof THREE.CircleGeometry) ?? { object: null };
  const number = object as THREE.Mesh<THREE.CircleGeometry, THREE.Material>;
  if (!number) {// está com o mouse fora do número ou saiu do número
    if (lastIntersectedObject) {
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
      lastIntersectedObject.material.opacity = 0;
    }
    lastIntersectedObject = null;
    return;
  }
  if (lastIntersectedObject !== number) { //acabou de entrar no número
    if (lastIntersectedObject) {
      changeColorOfAdjacentCubes(getFieldPosition(lastIntersectedObject.position), false);
      lastIntersectedObject.material.opacity = 0;
    }
    changeColorOfAdjacentCubes(getFieldPosition(number.position), true);
    number.material.opacity = opacity;
    const { x, y, z } = getFieldPosition(number.position);
    lastIntersectedObject = number;
  } else {
    changeColorOfAdjacentCubes(getFieldPosition(number.position), true);
    const { x, y, z } = getFieldPosition(number.position);
    cubes[x][y][z].numberUI?.selectNumber(true);
  }
}

function changeColorOfAdjacentCubes(p: Position, select: boolean) {
  for (const a of adjacentFields) {
    if (!cubes[p.x + a.x]) continue;
    if (!cubes[p.x + a.x][p.y + a.y]) continue;
    if (!cubes[p.x + a.x][p.y + a.y][p.z + a.z]) continue;
    cubes[p.x + a.x][p.y + a.y][p.z + a.z].cubeUI.changeColor(select ? 'selected' : 'normal');
    cubes[p.x + a.x][p.y + a.y][p.z + a.z].selected = select;
  }
}

function getFieldPosition(v: THREE.Vector3): Position {
  const s = CubeUI.cubeSize + CubeUI.spacing;
  const i = Math.round(((rows * s) / 2 - (s / 2) + v.x) / s);
  const j = Math.round(((collumns * s) / 2 - (s / 2) + v.y) / s);
  const k = Math.round(((layers * s) / 2 - (s / 2) + v.z) / s);
  return { x: i, y: j, z: k };
}

function get3DScenePosition(x: number, y: number, z: number): THREE.Vector3 {
  const s = CubeUI.cubeSize + CubeUI.spacing;
  const positionX = (x - rows / 2) * s + (s / 2);
  const positionY = (y - collumns / 2) * s + (s / 2);
  const positionZ = (z - layers / 2) * s + (s / 2);
  return new THREE.Vector3(positionX, positionY, positionZ);
}
sceneInit.animate();