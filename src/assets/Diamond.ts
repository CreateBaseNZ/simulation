import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { AssetOptions } from './AssetOptions';
import { CBObject } from './CBObject';

let fileURL = "Diamond.glb";
export class Diamond extends CBObject {

    constructor(scene: Scene,
        position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        options: AssetOptions = {frozen: false, physics: false, objective: false}) {

        super(scene, fileURL, position, rotation, scale, options, (result) => {
            // Import modder
            // Custom import modifications
        });
    }

    Update(scene: BABYLON.Scene) {
        // Can run custom optional code to execute every frame
    }
}