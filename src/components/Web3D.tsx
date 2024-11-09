import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { threeContainer, web3DObj } from "./Experience";
import Model from "./Model";
import { CameraControls } from "./CameraControls";
import TWEEN, { Easing, Group, Tween } from '@tweenjs/tween.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


class Web3D {
    scene: any | null;
    camera: any | null;
    renderer: any | null;
    textureLoader: any | null;
    objLoader: any | null;
    gltfLoader: any | null;
    //loadingManager: THREE.LoadingManager | null;
    //dirLight: THREE.DirectionalLight | null;
    dirLight2: any | null;
    ambientLight: any | null;
    controls: any | null;
    canvasW: any;
    canvasH: any;
    sceneObject: any | null;
    dracoLoader: any | null;
    spotLight: any | null;
    modelBoundingBox: any | null;
    sceneBoundingBox: any | null;
    cameraPosX : any | null;
    cameraPosY : any | null;
    cameraPosZ : any | null;
    cameraRotX : any | null;
    cameraRotY : any | null;
    cameraRotZ : any | null;
    currentRenderMode: any | null;
    frameId : any | null;
    originalWidth : any | null;
    originalHeight: any | null;
    alreadyBinned: any | null;
    AMBIENT_COLOR: any | null;
    SPOTLIGHT_COLOR: any | null;
    SPOTLIGHT_INTENSITY:  any | null;
    projector: any | null;
    composer : any | null;
    clock: any | null;
    edgeEffect: any|null;
    ssrComposer : any|null;
    toggleEdges : any|null;
    MODE_WIREFRAME : any|null;
    MODE_TRANSPARENT : any|null;
    MODE_SHADED : any|null;
    VIEW_ISOMETRIC : any|null;
    VIEW_TOP : any|null;
    VIEW_LEFT : any|null;
    VIEW_BOTTOM : any|null;
    VIEW_RIGHT : any|null;
    edgeOccluder : any|null;
    edgesHelpers : any|null;
    firstWireframe : any|null;
    showBoundingBox : any|null;
    sceneBoundingBoxIndicator : any|null;
    extension : any|null;
    TWEEN : any|null;
    mouse : any|null;

