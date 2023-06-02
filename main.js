import * as THREE from 'three';
//import { OrbitControls } from './OrbitControls';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

// Crie uma cena
const scene = new THREE.Scene();

// Crie uma câmera
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Crie um renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adicione os controles orbitais
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;

// Crie um grupo para os cubos menores
const cubeGroup = new THREE.Group();

// Tamanho e quantidade de cubos menores
const cubeSize = 0.5;
const cubeCount = 4;

// Espaço vazio entre os cubos
const spacing = 0.1;

// Crie os cubos menores e adicione-os ao grupo
for (let i = 0; i < cubeCount; i++) {
  for (let j = 0; j < cubeCount; j++) {
    for (let k = 0; k < cubeCount; k++) {
      const material = new THREE.MeshBasicMaterial({ color: 0x006655 });
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cube = new THREE.Mesh(geometry, material);

      // Crie as arestas dos cubos menores
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
      const edges = new THREE.EdgesGeometry(geometry);
      const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);

      // Posicione o cubo e suas arestas
      const positionX = (i - cubeCount / 2) * (cubeSize + spacing);
      const positionY = (j - cubeCount / 2) * (cubeSize + spacing);
      const positionZ = (k - cubeCount / 2) * (cubeSize + spacing);
      cube.position.set(positionX, positionY, positionZ);
      edgesMesh.position.set(positionX, positionY, positionZ);

      // Adicione o cubo e suas arestas ao grupo
      cubeGroup.add(cube);
      cubeGroup.add(edgesMesh);
    }
  }
}

// Adicione o grupo de cubos à cena
scene.add(cubeGroup);

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
window.addEventListener('click', event => {
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(clickMouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length == 0) return;
  let i = 1;
  while (i + 1 <= intersects.length && !(intersects[i].object instanceof THREE.Mesh))
    i++;
  //const randomColor = Math.random() * 0xffffff;
  //intersects[i]?.object.material.color.setHex(randomColor);
  reduceCube(intersects[i]?.object)
});

function reduceCube(cube) {
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
      console.log("cubo removido")
    } else {
      const t = currentTime / duration;
      cube.scale.lerpVectors(initialScale, targetScale, t);
    }
  }, interval);
}

// Função de renderização
function animate() {
  requestAnimationFrame(animate);

  // Atualize os controles
  controls.update();

  // Renderize a cena com a câmera
  renderer.render(scene, camera);
}

// Inicie a animação
animate();
