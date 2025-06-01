import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { GLTFLoader } from './GLTFLoader.js';
//import { mannequincontrols } from './mannequincontrols.js';

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
  

 const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000

);


camera.position.set(11.8, 1.34, 1.52);  
camera.lookAt(new THREE.Vector3(0, 0, 0));


  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  


// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;  // Brighter exposure for sunny feel


let mannequin;

  function isClothing(name) {
    if (!name) return false;
   
  
    const cleanName = name.trim().toLowerCase();
      const clothingNames = [
      "converted_jeans",
      "converted_pants_adidas",
      "converted_laces_pants_white",
      "converted_laces_pants_red",
      "converted_shorts_long",
      "converted_shorts_champ",
      "converted_hoodie_mill",
      "converted_t_shirts_champ",
      "converted_long_sleeve_hd",
      "converted_tank_top_rolling_",
      "converted_laces",
      "hat1_",
      "hat2_",
      "hat3_",
      "shoe1_",
      "shoe2_",
      "shoe3_",
    ];
  
    return clothingNames.includes(cleanName);
  }
  
  


  const mtlLoader = new MTLLoader();
  mtlLoader.load('./A-pose HP.mtl', (materials) => {
    materials.preload();

    for (const materialName in materials.materials) {
      const mat = materials.materials[materialName];
  
      if (mat.map) {
        mat.map.wrapS = THREE.RepeatWrapping;
        mat.map.wrapT = THREE.RepeatWrapping;
        mat.map.repeat.set(1, 1); 
      }
  
      if (mat.bumpMap) {
        mat.bumpMap.wrapS = THREE.RepeatWrapping;
        mat.bumpMap.wrapT = THREE.RepeatWrapping;
        mat.bumpMap.repeat.set(1, 1);
        mat.bumpScale = 0;
      }
    } 
  
    
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
  object.position.set(9,-0.02,1);
  object.rotation.y= Math.PI/2;
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
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
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
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
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
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
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
              name.includes("converted_pants_adidas")||
              name.includes("converted_laces_pants_white")
              
            )
          ) {

            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
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
          if (name && name.includes("converted_tank_top_rolling")) {
            
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
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
            name &&(name.includes("converted_shorts_champ")|| 
            name.includes("converted_laces_pants_red"))
          ) {
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
            
        
          
  
            child.visible = true;
            mat.transparent = false;
            mat.needsUpdate = true;
            }
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
              name.includes("converted_hoodie_mill")
              
            )
          ) {
            if (child.visible) {
              child.visible = false;
              mat.transparent = true;
            } else {
              
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
            mat.needsUpdate = true;
          }
        });
      }
    });
  };
  window.pantsAreOn = false;

  window.wearPants4 = function () { 
    if (!mannequin) return;
  
    mannequin.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.toLowerCase();
          if (name && name.includes("converted_shorts_long")) {
            if (window.pantsAreOn) {
              child.visible = false;
              mat.transparent = true;
            } else {
              if (mat.originalMap) mat.map = mat.originalMap;
              if (mat.originalBumpMap) mat.bumpMap = mat.originalBumpMap;
              if (mat.originalNormalMap) mat.normalMap = mat.originalNormalMap;
  
              child.visible = true;
              mat.transparent = false;
            }
            mat.needsUpdate = true;
          }
        });
      }
    });
  
    window.pantsAreOn = !window.pantsAreOn;
  };
  
  


 


  


  let currentHatPath = null;
  let currentHatObject = null;

  window.wearHat = function(modelPath) {
  if (!modelPath) return;

  if (currentHatPath === modelPath && currentHatObject) {
    scene.remove(currentHatObject);
    currentHatPath = null;
    currentHatObject = null;
    return;
  }

  if (currentHatObject) {
    scene.remove(currentHatObject);
    currentHatObject = null;
    currentHatPath = null;
  }

  
  const gltfLoader = new GLTFLoader();
   gltfLoader.load(modelPath, (gltf) => {
    const hatObject = gltf.scene;
    
    hatObject.userData.type = 'hat';
    hatObject.scale.set(0.1094, 0.1, 0.12); 
    hatObject.position.set(-0.04, 1.575, -0.005); 
    scene.add(hatObject);


    currentHatObject = hatObject;
    currentHatPath = modelPath;
  });
};

  window.wearHat2 = function(modelPath) {
 
  if (!modelPath) return;

  if (currentHatPath === modelPath && currentHatObject) {
    scene.remove(currentHatObject);
    currentHatPath = null;
    currentHatObject = null;
    return;
  }

  if (currentHatObject) {
    scene.remove(currentHatObject);
    currentHatObject = null;
    currentHatPath = null;
  }


  const gltfLoader = new GLTFLoader();
  gltfLoader.load(modelPath, (gltf) => {
    const hatObject = gltf.scene;
    
    hatObject.userData.type = 'hat';
  
    hatObject.scale.set(0.915, 0.9, 1); 
  hatObject.position.set(-0.04, 1.565, 0.025); 
    
    scene.add(hatObject);
    currentHatObject = hatObject;
    currentHatPath = modelPath;
  });
};

 window.wearHat3 = function(modelPath) {
 
 
if (!modelPath) return;

if (currentHatPath === modelPath && currentHatObject) {
  scene.remove(currentHatObject);
  currentHatPath = null;
  currentHatObject = null;
  return;
}

if (currentHatObject) {
  scene.remove(currentHatObject);
  currentHatObject = null;
  currentHatPath = null;
}
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(modelPath, (gltf) => {
    const hatObject = gltf.scene;
    hatObject.userData.type = 'hat';

    hatObject.scale.set(0.8, 0.9, 0.8); 
    hatObject.position.set(-0.04, 1.5675, -0.04);
    scene.add(hatObject);
    currentHatObject = hatObject;
    currentHatPath = modelPath;
  });
};


