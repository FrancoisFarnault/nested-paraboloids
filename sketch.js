import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

let canvas = document.querySelector('#canvas'),
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
renderer.setSize(window.innerWidth, window.innerHeight);

let fov = 75,
  aspectRatio = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 1000,
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

let mainColor = new THREE.Color("#f7f3f0");

let scene = new THREE.Scene();
scene.background = mainColor;


// PARABOLAS


let boundingRadius = 45,
  numberOfParabolas = 6,
  centerPadding = 10,
  bottomPadding = 3,
  vertexInterspace = 2,
  pointsPerParabola = 17;

let getValuesOfYAtParabolasEndpoints = (numberOfParabolas, boundingRadius, centerPadding, bottomPadding) => {
  let valuesOfY = [],
    yInterspace = (boundingRadius - centerPadding - bottomPadding) / (numberOfParabolas - 1);
  for (let i = 0; i < numberOfParabolas; i++) {
    valuesOfY.push(centerPadding + yInterspace * i);
  }
  return valuesOfY;
};

let getParabolasEndPoints = (valuesOfY, boundingRadius) => {
  let parabolasEndPoints = [];
  for (let y of valuesOfY) {
    let x = Math.sqrt(Math.pow(boundingRadius, 2) - Math.pow(y, 2));
    parabolasEndPoints.push(new THREE.Vector3(x, y, 0));
  }
  return parabolasEndPoints;
};

let getParabolasVertices = (numberOfParabolas, vertexInterspace) => {
  let vertices = [];
  for (let i = 1; i <= numberOfParabolas; i++) {
    let x = vertexInterspace * i;
    vertices.push(new THREE.Vector3(x, 0, 0));
  }
  return vertices;
};

let getNestedParabolasCoordinates = (numberOfParabolas, endPoints, pointsPerParabola, vertices) => {
  /* Reversing the order of the end-points for a right coupling with the parabola vertices. */
  endPoints.reverse();
  let coordinates = [];
  for (let i = 0; i < numberOfParabolas; i++) {
    let distanceFromOrigin = vertices[i].x,
      focalLength = getFocalLengthFromPointAndDistanceFromOrigin(endPoints[i], distanceFromOrigin),
      parabolaHeight = endPoints[i].y * 2;
    let parabolaCoordinates = getParabolaCoordinates(focalLength, parabolaHeight, pointsPerParabola, distanceFromOrigin);
    coordinates.push(parabolaCoordinates);
  }
  return coordinates;
};

let getParabolaCoordinates = (focalLength, parabolaHeight, pointsPerParabola, distanceFromOrigin) => {
  let coordinates = [],
    yIncrement = parabolaHeight / (pointsPerParabola - 1);
  for (let i = 0, y = -parabolaHeight / 2; i < pointsPerParabola; i++, y += yIncrement) {
    let x = Math.pow(y, 2) / (4 * focalLength) + distanceFromOrigin;
    coordinates.push(new THREE.Vector3(x, y, 0));
  }
  return coordinates;
};

let getFocalLengthFromPointAndDistanceFromOrigin = (point, distanceFromOrigin) => {
  return -Math.pow(point.y, 2) / (4 * (distanceFromOrigin - point.x));
};

let valuesOfY = getValuesOfYAtParabolasEndpoints(numberOfParabolas, boundingRadius, centerPadding, bottomPadding),
  endPoints = getParabolasEndPoints(valuesOfY, boundingRadius),
  vertices = getParabolasVertices(numberOfParabolas, vertexInterspace);

let nestedParabolasCoordinates = getNestedParabolasCoordinates(numberOfParabolas, endPoints, pointsPerParabola, vertices);


// MATERIAL

let reflectionCube = new THREE.CubeTextureLoader()
  .setPath('./textures/')
  .load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
  ]);

let frontFacesMaterial = new THREE.MeshPhysicalMaterial({
  color: mainColor,
  side: THREE.DoubleSide,
  envMap: reflectionCube,
  envMapIntensity: 1.2,
  metalness: 0.75,
  clearcoat: 1
});


// NESTED PARABOLOIDS


let nestedParaboloidsMeshes = [],
  numberOfRotations = 30;

for (let parabola of nestedParabolasCoordinates) {
  let geometry = new THREE.LatheBufferGeometry(parabola, numberOfRotations),
    mesh = new THREE.Mesh(geometry, frontFacesMaterial);
  nestedParaboloidsMeshes.push(mesh);
}

for (let mesh of nestedParaboloidsMeshes) {
  scene.add(mesh);
}


// LIGHTS


let directionalLight1 = new THREE.DirectionalLight(mainColor, 0.2);
directionalLight1.position.set(-1, 2, 4); // x, y, z

let directionalLight2 = new THREE.DirectionalLight(mainColor, 0.2);
directionalLight2.position.set(-1, -2, 4);

let color = 0xf7f3f0;
let spotLight = new THREE.SpotLight(color, 1);
spotLight.position.set(0, 0, 400);
spotLight.target.position.set(0, 0, 100);

let lightsGroup = new THREE.Group();
lightsGroup.add(directionalLight1).add(directionalLight2).add(spotLight).add(spotLight.target);
scene.add(lightsGroup);


// RENDERING


function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  for (let mesh of nestedParaboloidsMeshes) {
    mesh.rotation.x += 0.001;
    mesh.rotation.z += 0.0025;
  }
}

requestAnimationFrame(render);