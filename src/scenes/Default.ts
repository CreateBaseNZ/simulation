import * as BABYLON from "@babylonjs/core";
import { resourceLimits } from "node:worker_threads";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";

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
        })
    });

    for (let i = 0; i < 5; i++) {
        let x = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        let z = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        new Star(scene, new BABYLON.Vector3(x, RandomNumber(0.5, 3), z));
    }
}