import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { AssetOptions } from './AssetOptions';
import { CBObject } from './CBObject';

let fileURL = "buckets/buckets.babylon";
export class Buckets extends CBObject {

    constructor(scene: Scene,
        position: Vector3 = null, rotation: Vector3 = null, scale: Vector3 = null,
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