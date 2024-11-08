import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { threeContainer, web3DObj } from "./Experience";
import Model from "./Model";

class Web3D {
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    textureLoader: THREE.TextureLoader | null;
    gltfLoader: GLTFLoader | null;
    //loadingManager: THREE.LoadingManager | null;
    //dirLight: THREE.DirectionalLight | null;
    dirLight2: THREE.DirectionalLight | null;
    ambientLight: THREE.AmbientLight | null;
    orbitController: OrbitControls | null;
    canvasW: number;
    canvasH: number;
    modelRoot: THREE.Group | null;
    dracoLoader: DRACOLoader | null;
    spotLight: THREE.SpotLight | null;

    constructor() {
        threeContainer.current = document.getElementById("3d-container");
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textureLoader = null;
        this.gltfLoader = null;
        this.dracoLoader = null;
        this.spotLight = null;
        this.dirLight2 = null;
        this.ambientLight = null;
        this.orbitController = null;
        this.canvasW = 0;
        this.canvasH = 0;
        this.modelRoot = null;
        web3DObj.current = this;
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfdfdfd);

        // Add light to the scene
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.position.set(10, 10, 10);
        this.scene.add(this.spotLight);

        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.5, 6.5);

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        // Append renderer to the DOM
        threeContainer.current?.appendChild(this.renderer.domElement);

        // Initialize OrbitControls
        this.orbitController = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitController.enableDamping = true;
        this.orbitController.dampingFactor = 0.1;

        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('../node_modules/three/examples/jsm/libs/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        // Create a car model (from Model component)
        const car = new Model();
        this.scene.add(car);

        // Create an animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            this.orbitController?.update();
            this.renderer?.render(this.scene as THREE.Scene, this.camera as THREE.PerspectiveCamera);
        };

        animate();

        // Handle window resizing
        const handleResize = () => {
            this.renderer?.setSize(window.innerWidth, window.innerHeight);
            if (this.camera) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
            }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("resize", handleResize);
            if (threeContainer.current && this.renderer) {
                threeContainer.current.removeChild(this.renderer.domElement);
            }
        };
    }

    openProject() {
        const openProject = document.createElement("input");
        openProject.id = "project-input";
        openProject.type = "file";
        openProject.style.cssText = "width: 0px; height: 0px; visibility: hidden";

        openProject.onchange = (event: Event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file : any = files.item(0);
                const extension = file?.name.split('.').pop()?.toLowerCase();

                if (extension === "gltf" || extension === "glb") {
                    const url = URL.createObjectURL(file);
                    this.readGLTF(url);
                }
            }
            (event.target as HTMLInputElement).value = "";
        };

        openProject.click();
    }

    readGLTF(path: string) {
        if (!this.gltfLoader) return;

        this.gltfLoader.load(
            path,
            (gltf) => {
                const object = gltf.scene;
                const parentObject = new THREE.Object3D();
                while (object.children.length > 0) {
                    parentObject.add(object.children[0]);
                }
                parentObject.children = parentObject.children.filter((obj) => {
                    if (obj.name === "Camera" && this.camera) {
                        this.camera.position.copy(obj.position);
                        this.camera.rotation.copy(obj.rotation);
                        this.camera.scale.copy(obj.scale);
                        this.camera.quaternion.copy(obj.quaternion);
                        return false;
                    }
                    return true;
                });

                parentObject.traverse((mesh) => {
                    if (mesh instanceof THREE.Mesh) {
                        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        materials.forEach((material) => {
                            material.depthWrite = true;
                            material.needsUpdate = true;
                        });
                    }
                });

                // this.onSceneLoad(path, parentObject);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error occurred:', error);
            }
        );
    }
}

export default Web3D;
