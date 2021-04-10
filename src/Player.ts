import * as BABYLON from '@babylonjs/core';
import { GameManager } from './GameManager';
import { Hud } from './Hud';
import { createPs } from './Particles';
import { PlayerController } from "./PlayerController";
import { Ui } from './Ui';

export class Player {

    public mesh: BABYLON.AbstractMesh;
    private _camera: BABYLON.Camera;
    public ui: Ui;
    public hud: Hud;

    constructor(scene) {
        let mesh = BABYLON.MeshBuilder.CreateBox("player", { size: 0.5 }, scene);
        mesh.position.y += 0.5;
        createPs(mesh, scene);
        let playerMat = new BABYLON.PBRMaterial("playerMat", scene);
        playerMat.albedoColor = BABYLON.Color3.Red();
        playerMat.roughness = 1;
        playerMat.metallic = 0;
        playerMat.environmentIntensity = 0.2;
        mesh.material = playerMat;

        let camera = new BABYLON.ArcRotateCamera("mainCamera", 0.8, 0.8, 55, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 100;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.fov = 0.2;
        camera.inertia = 0;
        camera.panningInertia = 0;
        camera.wheelPrecision = 1;
        camera.parent = mesh;

        let controller = new PlayerController(mesh, scene);
        controller.CreateCameraControls(camera);

        this.ui = new Ui(scene);
        this.hud = new Hud(camera, scene);
        this._camera = camera;
        this.mesh = mesh;

        GameManager.instance.AddPlayer(this);
    }

}