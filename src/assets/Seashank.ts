import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { AssetOptions } from './AssetOptions';
import { CBObject } from './CBObject';
import * as MATERIALS from "@babylonjs/materials";

let fileURL = "seashank/seashank.babylon";
export class Seashank extends CBObject {

    constructor(scene: Scene,
        position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        options: AssetOptions = {frozen: false, physics: false, objective: false}) {

        super(scene, fileURL, position, rotation, scale, options, (result) => {
            result.meshes.forEach(mesh => {
                mesh.position.y -= 0.6;
                if (mesh.name == "Water Cube") {
                    var water = new MATERIALS.WaterMaterial("water", scene);
                    water.bumpTexture = new BABYLON.Texture("https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/seashank/waterbump.png", scene);
                    // Water properties
                    water.windForce = 6;
                    water.waveHeight = 0.0013;
                    water.windDirection = new BABYLON.Vector2(1, 1);
                    water.waterColor = new BABYLON.Color3(0, 0.467, 0.745);
                    water.colorBlendFactor = 0.3;
                    water.bumpHeight = 0.1;
                    water.waveLength = 1;
                    water.alpha = 0.75;
                    mesh.material = water;
                }
            });
        });
    }

    Update(scene: BABYLON.Scene) {
        // Can run custom optional code to execute every frame
    }
}