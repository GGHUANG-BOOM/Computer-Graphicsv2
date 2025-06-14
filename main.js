import * as THREE from './three.module.js';
import { MTLLoader } from './Loaders/MTLLoader.js';
import { OBJLoader } from './Loaders/OBJLoader.js';
import { GLTFLoader } from './Loaders/GLTFLoader.js';
import { Water } from './objects/Water2.js';
import { Sky } from './objects/Sky.js';
import {GUI}  from './lil-gui.module.min.js';
import { OrbitControls } from './OrbitControls.js';


// Page Navigation
const startButton = document.getElementById('start-button');
const landingPage = document.getElementById('landing-page');
const editorPage = document.getElementById('editor-page');
window.moveCameraToPosition = null;


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
        detail.addEventListener('toggle', (e) => {
            if (!detail.open) {
                moveCameraToPosition('default');
                return;
            }

            const section = detail.querySelector('summary').textContent.trim().toLowerCase();
            switch(section) {
                case 'shirts':
                    moveCameraToPosition('shirts');
                    break;
                case 'pants':
                    moveCameraToPosition('pants');
                    break;
                case 'hats':
                    moveCameraToPosition('hats');
                    break;
                case 'shoes':
                    moveCameraToPosition('shoes');
                    break;
            }
        });


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
let mannequin = null;
let bedroomModel = null;
let sky, water, sandMesh, ground;
let cloudMaterial;
let beachScene, rockModel;
let cloudGroup;
let palmTree,palmTree2;
let currentBackground = "room";
let isAutoRotating = false;

