import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

class Model extends THREE.Group {
  constructor() {
    super();

    const loader = new GLTFLoader();
    loader.load(
      "/bugati_divo.glb",
      (gltf: GLTF) => {
        const car = gltf.scene;
        car.scale.set(0.1, 0.1, 0.1);
        car.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                          });
          }
        });
        this.add(car);
      },
      undefined,
      (error: any) => {
        console.error("Error loading model:", error);
      }
    );
    // this.position.y = pos;
  }
}

export default Model;
