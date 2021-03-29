import * as BABYLON from '@babylonjs/core';
import { PlayerController } from "./PlayerController";

export class Player {

    public mesh: BABYLON.AbstractMesh;

    constructor(scene) {
        let capsuleOptions = { subdivisions: 10, tessellation: 10, height: 1.7, radius: 0.35, capSubdivisions: 10 };
        let mesh = BABYLON.MeshBuilder.CreateCapsule("player", capsuleOptions, scene);
        mesh.actionManager = new BABYLON.ActionManager(scene);
        new PlayerController(scene, mesh);
        this.mesh = mesh;
    }

}