let currentShoesPath = null;
let currentShoeObjects = [];

window.wearShoes = function(modelPath) {
  if (!modelPath) return;

  
  if (currentShoesPath === modelPath && currentShoeObjects.length > 0) {
    currentShoeObjects.forEach(obj => scene.remove(obj));
    currentShoesPath = null;
    currentShoeObjects = [];
    return;
  }

  
  currentShoeObjects.forEach(obj => scene.remove(obj));
  currentShoeObjects = [];
  currentShoesPath = null;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(modelPath, (gltf) => {
    const rightShoe = gltf.scene;
    rightShoe.userData.type = 'shoes';
    rightShoe.scale.set(0.875, 0.9, 1);
    rightShoe.position.set(-0.27, 0.035, -0.0135);
    rightShoe.rotation.y = Math.PI - 0.3;

    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
    leftShoe.scale.set(-0.875, 0.9, 1);
    leftShoe.position.set(0.185, 0.035, -0.0135);
    leftShoe.rotation.y = -0.3;

    scene.add(rightShoe);
    scene.add(leftShoe);

    
    currentShoeObjects = [rightShoe, leftShoe];
    currentShoesPath = modelPath;
  });
};

window.wearShoes2 = function(modelPath) {
  
 
  
  if (!modelPath) return;

  if (currentShoesPath === modelPath && currentShoeObjects.length > 0) {
    currentShoeObjects.forEach(obj => scene.remove(obj));
    currentShoesPath = null;
    currentShoeObjects = [];
    return;
  }

  
  currentShoeObjects.forEach(obj => scene.remove(obj));
  currentShoeObjects = [];
  currentShoesPath = null;
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(modelPath, (gltf) => {
    
    const rightShoe = gltf.scene;
    rightShoe.userData.type = 'shoes';
    rightShoe.scale.set(1.1 , 1.1, 1.1);
   rightShoe.position.set(0.1675, -0.0225, -0.0135); 
        rightShoe.rotation.y = 0.2; 
  
    
    
    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1.1, 1.1, 1.1);
    leftShoe.position.set(-0.27, -0.0225, -0.0135); 
    leftShoe.rotation.y = -0.2; 
    leftShoe.scale.x *= -1;

   
    scene.add(rightShoe);
    scene.add(leftShoe);
    currentShoeObjects = [rightShoe, leftShoe];
    currentShoesPath = modelPath;
  });
};

window.wearShoes3 = function(modelPath) {
  
  
  
  if (!modelPath) return;

  if (currentShoesPath === modelPath && currentShoeObjects.length > 0) {
    currentShoeObjects.forEach(obj => scene.remove(obj));
    currentShoesPath = null;
    currentShoeObjects = [];
    return;
  }

  
  currentShoeObjects.forEach(obj => scene.remove(obj));
  currentShoeObjects = [];
  currentShoesPath = null;
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(modelPath, (gltf) => {
    
    const rightShoe = gltf.scene;
    
    
    rightShoe.userData.type = 'shoes';
    
    
    rightShoe.scale.set(1.4, 1.3, 1.4);
    rightShoe.position.set(0.1675, -0.02, 0.022); 
    rightShoe.rotation.y = 0.2; 
    
   const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1.4, 1.3, 1.4);
    leftShoe.position.set(-0.265, -0.02, 0.022); 
    leftShoe.rotation.y = -0.2; 
    leftShoe.scale.x *= -1;

    scene.add(rightShoe);
    scene.add(leftShoe);
    currentShoeObjects = [rightShoe, leftShoe];
    currentShoesPath = modelPath;
  });
};

window.saveOutfit = function () {
  if (!mannequin) return;

  const outfitData = [];

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      outfitData.push({
        name: child.name,
        visible: child.visible
      });
    }
  });

  localStorage.setItem('savedOutfit', JSON.stringify(outfitData));
  console.log('Outfit saved:', outfitData);
};

window.loadOutfit = function () {
  if (!mannequin) return;

  const savedData = localStorage.getItem('savedOutfit');
  if (!savedData) {
    console.warn('No outfit saved.');
    return;
  }

  const outfitData = JSON.parse(savedData);

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const savedChild = outfitData.find(item => item.name === child.name);
      if (savedChild) {
        child.visible = savedChild.visible;
      }
    }
  });

  console.log('Outfit loaded:', outfitData);
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
}
