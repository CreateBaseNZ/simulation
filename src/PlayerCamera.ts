import * as BABYLON from '@babylonjs/core';

export class PlayerCamera {

    private _camera: BABYLON.Camera;

    constructor(mesh: BABYLON.AbstractMesh, scene: BABYLON.Scene) {

        let camera = new BABYLON.ArcRotateCamera("mainCamera", 0.8, 0.8, 55, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 80;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.fov = 0.2;
        camera.inertia = 0;
        camera.panningInertia = 0;
        camera.wheelPrecision = 1;
        camera.parent = mesh;

        this._camera = this.CreateCameraControls(camera);
    }

    private CreateCameraControls(camera: BABYLON.Camera) {
        camera.inputs.remove(camera.inputs.attached.pointers);
        let pointerInput = new BABYLON.ArcRotateCameraPointersInput();
        pointerInput.panningSensibility = 0;
        pointerInput.buttons = [1, 2];
        pointerInput.angularSensibilityX = 300;
        pointerInput.angularSensibilityY = 300;
        camera.inputs.add(pointerInput);
        camera.attachControl();

        return camera;
    }

    public GetCamera(){
        return (this._camera as BABYLON.ArcRotateCamera);
    }

}