function init() {

 
 
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
 


  const camera = new THREE.PerspectiveCamera(
   45, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  
  scene.background = new THREE.Color(0x333333);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  ground = new THREE.Mesh(new THREE.PlaneGeometry(11, 20), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(7, 0.005, 0);
  scene.add(ground);


  const defaultLightCenter = new THREE.Vector3(10, 0, 0); 

  const dirLight = new THREE.DirectionalLight(0xfff6e6, 3);
  dirLight.position.set(defaultLightCenter.x + 15, 50, defaultLightCenter.z + 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 100;
  scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0xffffee, 0x88bbff, 1.2);
  hemiLight.position.set(defaultLightCenter.x, 60, defaultLightCenter.z);
  scene.add(hemiLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight); 


  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
 const controls = new OrbitControls(camera, renderer.domElement);
 controls.target.set(9, 1, 1);
 controls.update();
controls.minPolarAngle = Math.PI / 2; 
controls.maxPolarAngle = Math.PI / 2;

controls.enableZoom = false;     
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

window.toggleAutoRotate =function() {
  isAutoRotating = !isAutoRotating;
  controls.autoRotate = isAutoRotating;

  const btn = document.querySelector('[onclick="toggleAutoRotate()"]');
  btn.textContent = isAutoRotating ? 'Stop Rotation' : 'Auto Rotate';
}

  const cameraPositions = {
    default: {
      position: new THREE.Vector3(11.8, 1.34, 1.52),
      target: new THREE.Vector3(9, 1, 1)
    },
    shirts: {
      position: new THREE.Vector3(10.5, 1.34, 1.52),
      target: new THREE.Vector3(9, 1, 1)
    },
    pants: {
      position: new THREE.Vector3(10.5, 1, 1.52),
      target: new THREE.Vector3(9, 0.5, 1)
    },
    hats: {
      position: new THREE.Vector3(10.5, 1.5, 1.52),
      target: new THREE.Vector3(9, 1.5, 1)
    },
    shoes: {
      position: new THREE.Vector3(10.5, 0.2, 1.52),
      target: new THREE.Vector3(9, 0.1, 1)
    }
  };

  const lookAtTarget = new THREE.Vector3();
 camera.position.copy(cameraPositions.default.position);
lookAtTarget.copy(cameraPositions.default.target);
camera.lookAt(lookAtTarget);

 window.moveCameraToPosition = function (positionKey, duration = 1000) {
  const targetPosition = cameraPositions[positionKey].position.clone();
  const targetLookAt = cameraPositions[positionKey].target.clone();

  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone(); 
  const startTime = Date.now();

  function updateCamera() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress * (2 - progress); 

 
    const newPosition = startPosition.clone().lerp(targetPosition, easeProgress);
    const newTarget = startTarget.clone().lerp(targetLookAt, easeProgress);

    camera.position.copy(newPosition);
    controls.target.copy(newTarget);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }

  updateCamera();
};


  


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
mtlLoader.load('./Mannequin/A-pose HP.mtl', (materials) => {
  materials.preload();

  const mannequinMaterials = [
    'Converted_buxiugang',
    'Converted_PVC_FurnGrad_Charcoal_Gray',
  ];

  const guiSettings = {
    modelColor: "#919191"
  };

  const gui = new GUI({ 
    container: document.getElementById('editor-page')
  });

  const guiContainer = gui.domElement;
  guiContainer.style.position = 'absolute';
  guiContainer.style.right = '10px';
  guiContainer.style.zIndex = '10';
  guiContainer.style.fontFamily = 'input-mono-narrow, monospace';
  guiContainer.style.backgroundColor =  '#252929';
  guiContainer.style.fontSize = '12px';
  guiContainer.classList.add('gui-right');
  guiContainer.classList.add('animate');

  function handleResize() {

    const windowHeight = window.innerHeight;    
    const guiHeight = guiContainer.offsetHeight;
    const maxTop = windowHeight - guiHeight - 20;
    
    guiContainer.style.top = Math.min(450, maxTop) + 'px';
  }

  handleResize();
  window.addEventListener('resize', handleResize);


  gui.addColor(guiSettings, 'modelColor').name('Model Color').onChange((value) => {
    for (const name of mannequinMaterials) {
      if (materials.materials[name]) {
        const mat = materials.materials[name];
        mat.color.set(value);
        mat.needsUpdate = true;
      }
    }
  });

  for (const materialName in materials.materials) {
    const mat = materials.materials[materialName];

    if (mannequinMaterials.includes(materialName)) {
      mat.color.set(guiSettings.modelColor);
      mat.map = null;
    } else {
      if (mat.map) {
        mat.map.wrapS = THREE.RepeatWrapping;
        mat.map.wrapT = THREE.RepeatWrapping;
        mat.map.repeat.set(1, 1);
      }

      if (mat.bumpMap) {
        mat.bumpMap.wrapS = THREE.RepeatWrapping;
        mat.bumpMap.wrapT = THREE.RepeatWrapping;
        mat.bumpMap.repeat.set(1, 1);
      }
    }

    mat.needsUpdate = true;
  }

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load('./Mannequin/A-pose HP.obj', (object) => {
    console.log(' Mannequin loaded');
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
        child.castShadow = true;
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

      object.position.set(9,0.01,1);
  object.rotation.y= Math.PI/2;
      scene.add(object);
      mannequin = object;
  });
});

const shirtKeywords = [
  "converted_t_shirts_champ",
  "converted_long_sleeve",
  "converted_tank_top_rolling",
  "converted_hoodie_mill"
];

const pantsKeywords = [
  "converted_jeans",
  "converted_pants_adidas",
  "converted_laces_pants_white",
  "converted_shorts_champ",
  "converted_laces_pants_red",
  "converted_shorts_long"
];


function hideAllFromCategory(keywords) {
  if (!mannequin) return;
  mannequin.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(mat => {
        const name = mat.name?.toLowerCase();
        if (name && keywords.some(keyword => name.includes(keyword))) {
          child.visible = false;
          mat.transparent = true;
          mat.needsUpdate = true;
        }
      });
    }
  });
}


function isWearingClothing(keywords) {
  if (!mannequin) return false;
  let worn = false;
  mannequin.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(mat => {
        const name = mat.name?.toLowerCase();
        if (name && keywords.some(keyword => name.includes(keyword)) && child.visible) {
          worn = true;
        }
      });
    }
  });
  return worn;
}


