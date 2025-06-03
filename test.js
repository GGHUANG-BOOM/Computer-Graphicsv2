import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { GLTFLoader } from './GLTFLoader.js';

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
        document.querySelector('.gui-left').classList.add('animate');
        document.querySelector('.gui-right').classList.add('animate');
        init();
    }, 800);
});

document.addEventListener('DOMContentLoaded', () => {
    const leftDetails = document.querySelectorAll('.gui-left details');
    const rightDetails = document.querySelectorAll('.gui-right details');
    
    leftDetails.forEach((detail) => {
        detail.addEventListener('click', (e) => {
            if (e.target.nodeName !== 'SUMMARY') return;

            leftDetails.forEach((otherDetail) => {
                if (otherDetail !== detail) {
                    otherDetail.removeAttribute('open');
                }
            });
        });
    });

    rightDetails.forEach((detail) => {
        detail.addEventListener('click', (e) => {
            if (e.target.nodeName !== 'SUMMARY') return;

            rightDetails.forEach((otherDetail) => {
                if (otherDetail !== detail) {
                    otherDetail.removeAttribute('open');
                }
            });
        });
    });
});

function init() {
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 2, 0);
  

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
const sandTexture = textureLoader.load('beach Scene/SandG_001.jpg');
const sandBump = textureLoader.load('beach Scene/SandG_001_b.jpg');

  // Lighting
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 2, 0);
  scene.add(light);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(1, 3, 2);
  scene.add(dirLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
   
  
  
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
  object.position.set(0,-0.02,0);
  object.rotation.y= -Math.PI/2;
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
    hatObject.position.set(0.005, 1.58, -0.04);  
    hatObject.rotation.y = 4.75;
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
  hatObject.position.set(-0.02, 1.565, -0.04); 
        hatObject.rotation.y = 4.75;

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
    hatObject.position.set(0.033, 1.58, -0.04);
    hatObject.rotation.y = 4.75;
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
    rightShoe.position.set(0.015, 0.035, -0.27);
    rightShoe.rotation.y = -5;

    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
    leftShoe.scale.set(-0.875, 0.9, 1);
    leftShoe.position.set(0.015, 0.035, 0.17);
    leftShoe.rotation.y = -4.5;

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
   rightShoe.position.set(0.01, -0.0225, 0.185); 
        rightShoe.rotation.y = -13.825; 
  
    
    
    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1.1, 1.1, 1.1);
    leftShoe.position.set(0.01, -0.0225, -0.275); 
    leftShoe.rotation.y = -14.4; 
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
    rightShoe.position.set(-0.025, -0.0225, 0.1835); 
    rightShoe.rotation.y = -13.825; 
    
   const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1.4, 1.3, 1.4);
    leftShoe.position.set(-0.025, -0.0225, -0.271); 
    leftShoe.rotation.y = -14.4; 
    leftShoe.scale.x *= -1;

    scene.add(rightShoe);
    scene.add(leftShoe);
    currentShoeObjects = [rightShoe, leftShoe];
    currentShoesPath = modelPath;
  });
};

window.setCameraView = function(view) {
  if (view === 'back') {
    camera.position.set(4, 2, 0);    
    camera.lookAt(0, 1.5, 0);
  } else if (view === 'front') {
    camera.position.set(-5, 2, 0);   
    camera.lookAt(0, 1.5, 0);
  } else if (view === 'side') {
    camera.position.set(0, 2.5, 3.5);     
    camera.lookAt(0, 2, 0);
  } else if (view === 'top') {
    camera.position.set(0, 5, 0.1);     
    camera.lookAt(0, 1.5, 0);
  }
  controls.update();
};


let autoRotate = false;
let cameraRotationAngle = 0;
const cameraRadius = 3.5; 
const cameraHeight = 2.5; 
window.toggleAutoRotate = function() {
  autoRotate = !autoRotate;
  const btn = document.querySelector('[onclick="toggleAutoRotate()"]');
  btn.textContent = autoRotate ? 'Stop Rotation' : 'Auto Rotate';
  
  if (!autoRotate) {
  
    camera.position.set(-3, 2, -2);
    controls.update();
  }
};


window.randomOutfit = function() {
  clearAllClothing();
  const shirts = [
     () => wearShirt(),      
    () => wearShirt2(),     
    () => wearShirt3(),    
    () => wearShirt4()      
  ];
   const pants = [
     () => wearPants(),     
     () => wearPants2(),    
      () => wearPants3(),     
        () => wearPants4()      
  ]; const hats = [
     () => wearHat('models/Hat1.glb'),   
      () => wearHat2('models/Hat2.glb'),  
        () => wearHat3('models/Hat3.glb'),  
    () => {} 
  ];
  const shoes = [
      () => wearShoes('models/Shoe1.glb'),  
        () => wearShoes2('models/Shoe2.glb'), 
          () => wearShoes3('models/Shoe3.glb'), 
            () => {} 
  ];
  const randomShirt = shirts[Math.floor(Math.random() * shirts.length)];
    const randomPants = pants[Math.floor(Math.random() * pants.length)];
    const randomHat = hats[Math.floor(Math.random() * hats.length)];
   const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
   setTimeout(randomShirt, 50);
  setTimeout(randomPants, 100);
  setTimeout(randomHat, 150);
  setTimeout(randomShoes, 200);
};
window.clearAllClothing = function() {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => {
    if (isClothing(mat.name)) {   child.visible = false;
    mat.transparent = true;
     mat.needsUpdate = true;
     }
      });
    }
  });
    if (currentHatObject) {
    scene.remove(currentHatObject);
    currentHatObject = null;
    currentHatPath = null;
  } if (currentShoeObjects.length > 0) {
    currentShoeObjects.forEach(obj => scene.remove(obj));
    currentShoeObjects = [];
    currentShoesPath = null;
  }
    window.pantsAreOn = false;
};

