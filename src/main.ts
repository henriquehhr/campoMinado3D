import MineSweeper3D from './MineSweeper3D.js';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { Position } from './types.js';

const mineSweeper = new MineSweeper3D(6, 6, 6, 5);

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

const fontLoader = new FontLoader();
fontLoader.load('assets/helvetiker_regular.typeface.json', (font) => {

  // Crie uma função para criar um objeto de texto
  function createTextObject(text: string, position: THREE.Vector3, color: number) {
    const textMaterial = new THREE.MeshBasicMaterial({ color: color });
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: 0.2,
      height: 0.05,
      curveSegments: 12,
    });
    textGeometry.computeBoundingBox();
    if (textGeometry.boundingBox) {
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
      textGeometry.translate(-0.5 * textWidth, 0, 0);
      textGeometry.translate(0, -0.5 * textHeight, 0);
    }
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);

    return textMesh;
  }

  // Crie uma cena
  const scene = new THREE.Scene();

  // Crie uma câmera
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.updateProjectionMatrix();

  // Crie um renderizador
  const antialias = { antialias: true }
  const renderer = new THREE.WebGLRenderer(antialias);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Adicione os controles orbitais
  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 4;

  // Crie um grupo para os cubos menores
  const cubeGroup = new THREE.Group();

  const cubeMap = new Map<string, THREE.Mesh<THREE.BoxGeometry>>;


  const texts: THREE.Mesh<TextGeometry>[] = [];
  // Crie os cubos menores e adicione-os ao grupo
  for (let i = 0; i < cubeCount; i++) {
    for (let j = 0; j < cubeCount; j++) {
      for (let k = cubeCount - 1; k >= 0; k--) {
        const material = new THREE.MeshBasicMaterial({ color: 0x006655, transparent: false, opacity: 0.5 });
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cube = new THREE.Mesh(geometry, material);
        // Crie as arestas dos cubos menores
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.3 });
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);

        const positionX = (i - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
        const positionY = (j - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
        const positionZ = (k - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;

        const adjacentMines = mineSweeper.fields[i][j][k].adjacentMines;
        const isMine = mineSweeper.fields[i][j][k].mine;
        if (adjacentMines > 0 || isMine) {
          let textMesh: THREE.Mesh<TextGeometry>;
          if (!isMine) {
            textMesh = createTextObject('' + adjacentMines, new THREE.Vector3(positionX, positionY, positionZ), numberColor[adjacentMines]);
          }
          else {
            textMesh = createTextObject('X', new THREE.Vector3(positionX, positionY, positionZ), 0xFFc0cb)
          }
          texts.push(textMesh);
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

  // Adicione o grupo de cubos à cena
  scene.add(cubeGroup);

  const raycaster = new THREE.Raycaster();
  const clickMouse = new THREE.Vector2();
  let isDragging = false;

  window.addEventListener('mousedown', () => isDragging = false);
  window.addEventListener('mousemove', () => isDragging = true);
  window.addEventListener('mouseup', event => {
    if (isDragging) {
      isDragging = false;
      return;
    }
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    //@ts-ignore
    const { object: cube } = intersects.find(shape => shape.object.geometry instanceof THREE.BoxGeometry) ?? { object: null };
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
    console.log(positionsToUncover);
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
      color = 0xF73970;
    else if (status == 'covered')
      color = 0x006655;
    if (status != 'uncovered')
      //@ts-ignore
      cube.material.color.set(color);
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

  // Função de renderização
  function animate() {
    requestAnimationFrame(animate);

    // Atualize os controles
    controls.update();

    // Mantenha o texto sempre em pé e de frente para a câmera
    const quaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(quaternion);
    texts.forEach(text => text.setRotationFromQuaternion(quaternion));

    // Renderize a cena com a câmera
    renderer.render(scene, camera);
  }

  // Inicie a animação
  animate();
});


