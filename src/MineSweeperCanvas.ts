import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

import SceneInit from './SceneInit.js';
import MineSweeper3D from './MineSweeper3D.js';
import CubeUI from './CubeUI.js';
import NumberUI from './NumberUI.js';
import MineUI from './MineUI.js';
import { type ClickResponse, type Position, type FieldToUncover } from './types.js';

import { flaggedFields, gameOverStatus } from './store.js';

export default class MineSweeperCanvas {

  cubes: Cube[][][] = [];
  cubeGroup = new THREE.Group();
  mineSweeper: MineSweeper3D;
  sceneInit: SceneInit;

  isDragging = 0;
  mouseX = 0;
  mouseY = 0;

  font: Promise<Font>;

  lastIntersectedObject: THREE.Mesh<THREE.CircleGeometry, THREE.Material> | null = null;
  adjacentFields: Position[] = [];

  selectAdjacentCubesCallback = this.selectAdjacentCubes.bind(this);

  constructor(private rows: number, private collumns: number, private layers: number, numberOfMines: number, updateClockCallback: (time: number) => void, private canvas: HTMLElement) {

    this.mineSweeper = new MineSweeper3D(rows, collumns, layers, numberOfMines, updateClockCallback);
    this.sceneInit = new SceneInit(canvas);
    this.sceneInit.addEventListener();
    const fontPath = 'assets/helvetiker_regular.typeface.json';
    this.font = this.sceneInit.loadFont(fontPath);
    this.calculateAdjacentCubes();
  }

  public async renderCubes() {
    for (let i = 0; i < this.rows; i++) {
      const row: Cube[][] = [];
      this.cubes.push(row);
      for (let j = 0; j < this.collumns; j++) {
        const column: Cube[] = [];
        this.cubes[i].push(column);
        for (let k = this.layers - 1; k >= 0; k--) {
          const position = this.get3DScenePosition(i, j, k);
          const cubeUI = new CubeUI(position);
          this.cubeGroup.add(cubeUI.cubeMesh);
          this.cubeGroup.add(cubeUI.edgesMesh);
          this.cubes[i][j][k] = {
            selected: false,
            cubeUI
          };
        }
      }
    }

    await this.font;
    this.sceneInit.scene.add(this.cubeGroup);
  }

  public addEventListeners() {
    const keydownCallback = (function (this: MineSweeperCanvas, event: KeyboardEvent) {
      if (event.key === 'Control') {
        this.canvas.addEventListener("mousemove", this.selectAdjacentCubesCallback, false);
      }
    }).bind(this);
    const keyupCallback = (function (this: MineSweeperCanvas, event: KeyboardEvent) {
      if (event.key !== 'Control') return;
      this.canvas.removeEventListener("mousemove", this.selectAdjacentCubesCallback, false);
      this.uncoverAdjacentCubes();
    }).bind(this);
    const mousedownCallback = (function (this: MineSweeperCanvas) { this.isDragging = 0 }).bind(this);
    const mousemoveCallback = (function (this: MineSweeperCanvas) { this.isDragging++ }).bind(this);
    const mouseupCallback = (function (this: MineSweeperCanvas, event: MouseEvent) {
      if (this.isDragging > 5) {
        this.isDragging = 0;
        return;
      }
      const intersects = this.sceneInit.getIntersectedObjects(event.clientX, event.clientY);
      const { object } = intersects.find(shape => (shape.object.geometry instanceof THREE.BoxGeometry)) ?? { object: null };
      const cube = object as THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>;
      if (!cube) return;
      if (cube.scale.x !== 1) return;

      if (event.button == 2 || event.which == 3) {
        this.rightClickCube(cube);
      } else {
        this.leftClickCube(cube);
      }
    }).bind(this);
    window.addEventListener("keydown", keydownCallback);
    window.addEventListener("keyup", keyupCallback);
    this.canvas.addEventListener('mousedown', mousedownCallback);
    this.canvas.addEventListener('mousemove', mousemoveCallback);
    this.canvas.addEventListener('mouseup', mouseupCallback);
  }

  public animate() {
    this.sceneInit.animate();
  }

