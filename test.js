import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 2, 0);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1, 3, 2);
scene.add(dirLight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);


let mannequin;

function isClothing(name) {
  if (!name) return false;
  name = name.trim().toLowerCase();
  return [
    "converted_jeans",
    "converted_pants_adidas",
    "converted_laces_pants_white",
    "converted_laces_pants_red",
    "converted_shorts_long",
    "converted_shorts_champ",
    "converted_tank_top",
    "converted_tank_top_rolling_",
    "converted_hoodie_mill",
    "converted_t_shirts_champ",
    "converted_long_sleeve_hd",
    "converted_laces",
  ].includes(name);
}

const mtlLoader = new MTLLoader();
mtlLoader.load('./A-pose HP.mtl', (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('./A-pose HP.obj', (object) => {
    const box3 = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box3.getCenter(center);
    box3.getSize(size);

    const scaleFactor = 2 / size.length();
    const tra = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
    const sca = new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor);
    object.applyMatrix4(tra); 
    object.applyMatrix4(sca);

    object.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material;
    
        const storeOriginalMaps = (material) => {
          if (!material.originalMap) {
            material.originalMap = material.map;
            material.originalBumpMap = material.bumpMap;
            material.originalNormalMap = material.normalMap;
            material.originalEmissiveMap = material.emissiveMap;
            material.originalRoughnessMap = material.roughnessMap;
            material.originalMetalnessMap = material.metalnessMap;
            material.originalAlphaMap = material.alphaMap;
          }
        };
    
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if (isClothing(m.name)) {
              child.visible = false;
              storeOriginalMaps(m);
              m.map = null;
              m.bumpMap = null;
              m.normalMap = null;
              m.needsUpdate = true;
            }
          });
        } else {
          if (isClothing(mat.name)) {
            child.visible = false;
            storeOriginalMaps(mat);
            mat.map = null;
            mat.bumpMap = null;
            mat.normalMap = null;
            mat.needsUpdate = true;
          }
        }
      }
    });
object.position.set(0,-0.02,0);
    scene.add(object);
    mannequin = object; 
  });
});




window.wearShirt = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.name && mat.name.toLowerCase().includes("converted_t_shirts_champ")) {
          if (mat.originalMap) mat.map = mat.originalMap;
          if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
          if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          if (mat.originalEmissiveMap) mat.emissiveMap = mat.originalEmissiveMap;
          if (mat.originalRoughnessMap) mat.roughnessMap = mat.originalRoughnessMap;
          if (mat.originalMetalnessMap) mat.metalnessMap = mat.originalMetalnessMap;
          if (mat.originalAlphaMap) mat.alphaMap = mat.originalAlphaMap;
          
          child.visible = true;
          mat.transparent = false;
          mat.needsUpdate = true;
        }
      });
    }
  });
};


window.wearShirt2 = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.name && mat.name.toLowerCase().includes("converted_long_sleeve")) {
          if (mat.originalMap) mat.map = mat.originalMap;
          if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
          if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          if (mat.originalEmissiveMap) mat.emissiveMap = mat.originalEmissiveMap;
          if (mat.originalRoughnessMap) mat.roughnessMap = mat.originalRoughnessMap;
          if (mat.originalMetalnessMap) mat.metalnessMap = mat.originalMetalnessMap;
          if (mat.originalAlphaMap) mat.alphaMap = mat.originalAlphaMap;
          
          child.visible = true;
          mat.transparent = false;
          mat.needsUpdate = true;
        }
      });
    }
  });
};

window.wearPants = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.name && mat.name.toLowerCase().includes("converted_jeans")) {
          if (mat.originalMap) mat.map = mat.originalMap;
          if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
          if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          if (mat.originalEmissiveMap) mat.emissiveMap = mat.originalEmissiveMap;
          if (mat.originalRoughnessMap) mat.roughnessMap = mat.originalRoughnessMap;
          if (mat.originalMetalnessMap) mat.metalnessMap = mat.originalMetalnessMap;
          if (mat.originalAlphaMap) mat.alphaMap = mat.originalAlphaMap;
          
          child.visible = true;
          mat.transparent = false;
          mat.needsUpdate = true;
        }
      });
    }
  });
};

window.wearPants2 = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        const name = mat.name?.toLowerCase();
        if (
          name &&
          (
            name.includes("converted_pants_adidas")
            
          )
        ) {
          if (mat.originalMap) mat.map = mat.originalMap;
          if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
          if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          if (mat.originalEmissiveMap) mat.emissiveMap = mat.originalEmissiveMap;
          if (mat.originalRoughnessMap) mat.roughnessMap = mat.originalRoughnessMap;
          if (mat.originalMetalnessMap) mat.metalnessMap = mat.originalMetalnessMap;
          if (mat.originalAlphaMap) mat.alphaMap = mat.originalAlphaMap;

          child.visible = true;
          mat.transparent = false;
          mat.needsUpdate = true;
        }
      });
    }
  });
};



// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
