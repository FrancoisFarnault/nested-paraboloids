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
  far = 500,
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

let scene = new THREE.Scene();
scene.background = new THREE.Color("#f7f3f0");


// VALUES OF Y AT ENDPOINTS


let boundingDiameter = 80,
  startPadding = 7,
  endPadding = 2,
  numberOfParabolas = 6;

let getValuesOfYAtParabolasEndpoints = (boundingDiameter, startPadding, endPadding, numberOfParabolas) => {
  let boundingRadius = boundingDiameter / 2,
    distanceBetweenFirstAndLastPoint = boundingRadius - startPadding - endPadding,
    interspace = distanceBetweenFirstAndLastPoint / (numberOfParabolas - 1);

  let valuesOfY = [];
  for (let i = 0; i < numberOfParabolas; i++) {
    valuesOfY.push(interspace * i + startPadding);
  }
  return valuesOfY;
};

let valuesOfY = getValuesOfYAtParabolasEndpoints(boundingDiameter, startPadding, endPadding, numberOfParabolas);


// ENDPOINTS COORDINATES


let boundingCircle = new BoundingCircle(boundingDiameter);

let getParabolasEndPoints = (valuesOfY, boundingCircle) => {
  let parabolasEndPoints = [];
  for (let y of valuesOfY) {
    let x = boundingCircle.getXFromY(y);
    parabolasEndPoints.push(new THREE.Vector2(x, y));
  }
  return parabolasEndPoints;
};

let parabolaEndpoints = getParabolasEndPoints(valuesOfY, boundingCircle);


// PARABOLAS VERTICES


let distanceBetweenParabolaVertices = 2;

let getParabolasVertices = (numberOfParabolas, distanceBetweenParabolaVertices) => {
  let vertices = [];
  for (let i = 1; i <= numberOfParabolas; i++) {
    let x = distanceBetweenParabolaVertices * i;
    vertices.push(new THREE.Vector2(x, 0));
  }
  return vertices;
};

let parabolaVertices = getParabolasVertices(numberOfParabolas, distanceBetweenParabolaVertices);


// COUPLING PARABOLAS VERTICES WITH ENDPOINTS


parabolaEndpoints.reverse();

let endpointsAndVertices = [];

for (let i = 0; i < numberOfParabolas; i++) {
  endpointsAndVertices.push({
    endpoint: parabolaEndpoints[i],
    vertex: parabolaVertices[i]
  });
}


// PARABOLAS


let pointsPerParabola = 15;

let getNestedParabolasCoordinates = (numberOfParabolas, endpointsAndVertices, pointsPerParabola) => {
  let nestedParabolaCoordinates = [];
  for (let i = 0; i < numberOfParabolas; i++) {
    let endpoint = endpointsAndVertices[i].endpoint,
      vertex = endpointsAndVertices[i].vertex;

    let parabola = new CShapedParabola(endpoint, vertex, pointsPerParabola),
      parabolaCoordinates = parabola.coordinates;

    nestedParabolaCoordinates.push(parabolaCoordinates);
  }
  return nestedParabolaCoordinates;
};

let nestedParabolasCoordinates = getNestedParabolasCoordinates(numberOfParabolas, endpointsAndVertices, pointsPerParabola);

let fromXYToTREE_Vector2 = (nestedParabolasCoordinates) => {
  let nestedParabolasBuffer = [];
  for (let parabola of nestedParabolasCoordinates) {
    let parabolaBuffer = [];
    for (let point of parabola) {
      parabolaBuffer.push(new THREE.Vector2(parseFloat(point.x), parseFloat(point.y)));
    }
    nestedParabolasBuffer.push(parabolaBuffer);
  }
  return nestedParabolasBuffer;
}

nestedParabolasCoordinates = fromXYToTREE_Vector2(nestedParabolasCoordinates);


// MATERIAL


let frontFacesMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#f7f3f0'),
  side: THREE.FrontSide,
  roughness: 1,
  metalness: 0.1,
});

let backFacesMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#f7f3f0'),
  side: THREE.BackSide,
  roughness: 1,
  metalness: 0.1,
});


// NESTED PARABOLOIDS


let nestedParaboloidsMeshes = [],
  numberOfRotations = 40;

for (let parabola of nestedParabolasCoordinates) {
  let geometry = new THREE.LatheBufferGeometry(parabola, numberOfRotations),
    latheBack = new THREE.Mesh(geometry, backFacesMaterial),
    latheFront = new THREE.Mesh(geometry, frontFacesMaterial);
  nestedParaboloidsMeshes.push(latheFront, latheBack);
};

for (let mesh of nestedParaboloidsMeshes) {
  scene.add(mesh);
}


// LIGHTS


const color = 0xf7f3f0;
const intensity = 1.25;
const light = new THREE.SpotLight(color, intensity);
light.position.set(0, 0, 400);
light.target.position.set(0, 0, 100);
scene.add(light);
scene.add(light.target);


// RENDERING

let render = (time) => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  for (let mesh of nestedParaboloidsMeshes) {
    mesh.rotation.x += 0.001;
    mesh.rotation.z += 0.0025;
  }
};

requestAnimationFrame(render);