function toggleClothing(targetKeywords, categoryKeywords) {
  if (!mannequin) return;

  const alreadyWorn = isWearingClothing(targetKeywords);

  
  hideAllFromCategory(categoryKeywords);

  if (!alreadyWorn) {
   
    mannequin.traverse(child => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(mat => {
          const name = mat.name?.toLowerCase();
          if (name && targetKeywords.some(keyword => name.includes(keyword))) {
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
  }
}

window.wearShirt = () => toggleClothing(["converted_t_shirts_champ"], shirtKeywords);
window.wearShirt2 = () => toggleClothing(["converted_long_sleeve"], shirtKeywords);
window.wearShirt3 = () => toggleClothing(["converted_tank_top_rolling"], shirtKeywords);
window.wearShirt4 = () => toggleClothing(["converted_hoodie_mill"], shirtKeywords);

window.wearPants = () => toggleClothing(["converted_jeans"], pantsKeywords);
window.wearPants2 = () => toggleClothing(["converted_pants_adidas", "converted_laces_pants_white"], pantsKeywords);
window.wearPants3 = () => toggleClothing(["converted_shorts_champ", "converted_laces_pants_red"], pantsKeywords);
window.wearPants4 = () => toggleClothing(["converted_shorts_long"], pantsKeywords);

  

  
 
 





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
    console.log(' Hat GLB loaded:', gltf.scene);
    const hatObject = gltf.scene;

    hatObject.userData.type = 'hat';
    hatObject.scale.set(0.1094, 0.1, 0.13);
     hatObject.position.set(9, 1.61, 1.04);
    hatObject.rotation.y = Math.PI / 2;
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
 
    hatObject.scale.set(0.905, 0.9, 0.97);
  hatObject.position.set(9.02, 1.60, 1.04);
   hatObject.rotation.y=Math.PI/2;
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


    hatObject.scale.set(0.9, 0.9, 0.8);
    hatObject.position.set(8.97, 1.60, 1.04);
    hatObject.rotation.y=Math.PI/2;
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
    rightShoe.scale.set(0.875, 1.1, 1);
    rightShoe.position.set(8.99, 0.035, 1.26);
    rightShoe.rotation.set(0, -Math.PI / 2 -0.2, 0);


    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
    leftShoe.scale.set(-0.875, 1.1, 1);
    leftShoe.position.set(8.99, 0.035, 0.83);
    leftShoe.rotation.set(0, -Math.PI / 2+0.2, 0); 


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
    rightShoe.scale.set(1 , 1.1, 1.1);
  rightShoe.position.set(8.99, -0.02, 0.825);
    rightShoe.rotation.set(0, Math.PI / 2+0.2, 0);
 
   
   
    const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1, 1.1, 1.1);
     leftShoe.position.set(8.99, -0.02, 1.26);
    leftShoe.rotation.set(0, Math.PI / 2-0.2, 0); 
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
   
   
    rightShoe.scale.set(1.3, 1.2, 1.22);
      rightShoe.position.set(9.01, 0.001, 1.27);
     rightShoe.rotation.set(0, Math.PI / 2-0.2, 0);
   
   const leftShoe = rightShoe.clone();
    leftShoe.userData.type = 'shoes';
     leftShoe.scale.set(1.3, 1.2, 1.22);
    leftShoe.position.set(9.01, 0.001, 0.82);
    leftShoe.rotation.y = -0.2;
    leftShoe.scale.x *= -1;
    leftShoe.rotation.set(0, Math.PI / 2+0.2, 0); 

    scene.add(rightShoe);
    scene.add(leftShoe);
    currentShoeObjects = [rightShoe, leftShoe];
    currentShoesPath = modelPath;
  });
};





function showNotification(message) {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  
  notificationText.textContent = message;
  notification.classList.add('active');
  
  setTimeout(() => {
    notification.classList.remove('active');
  }, 2000);
}

window.saveOutfit = function () {
  if (!mannequin) return;

  const outfitData = {
    parts: [],
    hat: currentHatObject ? {
      path: currentHatPath,
      position: currentHatObject.position.toArray(),
      rotation: currentHatObject.rotation.toArray(),
      scale: currentHatObject.scale.toArray()
    } : null,
    shoes: currentShoeObjects.length > 0 ? currentShoeObjects.map(shoe => ({
      path: currentShoesPath,
      position: shoe.position.toArray(),
      rotation: shoe.rotation.toArray(),
      scale: shoe.scale.toArray()
    })) : []
  };

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      outfitData.parts.push({
        name: child.name,
        visible: child.visible
      });
    }
  });

  localStorage.setItem('savedOutfit', JSON.stringify(outfitData));
  console.log('Outfit saved:', outfitData);
  showNotification('Outfit saved!');
};



