import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { CBObject } from './CBObject';

export class Diamond extends CBObject {

    readonly fileURL: string = "/diamonds.glb";

    constructor(scene: Scene, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        frozen: boolean = false, physics: boolean = false, objective: boolean = false) {
        super(scene, frozen, physics, objective);
        super.fileURL = this.fileURL;

        super.ImportAsset(scene, position, rotation, scale, (result) => {
            // Can add custom import logic here
        });
    }

    Update() {
        // Can run custom optional code to execute every frame
        
    }
}