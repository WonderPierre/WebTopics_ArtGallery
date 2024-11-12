import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";

let container;
let camera, scene, renderer;
let reticle;
let controller;
let paintingImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Van_Gogh_-_Bildnis_eines_jungen_Mannes_mit_Kornblume.jpeg/471px-Van_Gogh_-_Bildnis_eines_jungen_Mannes_mit_Kornblume.jpeg?20211113192650';

init();
animate();

function init() {
  // Set up the full page styles for the body and html
  document.documentElement.style.margin = 0;
  document.documentElement.style.padding = 0;
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.height = '100vh';  // Full height for body
  document.body.style.overflow = 'hidden'; // Hide scrollbars

  // Create a container to hold the AR elements
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  addReticleToScene();

  // Create an image element for the painting and append it to the body
  const imageElement = document.createElement("img");
  imageElement.src = paintingImageURL;
  imageElement.alt = "Van Gogh Painting";
  imageElement.style.position = "absolute";
  imageElement.style.top = "20px";
  imageElement.style.left = "50%";
  imageElement.style.transform = "translateX(-50%)";
  imageElement.style.maxWidth = "80%";
  imageElement.style.zIndex = "10";
  document.body.appendChild(imageElement);
  imageElement.style.display ='none';
  setTimeout(() => {
    imageElement.style.display = 'block';
    imageElement.style.zIndex = -1;
  }, 10000);

  // Create AR button
  const button = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"]
  });
  button.style.backgroundColor = 'black';
  document.body.appendChild(button);
  renderer.domElement.style.display = "none"; // Hide WebGL renderer initially

  const homeButton = document.createElement("button");
  homeButton.innerText = "Home";
  homeButton.style.zIndex = 3;
  homeButton.style.position = "absolute";
  homeButton.style.top = "20px";
  homeButton.style.right = "20px";
  homeButton.style.padding = "10px 20px";
  homeButton.style.fontSize = "16px";
  homeButton.style.backgroundColor = "black";
  homeButton.style.color = "white";
  homeButton.style.border = "none";
  homeButton.style.borderRadius = "5px";
  homeButton.style.cursor = "pointer";

  // Add event listener to the button
  homeButton.addEventListener("click", function() {
    window.location.href = "../";  // Redirect to the home page (use your home page URL here)
  });

  document.body.appendChild(homeButton);

  window.addEventListener("resize", onWindowResize, false);

  // Fetch the painting image dynamically from Wikidata
  fetchPaintingImage();
}


function addReticleToScene() {
  const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  );
  const material = new THREE.MeshBasicMaterial();

  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false; // Start with the reticle not visible
  scene.add(reticle);
}

function onSelect() {        
  if (reticle.visible && paintingImageURL) {
    // Create a plane geometry with the image texture instead of the cone
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(paintingImageURL); // Use the dynamically fetched image

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true, // Make the texture transparent if required
      opacity: 1
    });

    const geometry = new THREE.PlaneGeometry(1, 1); // Size of the plane, you can adjust this
    const mesh = new THREE.Mesh(geometry, material);

    // Set the position of the image based on where the reticle is
    mesh.position.setFromMatrixPosition(reticle.matrix);
    mesh.quaternion.setFromRotationMatrix(reticle.matrix);

    scene.add(mesh); 
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
  const session = renderer.xr.getSession(); // XRSession
  const viewerSpace = await session.requestReferenceSpace("viewer");
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  localSpace = await session.requestReferenceSpace("local");
  hitTestSourceInitialized = true;

  session.addEventListener("end", () => {
    hitTestSourceInitialized = false;
    hitTestSource = null;
  });
}

function render(timestamp, frame) {
  if (frame) {
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    }

    if (hitTestSourceInitialized) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localSpace);

        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }

    renderer.render(scene, camera);
  }
}