window.loadOutfit = function () {
  if (!mannequin) return;

  const savedData = localStorage.getItem('savedOutfit');
  if (!savedData) {
    console.warn('No outfit saved.');
    showNotification('No saved outfit found!');
    return;
  }

  const outfitData = JSON.parse(savedData);

  outfitData.parts.forEach((savedChild) => {
    mannequin.traverse((child) => {
      if (child.isMesh && child.name === savedChild.name) {
        child.visible = savedChild.visible;
      }
    });
  });

  
  if (outfitData.hat) {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(outfitData.hat.path, (gltf) => {
      const hat = gltf.scene;
      hat.userData.type = 'hat';
      hat.position.fromArray(outfitData.hat.position);
      hat.rotation.fromArray(outfitData.hat.rotation);
      hat.scale.fromArray(outfitData.hat.scale);
      scene.add(hat);
      currentHatObject = hat;
      currentHatPath = outfitData.hat.path;
    });
  }

  
  if (outfitData.shoes && outfitData.shoes.length === 2) {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(outfitData.shoes[0].path, (gltf) => {
      const rightShoe = gltf.scene;
      rightShoe.userData.type = 'shoes';
      rightShoe.position.fromArray(outfitData.shoes[0].position);
      rightShoe.rotation.fromArray(outfitData.shoes[0].rotation);
      rightShoe.scale.fromArray(outfitData.shoes[0].scale);

      const leftShoe = rightShoe.clone();
      leftShoe.position.fromArray(outfitData.shoes[1].position);
      leftShoe.rotation.fromArray(outfitData.shoes[1].rotation);
      leftShoe.scale.fromArray(outfitData.shoes[1].scale);

      scene.add(rightShoe);
      scene.add(leftShoe);
      currentShoeObjects = [rightShoe, leftShoe];
      currentShoesPath = outfitData.shoes[0].path;
    });
  }

  console.log('Outfit loaded:', outfitData);
  showNotification('Outfit loaded!');
};



window.randomOutfit = function() {
  const skipNotification = true;
  clearAllClothing(skipNotification);
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

  showNotification('Generated outfit!');
};


window.clearAllClothing = function(skipNotification = false) {
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

      console.log("Outfit cleared.");
   if (!skipNotification) {
    showNotification('Outfit cleared!');
  }
};


let spotlight = null;
let spotlightEnabled = false;

function createSpotlight() {
  if (spotlight) {
    scene.remove(spotlight);
    scene.remove(spotlight.target);
    spotlight = null;
  }
  
  spotlight = new THREE.SpotLight(0xffffff, 8);
  spotlight.position.set(9, 3, -2);
  spotlight.target.position.set(9, 0, 1);
  spotlight.angle = Math.PI / 8; 
  spotlight.penumbra = 0.1; 
  spotlight.decay = 1;
  spotlight.distance = 10;
  spotlight.castShadow = true;
  
  spotlight.shadow.mapSize.width = 2048;
  spotlight.shadow.mapSize.height = 2048;
  spotlight.shadow.camera.near = 0.1;
  spotlight.shadow.camera.far = 10
  spotlight.shadow.focus = 1;
  
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
    
    dirLight.intensity = 0.2;
    hemiLight.intensity = 0.3;
    ambientLight.intensity = 0.2;
  } else {
    if (spotlight) {
      spotlight.visible = false;
    }
    spotlightEnabled = false;
    
    dirLight.intensity = 3;
    hemiLight.intensity = 1.2;
    ambientLight.intensity = 0.5;
  }
  
  const btn = document.querySelector('[onclick="toggleSpotlight()"]');
  if (btn) {
    btn.textContent = spotlightEnabled ? 'Spotlight OFF' : 'Spotlight ON';
  }
};



function showNotification(message) {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  
  notificationText.textContent = message;
  notification.classList.add('active');
  
  setTimeout(() => {
    notification.classList.remove('active');
  }, 2000);
}





// Animation loop
  function animate(time) {
  requestAnimationFrame(animate);


controls.update();
  if (cloudMaterial) {
    cloudMaterial.uniforms.time.value = time * 0.001;
  }

  renderer.render(scene, camera);
}
animate();


  // Responsive resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });


