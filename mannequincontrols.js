
import * as THREE from 'three';

export class mannequincontrols {
  constructor(camera, renderer, mannequin) {
    this.camera = camera;
    this.renderer = renderer;
    this.mannequin = mannequin;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.isDragging = false;
    this.prevX = 0;
    this.canRotate = false;

    this.initListeners();
  }

  initListeners() {
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseDown(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.mannequin, true);

    if (intersects.length > 0) {
      this.canRotate = true;
      this.isDragging = true;
      this.prevX = event.clientX;
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.canRotate = false;
  }

  onMouseMove(event) {
    if (this.isDragging && this.canRotate && this.mannequin) {
      const deltaX = event.clientX - this.prevX;
      this.mannequin.rotation.y += deltaX * 0.01;
      this.prevX = event.clientX;
    }
  }
}
