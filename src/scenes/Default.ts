import * as BABYLON from "@babylonjs/core";
import { resourceLimits } from "node:worker_threads";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";
import * as MATERIALS from "@babylonjs/materials";
import { Buckets } from "../Buckets";

export let defaultScene = (scene: BABYLON.Scene) => {
    // Create roboticArm
    new RoboticArm('roboticArm', scene);

    function RandomNumber(min: number, max: number) {
        return (Math.random() * (max - min) + min);
    };

    let rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
    BABYLON.SceneLoader.ImportMeshAsync(null, rootURL, "seashank/seashank.babylon", scene).then((result) => {
        result.meshes.forEach(mesh => {
            mesh.position.y -= 0.6;
            mesh.receiveShadows = true;
            if (mesh.name == "water.001") {
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

    for (let i = 0; i < 5; i++) {
        let x = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        let z = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        new Star(scene, new BABYLON.Vector3(x, RandomNumber(0.5, 3), z));
    }

    new Buckets(scene, new BABYLON.Vector3(-1, 0.2, -2));
}