window.Room = function () {
  if (currentBackground === "room") return;

  // Remove beach stuff
  if (sky) scene.remove(sky);
  if (water) scene.remove(water);
  if (bedroomModel) scene.remove(bedroomModel);
  if (sandMesh) scene.remove(sandMesh);
  if (beachScene) scene.remove(beachScene);
  if (rockModel) scene.remove(rockModel);
 if (cloudGroup) scene.remove(cloudGroup);
  if (palmTree) scene.remove(palmTree);
  if (palmTree2) scene.remove(palmTree2);
   if (ground) scene.add(ground);
  // Add room ground
  
scene.background = new THREE.Color(0x333333);
  currentBackground = "room";
};

window.Beach = function () {
  if (currentBackground === "beach") return;
  currentBackground = "beach";

  if (ground) scene.remove(ground);
  if (bedroomModel) scene.remove(bedroomModel);

  

  // Sky setup
  sky = new Sky();
  sky.scale.setScalar(10000);
  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 15;
  skyUniforms['rayleigh'].value = 0.2;
  skyUniforms['mieCoefficient'].value = 0.02;
  skyUniforms['mieDirectionalG'].value = 0.85;

  const sun = new THREE.Vector3();
  const theta = Math.PI * 0.8;
  const phi = Math.PI;
  sun.x = Math.cos(phi) * Math.cos(theta);
  sun.y = Math.sin(theta);
  sun.z = Math.sin(phi) * Math.cos(theta);
  sky.material.uniforms['sunPosition'].value.copy(sun);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.background = pmremGenerator.fromScene(sky).texture;

  // Renderer setup
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;


  const loader = new GLTFLoader();
  loader.load('beach Scene/uploads_files_5954063_beach+scene.glb', function (gltf) {
    beachScene = gltf.scene;

    const bbox = new THREE.Box3().setFromObject(beachScene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const targetSize = 20;
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scaleFactor = targetSize / maxDimension;
    beachScene.scale.setScalar(scaleFactor);
    bbox.setFromObject(beachScene);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    beachScene.position.sub(center);
    beachScene.position.set(6, 0, 1);

    beachScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.name === 'Plane001') {
          child.visible = false;
        }
      }
    });
    scene.add(beachScene);

    // Sand
    const sandTexture = new THREE.TextureLoader().load('beach Scene/SandG_001.jpg');
    const sandBump = new THREE.TextureLoader().load('beach Scene/SandG_001_b.jpg');
    sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
    sandBump.wrapS = sandBump.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(10, 10);
    sandBump.repeat.set(10, 10);

    const sandMaterial = new THREE.MeshPhysicalMaterial({
      map: sandTexture,
      bumpMap: sandBump,
      bumpScale: 0.08,
      roughness: 1.0,
      reflectivity: 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.6,
    });

    const sandGeometry = new THREE.PlaneGeometry(11, 20);
    sandMesh = new THREE.Mesh(sandGeometry, sandMaterial);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.set(7, 0.005, center.z);
    sandMesh.receiveShadow = true;
    scene.add(sandMesh);

    // Sand rock model
    const mtlLoader = new MTLLoader();
    mtlLoader.load('beach Scene/uploads_files_3006167_sand+rock2.mtl', function (materials) {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('beach Scene/uploads_files_3006167_sand+rock2.obj', function (object) {
        rockModel = object;
        rockModel.scale.set(0.5, 0.5, 0.5);
        rockModel.position.set(1, -1, -8);
        rockModel.rotation.y = Math.PI / 6;
        scene.add(rockModel);
      });
    });
