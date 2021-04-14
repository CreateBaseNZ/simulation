import * as BABYLON from "@babylonjs/core";
import { resourceLimits } from "node:worker_threads";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";
import * as MATERIALS from "@babylonjs/materials";
import { Buckets } from "../Buckets";
import { Vector3 } from "@babylonjs/core";
import { Diamond } from "../Diamond";

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

    new Star(scene, new Vector3(-1.3, 1.5, 1.5));
    new Star(scene, new Vector3(-1.5, 2, -1.4));
    new Star(scene, new Vector3(1.6, 2.3, -1.1));
    new Star(scene, new Vector3(1.5, 1.8, 1.5));
    new Buckets(scene, new Vector3(-1, 0.2, -2));
}


export let anotherProject = (scene: BABYLON.Scene) => {

    new RoboticArm('roboticArm', scene);
    let ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 20, height: 1, depth: 20 }, scene);
    let mat = new BABYLON.PBRMaterial('pbr', scene);
    mat.albedoColor = BABYLON.Color3.Gray();
    mat.environmentIntensity = 0.2;
    mat.roughness = 1;
    mat.specularIntensity = 0;
    mat.metallic = 0;
    ground.material = mat;
    ground.position.y -= 0.5;
}