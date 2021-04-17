import * as BABYLON from '@babylonjs/core';
import { GameManager } from './GameManager';
import { Hud } from './Hud';
import { createPs } from './Particles';
import { PlayerCamera } from './PlayerCamera';
import { PlayerController } from "./PlayerController";
import { Ui } from './Ui';

export class Player {

    public mesh: BABYLON.AbstractMesh;
    public camera: PlayerCamera;
    public ui: Ui;
    public hud: Hud;

    constructor(scene) {
        let mesh = BABYLON.MeshBuilder.CreateBox("player", { size: 0.5 }, scene);
        mesh.position.y += 0.5;
        //createPs(mesh, scene);

        this.camera = new PlayerCamera(scene);
        //this.ui = new Ui(scene);
        this.hud = new Hud(this.camera.GetCamera(), scene);
        this.mesh = mesh;

        GameManager.instance.AddPlayer(this);
    }

}