const palmLoader = new GLTFLoader();
palmLoader.load('beach Scene/uploads_files_5795644_3D_palm_tree_in_a_sty_0118154444_texture.glb', function(palmGltf) {
   palmTree = palmGltf.scene;


  palmTree.scale.set(2, 5, 2); 
  palmTree.position.set(7, 2, -5); 
  palmTree.rotation.y = Math.PI / 4; 

  
  palmTree.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(palmTree);

   palmTree2 = palmTree.clone(true);
  palmTree2.position.set(5.2, 2, 8); 
  palmTree2.rotation.y = -Math.PI / 6;

  
  palmTree2.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  
  scene.add(palmTree2);


});
   

   

    // Water
    const waterGeometry = new THREE.PlaneGeometry(25, 21);
    const waterNormals = new THREE.TextureLoader().load('./Mannequin/Textures/Water_2_M_Normal.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
    });

    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      sunDirection: dirLight.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x081830,
      distortionScale: 2.5,
      alpha: 0.3,
      transparent: true,
    });

    water.rotation.x = -Math.PI / 2;
    water.position.set(-10, 0.01, 1);
    scene.add(water);

    const sunDirection = new THREE.Vector3().subVectors(sun, water.position).normalize();
    
  });

  // Cloud shader setup
  const cloudVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const cloudFragmentShader = `
    uniform float time;
    varying vec2 vUv;
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
    }
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    void main() {
        vec2 st = vUv * 3.0;
        st.x += time * 0.1;
        float n = noise(st);
        float noiseAlpha = smoothstep(0.4, 0.8, n);
        float dist = distance(vUv, vec2(0.5));
        float radialFade = smoothstep(0.5, 0.2, dist);
        float alpha = noiseAlpha * radialFade;
        vec3 cloudColor = vec3(1.0);
        gl_FragColor = vec4(cloudColor, alpha);
    }
  `;

   cloudMaterial = new THREE.ShaderMaterial({
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 }
    }
  });

  const baseCloudPositions = [
  { x: -35, y: 13, z: -5 },
  { x: -35, y: 14, z: -7 },
  { x: -35, y: 15, z: -30 }
];


const cloudGeometries = [
  new THREE.PlaneGeometry(10, 5),
  new THREE.PlaneGeometry(20, 7),
  new THREE.PlaneGeometry(30, 10),
];

 cloudGroup = new THREE.Group(); 

for (let i = 0; i < baseCloudPositions.length; i++) {
  const base = baseCloudPositions[i];

  
  for (let j = 0; j < 3; j++) {
    const geo = cloudGeometries[Math.floor(Math.random() * cloudGeometries.length)];
    const cloudMesh = new THREE.Mesh(geo, cloudMaterial);

    
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 2;
    const offsetZ = (Math.random() - 0.5) * 10;

    cloudMesh.position.set(
      base.x + offsetX,
      base.y + offsetY,
      base.z + offsetZ
    );

    cloudMesh.rotation.y = Math.PI / 2; 
    cloudMesh.renderOrder = 1; 
    cloudGroup.add(cloudMesh);
  }
}

scene.add(cloudGroup);
};
  window.Bedroom = function () {
  if (currentBackground === 'bedroom') return;
  currentBackground = 'bedroom';

  
  if (ground) scene.remove(ground);
  if (beachScene) scene.remove(beachScene);
  if (sandMesh) scene.remove(sandMesh);
  if (rockModel) scene.remove(rockModel);
  if (water) scene.remove(water);
  if (sky) scene.remove(sky);
  if (cloudGroup) scene.remove(cloudGroup);
  if (palmTree) scene.remove(palmTree);
  if (palmTree2) scene.remove(palmTree2);
  

  
  if (bedroomModel) scene.remove(bedroomModel);
  if (scene.userData.bedroomLight) scene.remove(scene.userData.bedroomLight);
  if (scene.userData.bedroomCeiling) scene.remove(scene.userData.bedroomCeiling);


  const gltfLoader = new GLTFLoader();
  gltfLoader.load('Bed Scene/bedroom.glb', (gltf) => {
    bedroomModel = gltf.scene;
    bedroomModel.scale.set(1.4, 1.4, 1.4);
    bedroomModel.position.set(7, 0.1, -1);
    bedroomModel.rotation.y =Math.PI /2;
    scene.add(bedroomModel);
  });

  
  scene.background = new THREE.Color(0x2a2a2a);
  light.intensity = 0.2;
  dirLight.intensity = 0.1;

  const ceilingLight = new THREE.SpotLight(0xffffff, 1);
  ceilingLight.position.set(0, 5, 0);
  ceilingLight.target.position.set(0, 0, 0);
  ceilingLight.target.updateMatrixWorld();
  ceilingLight.angle = Math.PI / 3;
  ceilingLight.penumbra = 0.4;
  ceilingLight.decay = 1;
  ceilingLight.distance = 12;
  ceilingLight.castShadow = true;
  scene.add(ceilingLight);
  scene.add(ceilingLight.target);
  scene.userData.bedroomCeiling = ceilingLight;

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
  fillLight.position.set(2, 2, 1);
  scene.add(fillLight);
  scene.userData.bedroomLight = fillLight;

  
  
};

}

