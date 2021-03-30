import * as BABYLON from '@babylonjs/core';
import { PlayerController } from "./PlayerController";
import { Ui } from './Ui';

export class Player {

    public mesh: BABYLON.AbstractMesh;
    private _camera: BABYLON.Camera;
    private _ui;

    constructor(scene) {
        let capsuleOptions = { subdivisions: 10, tessellation: 10, height: 1.7, radius: 0.35, capSubdivisions: 10 };
        let mesh = BABYLON.MeshBuilder.CreateCapsule("player", capsuleOptions, scene);
        mesh.actionManager = new BABYLON.ActionManager(scene);

        let camera = new BABYLON.ArcRotateCamera("mainCamera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 3;
        camera.upperRadiusLimit = 30;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.inertia = 0;
        camera.wheelPrecision = 5;
        camera.parent = mesh;
        let controller = new PlayerController(scene);
        mesh.parent = controller.CreateNavAgent(scene);
        controller.CreateCameraControls(camera);

        this._ui = new Ui(scene);
        this._camera = camera;
        this.mesh = mesh;
    }

}