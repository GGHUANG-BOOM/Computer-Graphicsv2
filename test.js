import * as THREE from './three.module.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { GLTFLoader } from './GLTFLoader.js';
//import { mannequincontrols } from './mannequincontrols.js';
import { Water } from './objects/Water2.js';
import { Sky } from './objects/Sky.js';
import {GUI}  from './lil-gui.module.min.js';

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

let sky, water, sandMesh, ground;
let cloudMaterial;
let beachScene, rockModel;
let cloud, cloud2, cloud3;
let currentBackground = "room";

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
 

  const cameraPositions = {
    default: {
      position: new THREE.Vector3(11.8, 1.34, 1.52),
      target: new THREE.Vector3(0, 0, 0)
    },
    shirts: {
      position: new THREE.Vector3(11, 1.34, 1.52),
      target: new THREE.Vector3(0, 1.5, 0)
    },
    pants: {
      position: new THREE.Vector3(11, 1, 1.52),
      target: new THREE.Vector3(0, 0.5, 0)
    },
    hats: {
      position: new THREE.Vector3(10.5, 2, 1.52),
      target: new THREE.Vector3(0, 0.5, 0)
    },
    shoes: {
      position: new THREE.Vector3(10.5, 0.2, 1.52),
      target: new THREE.Vector3(0, 0, 0)
    }
  };

  camera.position.copy(cameraPositions.default.position);
  controls.target.copy(cameraPositions.default.target);
  controls.update();

  window.moveCameraToPosition = function(positionKey, duration = 1000) {
    const targetPosition = cameraPositions[positionKey].position;
    const targetLookAt = cameraPositions[positionKey].target;
    
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = Date.now();

    function updateCamera() {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = progress * (2 - progress);

      camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
      controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(updateCamera);
      }
    }

    updateCamera();
  }

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
  guiContainer.style.top = '700px';
  guiContainer.style.right = '10px';
  guiContainer.style.zIndex = '10';
  guiContainer.style.fontFamily = 'input-mono-narrow, monospace';
  guiContainer.style.backgroundColor =  '#252929';
  guiContainer.style.fontSize = '12px';
  guiContainer.classList.add('gui-right');
  guiContainer.classList.add('animate');

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

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const savedChild = outfitData.find(item => item.name === child.name);
      if (savedChild) {
        child.visible = savedChild.visible;
      }
    }
  });

  console.log('Outfit loaded:', outfitData);
  showNotification('Outfit loaded!');
};

window.clearOutfit = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.name && isClothing(mat.name)) {
          child.visible = false;
        }
      });
    }
  });

  console.log("Outfit cleared.");
  showNotification('Outfit cleared!');
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

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const savedChild = outfitData.find(item => item.name === child.name);
      if (savedChild) {
        child.visible = savedChild.visible;
      }
    }
  });

  console.log('Outfit loaded:', outfitData);
  showNotification('Outfit loaded!');
};

window.clearOutfit = function () {
  if (!mannequin) return;

  mannequin.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat.name && isClothing(mat.name)) {
          child.visible = false;
        }
      });
    }
  });

  console.log("Outfit cleared.");
  showNotification('Outfit cleared!');
};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let isDragging = false;
let prevX = 0;
let canRotate = false; 

renderer.domElement.addEventListener('mousedown', (event) => {
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  
  const intersects = raycaster.intersectObject(mannequin, true);

  if (intersects.length > 0) {
    canRotate = true;
    isDragging = true;
    prevX = event.clientX;
  }
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
  canRotate = false;
});

renderer.domElement.addEventListener('mousemove', (event) => {
  if (isDragging && canRotate && mannequin) {
    const deltaX = event.clientX - prevX;
    mannequin.rotation.y += deltaX * 0.01;
    prevX = event.clientX;
  }
});

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
  if (sandMesh) scene.remove(sandMesh);
  if (beachScene) scene.remove(beachScene);
  if (rockModel) scene.remove(rockModel);
  if (cloud) scene.remove(cloud);
  if (cloud2) scene.remove(cloud2);
  if (cloud3) scene.remove(cloud3);
   if (ground) scene.add(ground);
  // Add room ground
  
scene.background = new THREE.Color(0x333333);
  currentBackground = "room";
};

window.Beach = function () {
  if (currentBackground === "beach") return;
  currentBackground = "beach";

  if (ground) scene.remove(ground);
  

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

  // Load beach GLB scene
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

   

   

    // Water
    const waterGeometry = new THREE.PlaneGeometry(25, 25);
    const waterNormals = new THREE.TextureLoader().load('Textures/Water_2_M_Normal.jpg', function (texture) {
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
    water.material.uniforms['sunDirection'].value.copy(sunDirection);
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

  const cloudGeometry = new THREE.PlaneGeometry(10, 5);
  const cloudGeometry2 = new THREE.PlaneGeometry(30, 10);
  cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloud2 = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloud3 = new THREE.Mesh(cloudGeometry2, cloudMaterial);

  cloud.rotation.y = Math.PI / 2;
  cloud.position.set(-35, 13, -5);
  cloud2.rotation.y = Math.PI / 2;
  cloud2.position.set(-35, 14, -7);
  cloud3.position.set(-35, 15, -30);
  cloud3.rotation.y = Math.PI / 2;
  scene.add(cloud);
  scene.add(cloud2);
  scene.add(cloud3);
};
  
}