    constructor() {
        threeContainer.current = document.getElementById("3d-container");
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textureLoader = null;
        this.objLoader == null;
        this.gltfLoader = null;
        this.dracoLoader = null;
        this.spotLight = null;
        this.dirLight2 = null;
        this.ambientLight = null;
        this.controls = null;
        this.canvasW = 0;
        this.canvasH = 0;
        this.sceneObject = null;
        this.modelBoundingBox = null;
        this.sceneBoundingBox = null;
        this.cameraPosX = 0,
        this.cameraPosY = 0,
        this.cameraPosZ = 0,
        this.cameraRotX = 0,
        this.cameraRotY = 0,
        this.cameraRotZ = 0,
        this.currentRenderMode = 0;
        this.frameId = null;
        this.originalWidth = null;
        this.originalHeight = null;
        this.alreadyBinned = null;
        this.AMBIENT_COLOR = 0x303030,
        this.SPOTLIGHT_COLOR = 0xFFFFFF,
        this.SPOTLIGHT_INTENSITY = 1,
        this.projector = null;
        this.clock = null;
        this.composer = null;
        this.ssrComposer = null;
        this.toggleEdges = false,
        this.MODE_SHADED = 0,
        this.MODE_WIREFRAME = 1,
        this.MODE_TRANSPARENT = 2,
        this.VIEW_ISOMETRIC = 0,
        this.VIEW_TOP = 1,
        this.VIEW_LEFT = 2,
        this.VIEW_BOTTOM = 3,
        this.VIEW_RIGHT = 4,
        this.edgeOccluder = null;
        this.edgesHelpers = [],
        this.firstWireframe = 1,
        this.showBoundingBox = false,
        this.sceneBoundingBoxIndicator = null,
        this.extension = null;
        this.TWEEN = null;
        this.mouse = null

        web3DObj.current = this;
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfdfdfd);
       
        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200000);
        this.camera.position.z = 60;
        this.camera.position.y = 60;
        this.camera.position.x = 60;
        this.scene.add(this.camera);

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,                // not much difference if enabled
            alpha: true,
            stencil: false,
            logarithmicDepthBuffer: true//by me
        });
        
        this.renderer.autoClear = false;
       
        //this.renderer.shadowMap.enabled = true;
        var self = this;
        this.renderer.domElement.addEventListener("webglcontextlost", function (e : any) {
            // context is lost
           // console.log("Error in CDS CAD viewer: context is lost, cancelling animation frame " + self.frameId);
            e.preventDefault();
            cancelAnimationFrame(self.frameId);
            window.location.reload();
        }, false);
        this.renderer.domElement.addEventListener("webglcontextrestored", function (e :any) {
            // context is restored
            //console.log("Warning in CDS CAD viewer: context is restored " + e);
            e.preventDefault();
        }, false);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
         // Append renderer to the DOM
         threeContainer.current?.appendChild(this.renderer.domElement);

        // Add light to the scene
        this.ambientLight = new THREE.AmbientLight(this.AMBIENT_COLOR, 15);
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.SpotLight(this.SPOTLIGHT_COLOR, this.SPOTLIGHT_INTENSITY);
        this.scene.add(this.spotLight);
        this.camera.add(this.spotLight);
        this.spotLight.position.set(190, 190, 165);
        this.spotLight.target.position.set(0, 0, -1);

        // Initialize OrbitControls
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;

        this.objLoader = new OBJLoader();

        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('../node_modules/three/examples/jsm/libs/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        //this.projector = new Projector();

        this.TWEEN = new Group();
        this.animate = this.animate.bind(this);

        this.clock = new THREE.Clock();
        this.composer = new EffectComposer(this.renderer);
        // this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

      /*   this.edgeEffect = new ShaderPass(THREE.EdgeShader);
        this.edgeEffect.renderToScreen = true;
        this.edgeEffect.enabled = false;
        this.composer.addPass(this.edgeEffect); */
       // var reflections = new Reflections();
       // this.ssrComposer = reflections.addReflections(this.scene, this.camera, this.renderer);
       this.mouse = new THREE.Vector2();
       this.mouse.x = 0;
       this.mouse.y = 0;

       this.animate(0);

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
    
    // Create an animation loop
    animate(time: number) {
        this.frameId = requestAnimationFrame(this.animate);

        // Update controls and the tween group with the current time
        this.controls.update();
        this.TWEEN.update(time); // Replace TWEEN.update(time) with this.tweenGroup.update(time)
        
        // Render the scene with the camera
        this.renderer?.render(this.scene as THREE.Scene, this.camera as THREE.PerspectiveCamera);
    }
    
    

    openProject() {
        const openProject = document.createElement("input");
        openProject.id = "project-input";
        openProject.type = "file";
        openProject.style.cssText = "width: 0px; height: 0px; visibility: hidden";

        openProject.onchange = (event: Event) => {
            this.closeScene();
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file : any = files.item(0);
                this.extension = file?.name.split('.').pop()?.toLowerCase();

                if (this.extension === "gltf" || this.extension === "glb") {
                    const url = URL.createObjectURL(file);
                    this.readGLTF(url);
                }
                else if(this.extension === "obj" ){
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
if(this.extension === "gltf" || this.extension === "glb" ){
    this.gltfLoader.load(
        path,
        (gltf : any) => {
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

            parentObject.traverse((child : any) => {
                if (child.type == "Mesh" && child.geometry) {
                    let geomEdges = new THREE.EdgesGeometry(child.geometry, 30);
                    let geomLines = new THREE.LineSegments(geomEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
                    geomLines.name = "edgeGeometry";
                    geomLines.visible = this.toggleEdges;
                    child.add(geomLines);
                }
            })

            parentObject.traverse((mesh) => {
                if (mesh instanceof THREE.Mesh) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach((material) => {
                        material.depthWrite = true;
                        material.needsUpdate = true;
                        material.needsUpdate = true
                    });
                }
            });

             this.onSceneLoad(path, parentObject);
        },
        (xhr : any) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error  :any) => {
            console.error('An error occurred:', error);
        }
    );
}
else if(this.extension === "obj" ){
    this.objLoader.load(
        path,
        (obj : any) => {
            const object = obj;
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

            parentObject.traverse((child : any) => {
                if (child.type == "Mesh" && child.geometry) {
                    let geomEdges = new THREE.EdgesGeometry(child.geometry, 30);
                    let geomLines = new THREE.LineSegments(geomEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
                    geomLines.name = "edgeGeometry";
                    geomLines.visible = this.toggleEdges;
                    child.add(geomLines);
                }
            })

            parentObject.traverse((mesh) => {
                if (mesh instanceof THREE.Mesh) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach((material) => {
                        material.depthWrite = true;
                        material.needsUpdate = true;
                        material.needsUpdate = true
                    });
                }
            });

             this.onSceneLoad(path, parentObject);
        },
        (xhr : any) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error  :any) => {
            console.error('An error occurred:', error);
        }
    );
}
        
    }

    onSceneLoad(fileName : any, tempScene: any) {
        try {

           // this.isLoading = false;
            var object = new THREE.Object3D();

            while (tempScene.children.length > 0) {
                object.add(tempScene.children[0]);
            }

            if (tempScene instanceof THREE.Mesh) {
                object.add(tempScene);
            }

            this.controls.reset();
            this.sceneObject = object;
            this.sceneObject.userData = tempScene.userData;
            tempScene = null;


            this.scene.add(this.sceneObject);
            this.setCameraParams();
           this.setRenderMode(this.currentRenderMode);
           this.animate(0);
            //this.render();

            this.modelBoundingBox = new THREE.Box3().setFromObject(this.sceneObject);

        } catch (e) {
            console.log("Error loading model in CDS CAD viewer: " + e);

        } finally {

          

            //this.isLoading = false;
           /*  if (!this.showPercentLoader) {
                if (this.loadingIcon)
                    this.loadingIcon.style.display = "none";
                document.getElementById("error-message").style.display = "none";
            } */
            // this.loadingIcon.style.display = "none";
            this.controls.enabled = true;
            //delete this.readJSONFile;
           

            this.originalWidth = Number.MAX_VALUE;
            this.originalHeight = Number.MAX_VALUE;
            this.alreadyBinned = false;

            if (this.alreadyBinned === false) {
                this.alreadyBinned = true;
                this.originalWidth = this.renderer.domElement.offsetWidth;
                this.originalHeight = this.renderer.domElement.offsetHeight;
            }
           // this.postLoadSceneCallback(); 
        }
    }

    setCameraParams() {
        
        var box = this.sceneObject.userData.boundingBox;
        var cameraControls = new CameraControls();
        if (box != undefined) {
            this.changeCameraTransform(new THREE.Box3().setFromObject(this.sceneObject));
            this.sceneBoundingBox = new THREE.Box3().setFromObject(this.sceneObject);;
            this.centerCamera();
        } else {
            this.sceneBoundingBox = new THREE.Box3().setFromObject(this.sceneObject);
            var scale = this.scaleObject(this.sceneBoundingBox);
            this.sceneObject.scale.set(scale, scale, scale);
            this.centerObject(this.sceneObject);
        }
        //cameraControls.setZoomLimits();	
        cameraControls.storeCameraPosition();
    }

    changeCameraTransform(jsonBoundingBox : any) {
        var boundingBox = null;
        var oldBoundingBox = null;
        if (jsonBoundingBox.min instanceof THREE.Vector3) {
            boundingBox = jsonBoundingBox;
            oldBoundingBox = jsonBoundingBox;
        } else {
            boundingBox = this.convertBoundingBox(jsonBoundingBox);
            oldBoundingBox = this.convertBoundingBox(jsonBoundingBox);
        }
        var scaleFactor = this.scaleObject(boundingBox);
        var scaledBoundingBox = this.createScaledBoundingBox(scaleFactor, boundingBox);
        let vectTarget = new THREE.Vector3();
        scaledBoundingBox.getCenter(vectTarget);
        var adjacent = scaledBoundingBox.max.x - vectTarget.x;
        var opposite = this.camera.position.z;
        var angle = Math.atan(opposite / adjacent);

        let vectTarget1 = new THREE.Vector3();
        oldBoundingBox.getCenter(vectTarget1);
        var adjacent = oldBoundingBox.max.x - vectTarget1.x;
        var cameraDistance = Math.tan(angle) * adjacent;
        this.camera.position.set(cameraDistance, cameraDistance, cameraDistance);

    }

    convertBoundingBox(boundingBox : any) {
        var bbox = new THREE.Box3()
        bbox.min = new THREE.Vector3(boundingBox.min[0],
            boundingBox.min[1],
            boundingBox.min[2])

        bbox.max = new THREE.Vector3(boundingBox.max[0],
            boundingBox.max[1],
            boundingBox.max[2])

        return bbox;
    }

    scaleObject(boundingBox : any) {

        var xDimension = boundingBox.max.x - boundingBox.min.x;
        var yDimension = boundingBox.max.y - boundingBox.min.y;
        var zDimension = boundingBox.max.z - boundingBox.min.z;

        var maxOfXY = Math.max(xDimension, yDimension);
        var lengthOfLargestDimension = Math.max(maxOfXY, zDimension);
        var scaleFactor = 1 / lengthOfLargestDimension * 60;
        return scaleFactor;
    }

    createScaledBoundingBox(scaleFactor : any, boundingBox: any) {
        var newBox = new THREE.Box3();

        newBox.min.x = scaleFactor * boundingBox.min.x;
        newBox.min.y = scaleFactor * boundingBox.min.y;
        newBox.min.z = scaleFactor * boundingBox.min.z;

        newBox.max.x = scaleFactor * boundingBox.max.x;
        newBox.max.y = scaleFactor * boundingBox.max.y;
        newBox.max.z = scaleFactor * boundingBox.max.z;

        return newBox;
    }

    centerCamera() {
        let boxCenter = new THREE.Vector3();
        this.sceneBoundingBox.getCenter(boxCenter);
        var centerX = boxCenter.x;
        var centerY = boxCenter.y;
        var centerZ = boxCenter.z;
        var matrix = new THREE.Matrix4();
        this.camera.updateMatrix();
        matrix.makeTranslation(-centerX, -centerY, -centerZ);
        matrix.invert();
        this.controls.target.copy(boxCenter);
        this.camera.applyMatrix4(matrix);
    }

    centerObject(object : any) {

        var box = this.sceneBoundingBox;
        var centerX = (box.max.x + box.min.x) / 2.0 *
            object.scale.x;
        var centerY = (box.max.y + box.min.y) / 2.0 *
            object.scale.y;
        var centerZ = (box.max.z + box.min.z) / 2.0 *
            object.scale.z;
        var to = new THREE.Vector3(-centerX, -centerY, -centerZ);
        new TWEEN.Tween(object.position).to({
            x: to.x,
            y: to.y,
            z: to.z
        }, 500).easing(TWEEN.Easing.Linear.None).start();
        object.position.set(-centerX, -centerY, -centerZ);
    }

    setRenderMode(mode  :any) {
        if (this.sceneObject) {

            if (mode === this.currentRenderMode) {
                return;
            }

            switch (mode) {
                case this.MODE_SHADED:
                    this.currentRenderMode = mode;
                    this.setObjectMaterialDepthAndSide(this.sceneObject, true, true, THREE.FrontSide);
                    this.setObjectOpacity(this.sceneObject, 1.0, false);
                    this.removeWireframe();
                    break;

                case this.MODE_TRANSPARENT:
                    this.currentRenderMode = mode;
                    this.setObjectMaterialDepthAndSide(this.sceneObject, false, false, THREE.FrontSide);
                    this.setObjectOpacity(this.sceneObject, 0.5, true);
                    this.removeWireframe();
                    break;

                case this.MODE_WIREFRAME:
                    this.currentRenderMode = mode;
                    this.setObjectMaterialDepthAndSide(this.sceneObject, true, true, THREE.FrontSide);
                    this.setObjectOpacity(this.sceneObject, 1.0, false);
                    this.renderWireframe();
                    break;

                default:
                    console.log("Error in CDS CAD viewer: invalid render mode " + mode);
                    break;
            }
        }
    }

    setObjectMaterialDepthAndSide(object :any, depthTest:any, depthWrite:any, side:any) {

        if (object instanceof THREE.Object3D) {
            object.traverse(function (mesh :any) {
                if (mesh instanceof THREE.Mesh) {
                    if (mesh.material.length != undefined) {
                        for (var i = 0; i < mesh.material.length; i++) {
                            if (mesh.material[i]) {

                                if (mesh.parent?.type != "Group") {
                                    mesh.material[i].side = THREE.FrontSide;
                                }
                                mesh.material[i].depthTest = depthTest;
                                mesh.material[i].depthWrite = depthWrite;
                            }
                        }
                    } else {
                        if (mesh.material) {

                            if (mesh.parent?.type != "Group") {
                                mesh.material.side = THREE.FrontSide;
                            }
                            mesh.material.depthTest = depthTest;
                            mesh.material.depthWrite = depthWrite;
                        }
                    }

                }
            });
        }
    }
    
    setObjectOpacity(object:any, opacity:any, isTransparent:any) {
        "use strict";
        if (object instanceof THREE.Object3D) {
            object.traverse(function (mesh :any) {
                if (mesh instanceof THREE.Mesh) {
                    for (var i = 0; i < mesh.material.length; i++) {
                        if (isTransparent === true) {
                            mesh.material[i].opacity = opacity;
                            mesh.material[i].transparent = isTransparent;
                            mesh.material[i].needsUpdate = true;
                        } else if (isTransparent === false) {
                            mesh.material[i].opacity = mesh.material[i].userData.initialOpacity;
                            mesh.material[i].transparent = mesh.material[i].userData.initialtransparent;
                            mesh.material[i].needsUpdate = true;
                        }
                    }
                } else if (object instanceof THREE.Object3D) {
                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            if (child.material) {
                                child.material.transparent = isTransparent;
                                child.material.opacity = opacity;
                                child.material.needsUpdate = true;
                            }
                        }

                    });
                } else {
                    if (mesh.material) {
                        mesh.material.transparent = isTransparent;
                        mesh.material.opacity = opacity;
                        mesh.material.needsUpdate = true;
                    }
                }
            });
        }
    }

    removeWireframe() {

        this.removeEdgesHelpers();
        var i;
var self = this
        if (this.sceneObject instanceof THREE.Object3D) {
            this.edgeEffect.enabled = false;
            this.sceneObject.traverse(function (mesh) {
                if (mesh instanceof THREE.Mesh) {
                    mesh.visible = true;
                    self.firstWireframe = 2;
                    for (i = 0; i < mesh.children.length; i++) {
                        mesh.children[i].visible = false;
                    }
                }
            });
        }

        if (this.showBoundingBox) {
            this.sceneBoundingBoxIndicator.traverse(function (obj :any) {
                if (obj instanceof THREE.Object3D) {
                    obj.traverse(function (mesh) {
                        if (mesh instanceof THREE.Mesh || mesh instanceof THREE.Line) {
                            if (mesh.material.length != undefined) {
                                for (var i = 0; i < mesh.material.length; i++) {
                                    if (mesh.material[i]) {
                                        mesh.material[i].depthTest = true;
                                        mesh.material[i].depthWrite = true;
                                        mesh.material[i].transparent = false;
                                        mesh.material[i].side = THREE.FrontSide;
                                        mesh.material[i].polygonOffset = true;
                                        mesh.material[i].polygonOffsetFactor = 0.2;
                                        mesh.material[i].polygonOffsetUnits = 1.0;
                                    }
                                }
                            } else {
                                if (mesh.material) {
                                    mesh.material.depthTest = true;
                                    mesh.material.depthWrite = true;
                                    mesh.material.transparent = false;
                                    mesh.material.side = THREE.FrontSide;
                                    mesh.material.polygonOffset = true;
                                    mesh.material.polygonOffsetFactor = 0.2;
                                    mesh.material.polygonOffsetUnits = 1.0;
                                }
                            }
                        }
                    });
                }
            });
        }
    }

    removeEdgesHelpers() {

        if (this.edgeOccluder !== null) {
            this.scene.remove(this.edgeOccluder);
            this.edgeOccluder = null;
        }

        var self = this;
        this.edgesHelpers.forEach(function (eh  :any) {
            if (eh instanceof THREE.Object3D) {
                eh.traverse(function (mesh) {
                    if (mesh instanceof THREE.Mesh) {
                        mesh.geometry.dispose();
                        if (mesh.material.length != undefined) {
                            for (var i = 0; i < mesh.material.length; i++) {
                                if (mesh.material[i]) {
                                    if (mesh.material[i].map) {
                                        mesh.material[i].map.dispose();
                                    }
                                    mesh.material[i].dispose();
                                }
                            }
                        } else {
                            if (mesh.material) {
                                if (mesh.material.map) {
                                    mesh.material.map.dispose();
                                }
                                mesh.material.dispose();
                            }
                        }
                    }
                });
                self.scene.remove(eh);
            }
        });

        this.edgesHelpers.length = 0;
    }


    renderWireframe() {

        this.removeEdgesHelpers();

        var self = this;
        var geo, mat, wireframe;

        if (this.sceneObject instanceof THREE.Object3D) {
            this.sceneObject.traverse(function (mesh) {
                if (mesh instanceof THREE.Mesh) {
                    if (mesh.material.length != undefined) {
                        for (var i = 0; i < mesh.material.length; i++) {
                            if (mesh.material[i]) {
                                mesh.material[i].side = THREE.DoubleSide;
                            }
                        }
                    } else {
                        if (mesh.material) {
                            mesh.material.side = THREE.DoubleSide;
                        }
                    }
                    geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
                    mat = new THREE.LineBasicMaterial({ color: 0x3D3D3D, linewidth: 1 });
                    wireframe = new THREE.LineSegments(geo, mat);
                    if (self.firstWireframe == 1)
                        mesh.add(wireframe);
                    for (var i = 0; i < mesh.children.length; i++) {
                        mesh.children[i].visible = true;
                    }
                    mesh.visible = false;
                    self.edgesHelpers.push(mesh.children[0]);
                }
            });

            this.edgeEffect.enabled = true;
            this.createEdgeOccluder();
        }
    }

    createEdgeOccluder() {

        if (this.edgeOccluder) {
            this.scene.remove(this.edgeOccluder);
        }

        this.edgeOccluder = this.sceneObject.clone();
        this.edgeOccluder.traverse(function (mesh : any) {
            if (mesh instanceof THREE.Mesh) {
                mesh.visible = true;
                if (mesh.material) {
                    mesh.material = new THREE.MeshBasicMaterial({ "color": 0xffffff });
                    mesh.material.opacity = 0.05;
                    mesh.material.polygonOffset = true;
                    mesh.material.polygonOffsetFactor = 0.2;
                    mesh.material.polygonOffsetUnits = 1.0;
                }
            }
        });
        //this.edgeOccluder.scale = this.edgeOccluder.scale.multiplyScalar(0.994);
        this.edgeOccluder.scale.set(this.edgeOccluder.scale.x * 0.994, this.edgeOccluder.scale.y * 0.994, this.edgeOccluder.scale.z * 0.994);//by me
        this.scene.add(this.edgeOccluder);
        if (this.showBoundingBox) {
            this.sceneBoundingBoxIndicator.traverse(function (obj:any) {
                if (obj instanceof THREE.Object3D) {
                    obj.traverse(function (mesh) {
                        if (mesh instanceof THREE.Mesh || mesh instanceof THREE.Line) {
                            if (mesh.material.length != undefined) {
                                for (var i = 0; i < mesh.material.length; i++) {
                                    if (mesh.material[i]) {
                                        mesh.material[i].depthTest = false;
                                        mesh.material[i].depthWrite = false;
                                        mesh.material[i].transparent = true;
                                        mesh.material[i].side = THREE.FrontSide;
                                        mesh.material[i].polygonOffset = true;
                                        mesh.material[i].polygonOffsetFactor = 0.2;
                                        mesh.material[i].polygonOffsetUnits = 1.0;
                                    }
                                }
                            } else {
                                if (mesh.material) {
                                    mesh.material.depthTest = false;
                                    mesh.material.depthWrite = false;
                                    mesh.material.transparent = true;
                                    mesh.material.side = THREE.FrontSide;
                                    mesh.material.polygonOffset = true;
                                    mesh.material.polygonOffsetFactor = 0.2;
                                    mesh.material.polygonOffsetUnits = 1.0;
                                }
                            }
                        }
                    });
                }
            });
        }
    }

    setOrientation(view  :any) {
        if (this.sceneObject && this && this.animateParam) {
            let bb = new THREE.Box3().setFromObject(this.sceneObject);
            let center = new THREE.Vector3();
            bb.getCenter(center);
            var val = this.camera.position.distanceTo(center)
            let X = bb.min.x + (bb.max.x - bb.min.x) / 2
            let Y = bb.min.y + (bb.max.y - bb.min.y) / 2
            let Z = bb.min.z + (bb.max.z - bb.min.z) / 2
            
            switch (view) {
                case this.VIEW_ISOMETRIC:
                    this.resetCamera()
                    break;
                case this.VIEW_TOP:
                    this.animateParam(this.controls.target, center, function () { },10000)
                    this.animateParam(this.camera.position, new THREE.Vector3(X, val + center.y, Z), function () { },1000)
                    this.animateParam(this.camera.up, new THREE.Vector3(1, 0, 0), function () { },1000)
                    break;
                case this.VIEW_LEFT:
                    this.animateParam(this.controls.target, center, function () { },1000)
                    this.animateParam(this.camera.position, new THREE.Vector3(-val + center.x, Y, Z), function () { },1000)
                    this.animateParam(this.camera.up, new THREE.Vector3(0, 1, 0), function () { },1000)
                    break;
                case this.VIEW_BOTTOM:
                    this.animateParam(this.controls.target, center, function () { },1000)
                    this.animateParam(this.camera.position, new THREE.Vector3(X, -val + center.y, Z), function () { },1000)
                    this.animateParam(this.camera.up, new THREE.Vector3(-1, 0, 0), function () { },1000)
                    break;
                case this.VIEW_RIGHT:
                    this.animateParam(this.controls.target, center, function () { },1000)
                    this.animateParam(this.camera.position, new THREE.Vector3(val + center.x, Y, Z), function () { },1000)
                    this.animateParam(this.camera.up, new THREE.Vector3(0, 1, 0), function () { },1000)
                    break;
                default:
                    console.log("Error in CDS CAD viewer: invalid view orientation " + view);
                    break;
            }
            //this.render();
            this.controls.noZoom = false
            this.controls.noPan = false
        }

        
    }

    animateParam(param: any, to: any, onFinish: any, time: any) {
        const self = this;

        return new Tween(param, this.TWEEN) // Add the tween to the group
            .to({ x: to.x, y: to.y, z: to.z }, time)
            .easing(Easing.Linear.None)
            .onComplete(() => {
                self.camera.updateProjectionMatrix();
                if (onFinish) {
                    onFinish();
                }
            })
            .start();
    }

    resetCamera() {

        if (!this.sceneObject.userData.hasOwnProperty("boundingBox")) {
            this.animateParam(this.camera.position, new THREE.Vector3(this.cameraPosX, this.cameraPosY, this.cameraPosZ), function () { }, 1000)
            this.animateParam(this.camera.rotation, new THREE.Vector3(this.cameraRotX, this.cameraRotY, this.cameraRotZ), function () { }, 1000)
            this.animateParam(this.camera.up, new THREE.Vector3(0, 1, 0), function () { }, 1000)
            this.camera.updateProjectionMatrix();
        }
        if (this.sceneObject.userData.hasOwnProperty("boundingBox")) {
            let bb = new THREE.Box3().setFromObject(this.sceneObject);
            let center = new THREE.Vector3();
            bb.getCenter(center);
            this.controls.update();

            this.animateParam(this.controls.target, new THREE.Vector3(center.x, center.y, center.z), function () { }, 1000)
            this.animateParam(this.camera.position, new THREE.Vector3(this.cameraPosX, this.cameraPosY, this.cameraPosZ), function () { }, 1000)
            this.animateParam(this.camera.up, new THREE.Vector3(0, 1, 0), function () { }, 1000)
            this.camera.updateProjectionMatrix();
        }
    }

    closeScene() {

        if (this.scene !== null) {
            if (this.sceneBoundingBoxIndicator !== null) {
               // this.overlayScene.remove(this.sceneBoundingBoxIndicator);
                this.sceneBoundingBoxIndicator = null;
            }

            /* if (this.spinCenters !== null) {
                if (this.spinCenters instanceof THREE.Object3D) {
                    this.spinCenters.traverse(function (mesh) {
                        if (mesh instanceof THREE.Mesh) {
                            mesh.geometry.dispose();
                            mesh.geometry = null;
                            if (mesh.material.length != undefined) {
                                if (mesh.material.length > 0) {
                                    for (var i = 0; i < mesh.material.length; i++) {
                                        if (mesh.material[i].map) {
                                            mesh.material[i].map.dispose();
                                        }
                                        mesh.material[i].dispose();
                                    }
                                }
                            } else {
                                if (mesh.material.map) {
                                    mesh.material.map.dispose();
                                }
                                mesh.material.dispose();
                            }
                        }
                    });
                }

                this.overlayScene.remove(this.spinCenters);
                this.spinCenters = null;
            } */

            if (this.sceneObject !== null) {
                var object = this.sceneObject;
                if (object instanceof THREE.Object3D) {
                    object.traverse(function (mesh) {
                        if (mesh instanceof THREE.Mesh) {
                            mesh.geometry.dispose();
                            mesh.geometry = null;
                            if (mesh.material.length != undefined) {
                                if (mesh.material.length > 0) {
                                    for (var i = 0; i < mesh.material.length; i++) {
                                        if (mesh.material[i].map) {
                                            mesh.material[i].map.dispose();
                                        }
                                        mesh.material[i].dispose();
                                    }
                                }
                            } else {
                                if (mesh.material.map) {
                                    mesh.material.map.dispose();
                                }
                                mesh.material.dispose();

                            }
                        }
                    });
                }

                this.scene.remove(this.sceneObject);
                this.sceneObject = null;
            }

            this.sceneBoundingBox = null;
            this.modelBoundingBox = null;
           // this.clearBaseGridFromScene();
            /* if (this.hasOwnProperty('toggleShadow') && this.hasOwnProperty('shadows')) {
                this.shadows.removeShadows();
            } */
        }
    }
}

export default Web3D;
