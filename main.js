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
camera.position.z = 18;
renderer.setClearColor(0x000010); 

function createShinyMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  })
} 
////////////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////////////////////
const concat = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  createShinyMaterial(0x00ffff)
);
concat.position.set(-2, 0, 0);
concat.castShadow = true;
concat.receiveShadow = true;
scene.add(concat);

const pool = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1), 
  createShinyMaterial(0xffff00)
);
pool.position.set(2, 0, 0);
pool.castShadow = true;
pool.receiveShadow = true;
scene.add(pool);

const lstm = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0xffaa00)
);
lstm.position.set(6, 0, 0);
lstm.castShadow = true;
lstm.receiveShadow = true;
scene.add(lstm);

const dense = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0xff00ff)
);
dense.position.set(10, 0, 0);
dense.castShadow = true;
dense.receiveShadow = true;
scene.add(dense);

const drop = new THREE.Mesh(
  new THREE.BoxGeometry(1, 8, 1),
  createShinyMaterial(0x00ff00)
);
drop.position.set(14, 0, 0);
drop.castShadow = true;
drop.receiveShadow = true;
scene.add(drop);

const output = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  createShinyMaterial(0x00ffff)
);
output.position.set(18, 0, 0);
output.castShadow = true;
output.receiveShadow = true;
scene.add(output);

/////////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////////

  const flowingArrows = [];
  function createArrow(start, end, color = 0x9b59b6) {

  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  dir.normalize();

  const shaftRadius = 0.02;
  const shaftHeight = length - 0.2;

  const shaftGeom = new THREE.CylinderGeometry(
    shaftRadius,
    shaftRadius,
    shaftHeight,
    8,
    1,
    true
  );

  const shaftMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.5,
    roughness: 0.5,
    metalness: 0.2
  });

  const shaft = new THREE.Mesh(shaftGeom, shaftMat);
  shaft.position.copy(start).addScaledVector(dir, shaftHeight / 2);
  shaft.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir
  );

  const coneGeom = new THREE.ConeGeometry(0.06, 0.2, 16);
  const cone = new THREE.Mesh(coneGeom, shaftMat.clone());
  cone.position.copy(start).addScaledVector(dir, length - 0.1);
  cone.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir
  );

  const arrow = new THREE.Group();
  arrow.add(shaft);
  arrow.add(cone);

  const pulseGeom = new THREE.SphereGeometry(0.05, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pulse = new THREE.Mesh(pulseGeom, pulseMat);
  arrow.add(pulse);

  arrow.userData.start = start.clone();
  arrow.userData.end = end.clone();
  arrow.userData.progress = Math.random(); 
  arrow.userData.pulse = pulse;

  flowingArrows.push(arrow);

  return arrow;
}

function animateFlow() {
  flowingArrows.forEach(arrow => {

    arrow.userData.progress += 0.01;
    if (arrow.userData.progress > 1) {
      arrow.userData.progress = 0;
    }

    const pos = new THREE.Vector3().lerpVectors(
      arrow.userData.start,
      arrow.userData.end,
      arrow.userData.progress
    );

    arrow.userData.pulse.position.copy(
      arrow.worldToLocal(pos.clone())
    );
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////
const convPositions = [
  conv3.position.clone(),
  conv5.position.clone(),
  conv7.position.clone()
];

inputVector.children.forEach((cube, index) => {
  if (index % 5 === 0) {
    convPositions.forEach(convPos => {
      const arrow = createArrow(cube.position.clone().add(inputVector.position), convPos);
      scene.add(arrow);
    });
  }
});

function connectFromCenter(fromLayer, toLayer, numArrows = 6, spreadRadius = 0.4, color = 0x9b59b6) {

  const startCenter = new THREE.Vector3();
  const endCenter = new THREE.Vector3();

  fromLayer.getWorldPosition(startCenter);
  toLayer.getWorldPosition(endCenter);

  const mainDir = new THREE.Vector3().subVectors(endCenter, startCenter).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(mainDir, up).normalize();
  const trueUp = new THREE.Vector3().crossVectors(right, mainDir).normalize();

  for (let i = 0; i < numArrows; i++) {

    const angle = (i / numArrows) * Math.PI * 2;

    const radialOffset = right.clone().multiplyScalar(Math.cos(angle) * spreadRadius)
      .add(trueUp.clone().multiplyScalar(Math.sin(angle) * spreadRadius));

    const endPos = endCenter.clone().add(radialOffset);

    const arrow = createArrow(startCenter, endPos, color);
    scene.add(arrow);
  }
}

[conv3, conv5, conv7].forEach(convLayer => {
  connectFromCenter(convLayer, concat, 8, 0.6);
});

const numArrows = 20; 
const poolBox = pool.geometry.boundingBox || new THREE.Box3().setFromObject(pool);

for (let i = 0; i < numArrows; i++) {
  // Pick a random point inside the pool bounding box
  const x = THREE.MathUtils.lerp(poolBox.min.x, poolBox.max.x, Math.random());
  const y = THREE.MathUtils.lerp(poolBox.min.y, poolBox.max.y, Math.random());
  const z = THREE.MathUtils.lerp(poolBox.min.z, poolBox.max.z, Math.random());
  const endPos = new THREE.Vector3(x, y, z);

  const startPos = concat.position.clone(); 
  const arrow = createArrow(startPos, endPos, 0x9b59b6); 
  scene.add(arrow);
}

function connectDivergingArrows(fromLayer, toLayer, numArrows = 20, color = 0x9b59b6) {
  const box = toLayer.geometry?.boundingBox || new THREE.Box3().setFromObject(toLayer);

  for (let i = 0; i < numArrows; i++) {
    const x = THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random());
    const y = THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random());
    const z = THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random());
    const endPos = new THREE.Vector3(x, y, z);

    const startPos = fromLayer.position.clone();
    const arrow = createArrow(startPos, endPos, color);
    scene.add(arrow);
  }
}

connectDivergingArrows(pool, lstm, 25);   
connectDivergingArrows(lstm, dense, 25);  
connectDivergingArrows(dense, drop, 25);  

function connectConvergingArrows(fromLayer, toLayer, numArrows = 30, color = 0x9b59b6) {
  const endPos = toLayer.position.clone(); 
  const box = new THREE.Box3().setFromObject(fromLayer);

  for (let i = 0; i < numArrows; i++) {
    const x = THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random());
    const y = THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random());
    const z = THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random());
    const startPos = new THREE.Vector3(x, y, z);

    const arrow = createArrow(startPos, endPos, color);
    scene.add(arrow);
  }
}
connectConvergingArrows(drop, output, 30); 
////////////////////////////////////////////////////////////////////////////////////////////////////

function animate() {
  requestAnimationFrame(animate);

  const baseSpeed = 0.004; 
  inputVector.rotation.y += baseSpeed * 1.4;   

  conv3.rotation.y += baseSpeed * 0.6;        
  conv5.rotation.y += baseSpeed * 0.6;
  conv7.rotation.y += baseSpeed * 0.6;

  concat.scale.setScalar(
    1 + 0.08 * Math.sin(Date.now() * 0.003)
  );

  pool.rotation.y += baseSpeed * 0.9;         
  lstm.rotation.y += baseSpeed * 0.7;         
  dense.rotation.y += baseSpeed * 1.1;        
  drop.rotation.y += baseSpeed * 0.8;         

  output.scale.setScalar(
    1 + 0.12 * Math.sin(Date.now() * 0.002)    
  );

  animateFlow();
  renderer.render(scene, camera);
}
animate();