  private calculateAdjacentCubes() {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const position = { x: i, y: j, z: k };
          this.adjacentFields.push(position);
        }
      }
    }
  }

  private leftClickCube(cube: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>) {
    const p = this.getFieldPosition(cube.position);
    const response = this.mineSweeper.clickField(p);
    const positionsToUncover = response.fieldsToUncover;
    if (positionsToUncover.length == 0) return;
    this.cubeGroup.remove(cube);
    for (const { x, y, z, adjacentMines, mine } of positionsToUncover) {
      if (mine)
        this.renderMine(x, y, z, true);
      else
        this.renderNumberOfAdjacentMines(x, y, z, adjacentMines);
      const cubeToRemove = this.cubes[x][y][z].cubeUI.cubeMesh;
      if (!cubeToRemove) continue;
      this.cubeGroup.remove(cubeToRemove);
      const edgeToRemove = this.cubes[x][y][z].cubeUI.edgesMesh;
      if (!edgeToRemove) continue;
      this.cubeGroup.remove(edgeToRemove);
    }
    if (response.gameOver) {
      this.gameOver(response, p);
    }
  }

  private rightClickCube(renderedCube: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>) {
    const { x, y, z } = this.getFieldPosition(renderedCube.position);
    const status = this.mineSweeper.flagAField({ x, y, z });
    if (status == 'flagged') {
      this.cubes[x][y][z].cubeUI.flagCube();
      this.cubes[x][y][z].cubeUI.flagOverlay?.forEach(faceMesh => {
        this.cubeGroup.add(faceMesh);
      });
      flaggedFields.increment();
    }
    else if (status == 'covered') {
      this.cubes[x][y][z].cubeUI.flagOverlay?.forEach(flag => this.cubeGroup.remove(flag));
      this.cubes[x][y][z].cubeUI.flagOverlay = undefined;
      flaggedFields.decrement();
    }
  }

  private renderMine(i: number, j: number, k: number, explosion: boolean) {
    const position = this.get3DScenePosition(i, j, k);
    const mine = new MineUI(position, explosion);
    this.sceneInit.setRotationFromQuaternion(mine.circleMesh);
    this.cubeGroup.add(mine.circleMesh);
  }

  private async renderNumberOfAdjacentMines(i: number, j: number, k: number, adjacentMines: number) {
    if (adjacentMines === 0) return;
    const position = this.get3DScenePosition(i, j, k);
    const numberUI = new NumberUI(position, adjacentMines, await this.font);
    this.cubes[i][j][k].numberUI = numberUI;
    const textMesh = numberUI.circleMesh;
    this.sceneInit.setRotationFromQuaternion(textMesh);
    this.cubeGroup.add(textMesh);
  }

  private gameOver(response: ClickResponse, p: Position) {
    gameOverStatus.set(response.gameOver ?? '');
    response.unflaggedMines?.forEach(({ x, y, z }) => {
      if (p.x === x && p.y === y && p.z === z) return;
      this.renderMine(x, y, z, false);
      const cubeToRemove = this.cubes[x][y][z].cubeUI.cubeMesh;
      const edgeToRemove = this.cubes[x][y][z].cubeUI.edgesMesh;
      if (!cubeToRemove) return;
      this.cubeGroup.remove(cubeToRemove);
      this.cubeGroup.remove(edgeToRemove);
    });
    this.cubes.forEach(line => line.forEach(collumn => collumn.forEach(cube => {
      cube.cubeUI.changeColor('normal');
      if (!cube.numberUI) return;
      cube.numberUI.selectNumber(false);
    })));
    response.wronglyFlaggedFields?.forEach(({ x, y, z }) => {
      this.cubes[x][y][z].cubeUI.changeColor('wronglyFlagged');
    });
  }

  // private reduceCube(cube: THREE.Object3D) {
  //   if (!cube) return;
  //   const initialScale = cube.scale.clone();
  //   const targetScale = new THREE.Vector3(0, 0, 0);
  //   const duration = 1; // Duração da animação em segundos
  //   const interval = 10; // Intervalo entre os frames em milissegundos
  //   let currentTime = 0;
  //   const timer = setInterval(function (this: MineSweeperCanvas) {
  //     currentTime += interval / 1000; // Converter para segundos
  //     if (currentTime > duration) {
  //       clearInterval(timer);
  //       this.cubeGroup.remove(cube);
  //     } else {
  //       const t = currentTime / duration;
  //       cube.scale.lerpVectors(initialScale, targetScale, t);
  //     }
  //   }, interval);
  // }

  private selectAdjacentCubes(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    const opacity = 0.3;
    const intersects = this.sceneInit.getIntersectedObjects(event.clientX, event.clientY);
    for (const mesh of intersects) {
      if (mesh.object.geometry instanceof THREE.CircleGeometry)
        break;
      if (mesh.object.geometry instanceof THREE.BoxGeometry) {
        if (this.lastIntersectedObject) {
          this.changeColorOfAdjacentCubes(this.getFieldPosition(this.lastIntersectedObject.position), false);
          this.lastIntersectedObject.material.opacity = 0;
        }
        return;
      }
    }
    const { object } = intersects.find(shape => shape.object.geometry instanceof THREE.CircleGeometry) ?? { object: null };
    const number = object as THREE.Mesh<THREE.CircleGeometry, THREE.Material>;
    if (!number) {// está com o mouse fora do número ou saiu do número
      if (this.lastIntersectedObject) {
        this.changeColorOfAdjacentCubes(this.getFieldPosition(this.lastIntersectedObject.position), false);
        this.lastIntersectedObject.material.opacity = 0;
      }
      this.lastIntersectedObject = null;
      return;
    }
    if (this.lastIntersectedObject !== number) { //acabou de entrar no número
      if (this.lastIntersectedObject) {
        this.changeColorOfAdjacentCubes(this.getFieldPosition(this.lastIntersectedObject.position), false);
        this.lastIntersectedObject.material.opacity = 0;
      }
      this.changeColorOfAdjacentCubes(this.getFieldPosition(number.position), true);
      number.material.opacity = opacity;
      const { x, y, z } = this.getFieldPosition(number.position);
      this.lastIntersectedObject = number;
    } else {
      this.changeColorOfAdjacentCubes(this.getFieldPosition(number.position), true);
      const { x, y, z } = this.getFieldPosition(number.position);
      this.cubes[x][y][z].numberUI?.selectNumber(true);
    }
  }

  private uncoverAdjacentCubes() {
    const intersects = this.sceneInit.getIntersectedObjects(this.mouseX, this.mouseY);
    for (const mesh of intersects) {
      if (mesh.object.geometry instanceof THREE.CircleGeometry)
        break;
      if (mesh.object.geometry instanceof THREE.BoxGeometry) {
        return;
      }
    }
    const { object } = intersects.find(shape => shape.object.geometry instanceof THREE.CircleGeometry) ?? { object: null };
    const number = object as THREE.Mesh<THREE.CircleGeometry, THREE.Material>;
    if (!number) return;
    const p = this.getFieldPosition(number.position);
    const response = this.mineSweeper.selectAdjacentFields(p);
    const positionsToUncover = response.fieldsToUncover;
    if (positionsToUncover.length == 0) return;
    for (const { x, y, z, adjacentMines, mine } of positionsToUncover) {
      if (mine)
        this.renderMine(x, y, z, true);
      else
        this.renderNumberOfAdjacentMines(x, y, z, adjacentMines);
      const cubeToRemove = this.cubes[x][y][z].cubeUI.cubeMesh;
      if (!cubeToRemove) continue;
      this.cubeGroup.remove(cubeToRemove);
      const edgeToRemove = this.cubes[x][y][z].cubeUI.edgesMesh;
      if (!edgeToRemove) continue;
      this.cubeGroup.remove(edgeToRemove);
    }
    if (response.gameOver) {
      this.gameOver(response, p);
    }
  }

  private changeColorOfAdjacentCubes(p: Position, select: boolean) {
    for (const a of this.adjacentFields) {
      if (!this.cubes[p.x + a.x]) continue;
      if (!this.cubes[p.x + a.x][p.y + a.y]) continue;
      if (!this.cubes[p.x + a.x][p.y + a.y][p.z + a.z]) continue;
      this.cubes[p.x + a.x][p.y + a.y][p.z + a.z].cubeUI.changeColor(select ? 'selected' : 'normal');
      this.cubes[p.x + a.x][p.y + a.y][p.z + a.z].selected = select;
    }
  }

  private getFieldPosition(v: THREE.Vector3): Position {
    const s = CubeUI.cubeSize + CubeUI.spacing;
    const i = Math.round(((this.rows * s) / 2 - (s / 2) + v.x) / s);
    const j = Math.round(((this.collumns * s) / 2 - (s / 2) + v.y) / s);
    const k = Math.round(((this.layers * s) / 2 - (s / 2) + v.z) / s);
    return { x: i, y: j, z: k };
  }

  private get3DScenePosition(x: number, y: number, z: number): THREE.Vector3 {
    const s = CubeUI.cubeSize + CubeUI.spacing;
    const positionX = (x - this.rows / 2) * s + (s / 2);
    const positionY = (y - this.collumns / 2) * s + (s / 2);
    const positionZ = (z - this.layers / 2) * s + (s / 2);
    return new THREE.Vector3(positionX, positionY, positionZ);
  }

  public newGame(rows: number, collumns: number, layers: number, numberOfMines: number, updateClockCallback: (time: number) => void) {
    this.rows = rows;
    this.collumns = collumns;
    this.layers = layers;
    this.mineSweeper.clearClock();
    this.sceneInit.resetScene();
    this.mineSweeper = new MineSweeper3D(rows, collumns, layers, numberOfMines, updateClockCallback);
    this.cubes = [];
    this.cubeGroup = new THREE.Group();
    this.isDragging = 0;
    this.lastIntersectedObject = null;
  }

}

interface Cube {
  selected: boolean;
  cubeUI: CubeUI;
  numberUI?: NumberUI;
}