import * as BABYLON from '@babylonjs/core';
import { PlayerController } from "./PlayerController";
import { Ui } from './Ui';

export class Player {

    public mesh: BABYLON.AbstractMesh;
    private _camera: BABYLON.Camera;
    public ui;

    constructor(scene) {
        let capsuleOptions = { subdivisions: 2, tessellation: 16, height: 1.7, radius: 0.35, capSubdivisions: 6 };
        let mesh = BABYLON.MeshBuilder.CreateCapsule("player", capsuleOptions, scene);
        mesh.actionManager = new BABYLON.ActionManager(scene);
        var playerMat = new BABYLON.StandardMaterial("boxMat", scene);
        playerMat.diffuseColor = BABYLON.Color3.Red();
        mesh.material = playerMat;

        let camera = new BABYLON.ArcRotateCamera("mainCamera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 100;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.fov = 0.2;
        camera.inertia = 0;
        camera.wheelPrecision = 1;
        camera.parent = mesh;
        let controller = new PlayerController(scene);
        mesh.parent = controller.CreateNavAgent(scene);
        controller.CreateCameraControls(camera);

        this.ui = new Ui(scene);
        this._camera = camera;
        this.mesh = mesh;
    }

}