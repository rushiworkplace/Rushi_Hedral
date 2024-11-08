import * as THREE from 'three'
import { web3DObj } from './Experience';

class CameraControls  {

    /**
     * Set camera position with respect to bounding box
     */
  /*   setCameraWith  (jsonFileObject : any) {
        if (jsonFileObject.hasOwnProperty('userData')) { //for assmebly
            if (jsonFileObject.userData.hasOwnProperty('boundingBox'))
             web3DObj.current.sceneBoundingBox =  web3DObj.current.convertBoundingBox(jsonFileObject.userData.boundingBox);
        } else if (jsonFileObject.hasOwnProperty('object')) { //for part file
            if (jsonFileObject.object.hasOwnProperty('userData'))
                if (jsonFileObject.object.userData.hasOwnProperty('boundingBox'))
                 web3DObj.current.sceneBoundingBox =  web3DObj.current.convertBoundingBox(jsonFileObject.object.userData.boundingBox);
        }
    } */


    /**
     *  Stores the camera position for initial camera view
     */
    storeCameraPosition  () {

        ////keep initial camera positions
         web3DObj.current.cameraPosX =  web3DObj.current.camera.position.x;
         web3DObj.current.cameraPosY =  web3DObj.current.camera.position.y;
         web3DObj.current.cameraPosZ =  web3DObj.current.camera.position.z;

         web3DObj.current.cameraRotX =  web3DObj.current.camera.rotation.x;
         web3DObj.current.cameraRotY =  web3DObj.current.camera.rotation.y;
         web3DObj.current.cameraRotZ =  web3DObj.current.camera.rotation.z;
    }

    /**
     *  Sets the camera position from JSON file
     */
    setCameraPosition  (cameraPosition : any) {
        if (cameraPosition != undefined) {
            var identity = new THREE.Matrix4().identity();
            var matrix = new THREE.Matrix4().fromArray(cameraPosition)
            if (!matrix.equals(identity)) {
                var mat = new THREE.Matrix4().fromArray(cameraPosition);
                var inverse = new THREE.Matrix4();
                inverse.invert();
                var quaternion = new THREE.Quaternion();
                var position = new THREE.Vector3();
                var scale = new THREE.Vector3();

                inverse.decompose(position, quaternion, scale);
                 web3DObj.current?.camera.position.set(position.x, position.y, position.z);
            }
        }
    }

    /*
 * Calculates the min and max camera distance from the center of the model
 * minDistanceMultiplier may be used to change the maximum zoom
 */
    /* setZoomLimits  (minDistanceMultiplier) {
        var __this = cdsViewerObject;
        if (! web3DObj.current.sceneObject.userData.hasOwnProperty("boundingBox")) {
            var radius = Math.max(__this.sceneBoundingBox.max.x - __this.sceneBoundingBox.min.x,
                __this.sceneBoundingBox.max.y - __this.sceneBoundingBox.min.y,
                __this.sceneBoundingBox.max.z - __this.sceneBoundingBox.min.z);
            var maxScale = Math.max(__this.sceneObject.scale.x, __this.sceneObject.scale.y, __this.sceneObject.scale.z);

            __this.controls.minDistance = radius * maxScale;
            __this.controls.maxDistance = __this.controls.minDistance * __this.ZOOM_MULTIPLIER;

            if (typeof minDistanceMultiplier !== "undefined" && minDistanceMultiplier !== null) {
                __this.controls.minDistance *= minDistanceMultiplier;
            }
        } else {
            var dist =  web3DObj.current.camera.position.distanceTo( web3DObj.current.sceneObject.position)
            var scalefactor = dist / 2;

            __this.controls.minDistance = scalefactor;
            __this.controls.maxDistance = __this.controls.minDistance * __this.ZOOM_MULTIPLIER;

            if (typeof minDistanceMultiplier !== "undefined" && minDistanceMultiplier !== null) {
                __this.controls.minDistance *= minDistanceMultiplier;
            }
        }
    } */
}

export { CameraControls }