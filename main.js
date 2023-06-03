import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const fontLoader = new FontLoader();
fontLoader.load('helvetiker_regular.typeface.json', (font) => {


  const textMaterial = new THREE.MeshBasicMaterial({ color: 0x005697 });

  // Crie uma função para criar um objeto de texto
  function createTextObject(text, position) {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: 0.2,
      height: 0.05,
      curveSegments: 12,
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);

    return textMesh;
  }

  // Tamanho e quantidade de cubos menores
  const cubeSize = 0.5;
  const cubeCount = 3;

  // Espaço vazio entre os cubos
  const spacing = 0.15;

  // Crie uma cena
  const scene = new THREE.Scene();

  // Crie uma câmera
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.updateProjectionMatrix();

  // Crie um renderizador
  const antialias = { antialias: false }
  const renderer = new THREE.WebGLRenderer(antialias);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Adicione os controles orbitais
  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 4;

  // Crie um grupo para os cubos menores
  const cubeGroup = new THREE.Group();

  const texts = [];
  // Crie os cubos menores e adicione-os ao grupo
  for (let i = 0; i < cubeCount; i++) {
    for (let j = 0; j < cubeCount; j++) {
      for (let k = 0; k < cubeCount; k++) {
        const material = new THREE.MeshBasicMaterial({ color: 0x006655, transparent: false, opacity: 0.5 });
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cube = new THREE.Mesh(geometry, material);

        // Crie as arestas dos cubos menores
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);

        const positionX = (i - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
        const positionY = (j - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;
        const positionZ = (k - cubeCount / 2) * (cubeSize + spacing) + (cubeSize + spacing) / 2;

        const textMesh = createTextObject('1', new THREE.Vector3(positionX, positionY, positionZ));
        texts.push(textMesh);
        // Posicione o cubo e suas arestas
        cube.position.set(positionX, positionY, positionZ);
        edgesMesh.position.set(positionX, positionY, positionZ);

        // Adicione o cubo e suas arestas ao grupo
        cubeGroup.add(cube);
        cubeGroup.add(edgesMesh);
        cubeGroup.add(textMesh);
      }
    }
  }

  // Adicione o grupo de cubos à cena
  scene.add(cubeGroup);

  let isDragging = false;
  window.addEventListener('mousedown', () => isDragging = false);
  window.addEventListener('mousemove', () => isDragging = true);

  const raycaster = new THREE.Raycaster();
  const clickMouse = new THREE.Vector2();
  window.addEventListener('mouseup', event => {
    if (isDragging) {
      isDragging = false;
      return;
    }
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    const { object: cube } = intersects.find(shape => shape.object.geometry instanceof THREE.BoxGeometry) ?? { object: null };
    if (!cube) return;
    if (cube.scale.x !== 1) return;
    //const randomColor = Math.random() * 0xffffff;
    //cube.material.color.setHex(randomColor);
    reduceCube(cube)
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