let spotlight = null;
let spotlightEnabled = false;

function createSpotlight() {
  if (spotlight) {
    scene.remove(spotlight);
    spotlight = null;
  }
  
  spotlight = new THREE.SpotLight(0xffffff, 2);
  spotlight.position.set(0, 5, 0);
  spotlight.target.position.set(0, 0, 0);
  spotlight.target.updateMatrixWorld();
  spotlight.angle = Math.PI / 6; 
  spotlight.penumbra = 0.3; 
  spotlight.decay = 1;
  spotlight.distance = 10;
  spotlight.castShadow = true;
  
  
  scene.add(spotlight);
  scene.add(spotlight.target);
  
  return spotlight;
}

window.toggleSpotlight = function() {
  if (!spotlightEnabled) {
    if (!spotlight) {
      createSpotlight();
    }
    spotlight.visible = true;
    spotlightEnabled = true;
    
    light.intensity = 0.3;
    dirLight.intensity = 0.2;
  } else {
    if (spotlight) {
      spotlight.visible = false;
    }
    spotlightEnabled = false;
    if (currentBackground === 'bedroom') {
      light.intensity = 0.6;
      dirLight.intensity = 0.4;
    } else {
      light.intensity = 1;
      dirLight.intensity = 0.8;
    }
  }
  
  const btn = document.querySelector('[onclick="toggleSpotlight()"]');
  if (btn) {
    btn.textContent = spotlightEnabled ? 'Spotlight OFF' : 'Spotlight ON';
  }
};

window.setBackground = function(backgroundType) {
  if (currentBackground === backgroundType) return;
  currentBackground = backgroundType;
  
  if (backgroundType === 'bedroom') {
    if (bedroomModel) {
 scene.remove(bedroomModel);
      bedroomModel = null;
    }
    
    if (scene.userData.bedroomLight) {
    scene.remove(scene.userData.bedroomLight);
   scene.userData.bedroomLight = null;
    }
    if (scene.userData.bedroomCeiling) {
   scene.remove(scene.userData.bedroomCeiling);
  scene.userData.bedroomCeiling = null;
    }
    const gltfLoader = new GLTFLoader();
     gltfLoader.load('bedroom.glb', (gltf) => {
      bedroomModel = gltf.scene;
        bedroomModel.scale.set(1.4, 1.4, 1.4);
      bedroomModel.position.set(0, 0, 0);
        scene.add(bedroomModel);
    });
    
       scene.background = new THREE.Color(0xf0f0f0);
      light.intensity = 0.6;
        dirLight.intensity = 0.4;
    
    const bedroomCeilingLight = new THREE.SpotLight(0xfff8dc, 1.2);
    bedroomCeilingLight.position.set(0, 4.5, 0);
        bedroomCeilingLight.target.position.set(0, 1, 0);
           bedroomCeilingLight.angle = Math.PI / 4;
        bedroomCeilingLight.penumbra = 0.3;
        bedroomCeilingLight.decay = 0.8;
        bedroomCeilingLight.distance = 8;
       scene.add(bedroomCeilingLight);
     scene.add(bedroomCeilingLight.target);
    scene.userData.bedroomCeiling = bedroomCeilingLight;
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(2, 2, 1);
    scene.add(fillLight);
    scene.userData.bedroomLight = fillLight;
    camera.position.set(-3.5, 2, 0);
    
  } else {
 if (bedroomModel) {
   scene.remove(bedroomModel);
    bedroomModel = null;
    }
    if (scene.userData.bedroomLight) {
      scene.remove(scene.userData.bedroomLight);
      scene.userData.bedroomLight = null;
    }
    if (scene.userData.bedroomCeiling) {
  scene.remove(scene.userData.bedroomCeiling);
   scene.userData.bedroomCeiling = null;
    }
    camera.position.set(-5, 2, 0);
     scene.background = new THREE.Color(0x333333);
   light.intensity = 1;
   dirLight.intensity = 0.8;
    
    if (backgroundType === 'room') {
   scene.background = new THREE.Color(0x8B7355);
    } else if (backgroundType === 'street') {
    scene.background = new THREE.Color(0x87CEEB);
    }
  }
};
  const ground1 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  ground1.rotation.x = -Math.PI / 2;
  scene.add(ground1);
  let bedroomModel = null;
  let currentBackground = 'studio';

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

 function animate() {
  requestAnimationFrame(animate);
  
  if (autoRotate) {
    cameraRotationAngle += 0.01;
    camera.position.x = Math.cos(cameraRotationAngle) * cameraRadius;
    camera.position.z = Math.sin(cameraRotationAngle) * cameraRadius;
    camera.position.y = cameraHeight;
    camera.lookAt(0, 1, 0);
  }

  controls.update();
  renderer.render(scene, camera);
}

    controls.update();
  renderer.render(scene, camera);
}


