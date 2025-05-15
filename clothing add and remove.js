const clothingItems = {
  head: {},
  torso: {},
  bottom: {},
  feet: {}
};

const clothingGroups = {
  head: new THREE.Group(),
  torso: new THREE.Group(),
  bottom: new THREE.Group(),
  feet: new THREE.Group()
};

loader.load('Example', (gltf) => {
  model = gltf.scene;
  scene.add(model);

  for (let part in clothingGroups) {
    model.add(clothingGroups[part]);
  }
});

function loadClothingItem(part, name, path) {
  loader.load(path, (gltf) => {
    const item = gltf.scene;
    item.visible = false;
    clothingItems[part][name] = item;
    clothingGroups[part].add(item);
  });
}

function wearClothing(part, name) {
  for (const item in clothingItems[part]) {
    clothingItems[part][item].visible = false;
  }
  clothingItems[part][name].visible = true;
}