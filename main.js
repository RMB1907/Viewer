import * as THREE from 'three';
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 20;

function createShinyMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color: color instanceof THREE.Color ? color : new THREE.Color(color),
    metalness: 0.2,      
    roughness: 0.1,      
    opacity: 0.8,
    reflectivity: 1.0,   
    clearcoat: 1.0,      
    clearcoatRoughness: 0.05
  });
}

// ---------- Input Vector -------
function createInputVector() {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

  const cols = 10;
  const spacing = 0.4;

  for (let i = 0; i < 90; i++) {
    const cube = new THREE.Mesh(
      geometry,
      createShinyMaterial(new THREE.Color(Math.random(), 0.3, 1.0))
    );

    const row = Math.floor(i / cols);
    const col = i % cols;

    cube.position.x = col * spacing - (cols * spacing) / 2;
    cube.position.y = row * spacing - 2;

    cube.castShadow = true;
    cube.receiveShadow = true;

    group.add(cube);
  }

  return group;
}

const inputVector = createInputVector(); 
inputVector.position.x = -12; 
scene.add(inputVector);

// ---------- Conv1D -----------
function createConvBlock(xPos, yPos, kernelSize, color) {
  const width = kernelSize * 0.5; 
  const height = 2;
  const depth = 1;

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(
    geometry,
    createShinyMaterial(color) 
  );
  mesh.position.set(xPos, yPos, 0); 
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

const gap = 3; 
const conv3 = createConvBlock(-6, gap, 3, 0xff5555);     
const conv5 = createConvBlock(-6, 0, 5, 0x55ff55);      
const conv7 = createConvBlock(-6, -gap, 7, 0x5555ff);   
scene.add(conv3, conv5, conv7);

// ---------- Concat -------------
const concat = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  createShinyMaterial(0x00ffff)
);
concat.position.set(-2, 0, 0);
concat.castShadow = true;
concat.receiveShadow = true;
scene.add(concat);

// ---------- Pool Layer ----------
const pool = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1), 
  createShinyMaterial(0xffff00)
);
pool.position.set(2, 0, 0);
pool.castShadow = true;
pool.receiveShadow = true;
scene.add(pool);

// ---------- LSTM Layer ----------
const lstm = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0xffaa00)
);
lstm.position.set(6, 0, 0);
lstm.castShadow = true;
lstm.receiveShadow = true;
scene.add(lstm);

// ---------- Dense ----------------
const dense = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0xff00ff)
);
dense.position.set(10, 0, 0);
dense.castShadow = true;
dense.receiveShadow = true;
scene.add(dense);

// ---------- Dropout Layer ---------
const drop = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0x00ff00)
);
drop.position.set(14, 0, 0);
drop.castShadow = true;
drop.receiveShadow = true;
scene.add(drop);

// ---------- Output ----------------

const output = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  createShinyMaterial(0x00ffff)
);
output.position.set(18, 0, 0);
output.castShadow = true;
output.receiveShadow = true;
scene.add(output);

/////////////////////////////////////

renderer.shadowMap.enabled = true;
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);
const rimLight = new THREE.DirectionalLight(0x00ffff, 0.6);
rimLight.position.set(-10, 5, -10);
scene.add(rimLight);

function animate() {
  requestAnimationFrame(animate);

  inputVector.rotation.y += 0.002;
  conv3.rotation.y += 0.002;
  conv5.rotation.y += 0.002;
  conv7.rotation.y += 0.002;
  concat.scale.setScalar(1 + 0.01 * Math.sin(Date.now() * 0.005));
  pool.rotation.y += 0.002;
  dense.rotation.y += 0.002;
  drop.rotation.y += 0.002;
  lstm.rotation.y += 0.002;
  output.scale.setScalar(1 + 0.01 * Math.sin(Date.now() * 0.005));

  renderer.render(scene, camera);
}

animate();
