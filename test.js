import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import GUI from './lil-gui.module.min.js';

// Page Navigation
const startButton = document.getElementById('start-button');
const landingPage = document.getElementById('landing-page');
const editorPage = document.getElementById('editor-page');

startButton.addEventListener('click', () => {
    landingPage.style.transform = 'translateY(-100%)';
    landingPage.style.opacity = '0';
    
    editorPage.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        editorPage.style.transform = 'translateY(0)';
        editorPage.style.opacity = '1';
    });

    setTimeout(() => {
        landingPage.classList.add('hidden');
        const gui = document.getElementById('gui');
        gui.classList.add('animate');
        init();
    }, 800);
});

function init() {
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const gui = new GUI();
  
  // Folders for clothing categories
  const torsoFolder = gui.addFolder('Torso');
  const pantsFolder = gui.addFolder('Pants');
  
  // Clothing options
  const clothingOptions = {
    torso: {
      currentWear: 'none',
      items: {
        none: null,
        'Tank Top': 'converted_tank_top',
        'Hoodie': 'converted_hoodie_mill',
        'T-Shirt': 'converted_t_shirts_champ',
        'Long Sleeve': 'converted_long_sleeve_hd'
      }
    },
    pants: {
      currentWear: 'none',
      items: {
        none: null,
        'Jeans': 'converted_jeans',
        'Adidas Pants': 'converted_pants_adidas',
        'Long Shorts': 'converted_shorts_long',
        'Champ Shorts': 'converted_shorts_champ'
      }
    }
  };

  torsoFolder.add(clothingOptions.torso, 'currentWear', clothingOptions.torso.items)
    .name('Style')
    .onChange(value => {
      if (value === null) {
        removeClothing('torso');
      } else {
        wearShirt(value);
      }
  });

  pantsFolder.add(clothingOptions.pants, 'currentWear', clothingOptions.pants.items)
    .name('Style')
    .onChange(value => {
      if (value === null) {
        removeClothing('pants');
      } else {
        wearPants(value);
      }
  });

  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '20px';
  gui.domElement.style.right = '10px';

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

  function removeClothing(type) {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat.name) return;
        
        const name = mat.name.toLowerCase();
        if (type === 'torso' && 
            (name.includes('converted_tank_top') || 
             name.includes('converted_hoodie') ||
             name.includes('converted_t_shirts') ||
             name.includes('converted_long_sleeve'))) {
          child.visible = false;
          mat.map = null;
          mat.bumpMap = null;
          mat.normalMap = null;
          mat.needsUpdate = true;
        } else if (type === 'pants' && 
            (name.includes('converted_jeans') ||
             name.includes('converted_pants') ||
             name.includes('converted_shorts') ||
             name.includes('converted_laces_pants'))) {
          child.visible = false;
          mat.map = null;
          mat.bumpMap = null;
          mat.normalMap = null;
          mat.needsUpdate = true;
        }
      });
    }
  });
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

  window.wearShirt = function (clothingId) {
    if (!mannequin) return;
  
    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
  
          if (!name) return;
  
          const isTorso = name.includes('tank_top') || name.includes('hoodie') ||
                          name.includes('t_shirts') || name.includes('long_sleeve');
  
          if (isTorso) {
            const shouldShow = name.includes(clothingId);
            child.visible = shouldShow;
  
            if (shouldShow) {
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              mat.transparent = false;
              mat.needsUpdate = true;
            } else {
              mat.map = null;
              mat.bumpMap = null;
              mat.normalMap = null;
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  };
  
  
  window.wearPants = function (clothingId) {
    if (!mannequin) return;
  
    const idList = {
      'converted_pants_adidas': ['converted_pants_adidas', 'converted_laces_pants_white'],
      'converted_shorts_champ': ['converted_shorts_champ', 'converted_laces_pants_red', 'converted_buxiugang'],
    };
  
    const activeIds = idList[clothingId] || [clothingId];
  
    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
  
          if (!name) return;
  
          const isPants = name.includes('jeans') || name.includes('pants') || name.includes('shorts') || name.includes('laces');
  
          if (isPants) {
            const shouldShow = activeIds.some(id => name.includes(id));
            child.visible = shouldShow;
  
            if (shouldShow) {
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              mat.transparent = false;
              mat.needsUpdate = true;
            } else {
              mat.map = null;
              mat.bumpMap = null;
              mat.normalMap = null;
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  };
  

/*
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
         

            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
      }
    });
  };

  window.wearShirt3 = function () {
    if (!mannequin) return;

    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
          if (
            name &&
            (
              name.includes("converted_tank_top")
              
            )
          ) {
            if (mat.originalMap) mat.map = mat.originalMap;
            if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
            if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          

            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
      }
    });
  };

  window.wearPants3 = function () {
    if (!mannequin) return;

    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
          if (
            name &&
            (
              name.includes("converted_shorts_champ")
              
            )
          ) {
            if (mat.originalMap) mat.map = mat.originalMap;
            if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
            if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
          

            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
      }
    });
  };

  window.wearShirt4 = function () {
    if (!mannequin) return;

    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
          if (
            name &&
            (
              name.includes("converted_tank_top_rolling_")
              
            )
          ) {
            if (mat.originalMap) mat.map = mat.originalMap;
            if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
            if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
         

            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
      }
    });
  };
  window.wearPants4 = function () {
    if (!mannequin) return;

    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
          if (
            name &&
            (
              name.includes("converted_shorts_long")
              
            )
          ) {
            if (mat.originalMap) mat.map = mat.originalMap;
            if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
            if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
           

            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
      }
    });
  }; */

  
  
  

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
}
