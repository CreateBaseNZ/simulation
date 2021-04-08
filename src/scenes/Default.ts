import * as BABYLON from "@babylonjs/core";
import { resourceLimits } from "node:worker_threads";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";

export let defaultScene = (scene: BABYLON.Scene) => {

    // Create ground
    // const ground = BABYLON.MeshBuilder.CreateBox("ground", { size: 1 }, scene);
    // ground.scaling = new BABYLON.Vector3(15, 2, 15);
    // ground.position.y -= ground.scaling.y / 2;
    // ground.material = null;
    // ground.receiveShadows = true; // Shadows are disabled by default

    // Create roboticArm
    new RoboticArm('roboticArm', scene);

    function RandomNumber(min: number, max: number) {
        return (Math.random() * (max - min) + min);
    };
    let rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";

    BABYLON.SceneLoader.ImportMeshAsync(null, rootURL, "seashank.glb", scene).then((result) => {
        result.meshes.forEach(mesh => {
            console.log(mesh.name);
        })
    });

    for (let i = 0; i < 5; i++) {
        let x = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        let z = (Math.random() < 0.5 ? -1 : 1) * RandomNumber(0.7, 2.2);
        new Star(scene, new BABYLON.Vector3(x, RandomNumber(0.5, 3), z));
    }

    let createBox = (x: number, y: number, z: number) => {
        let box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.7 }, scene);
        box.position = new BABYLON.Vector3(x, y, z);

        var boxMat = new BABYLON.StandardMaterial("boxMat", scene);
        boxMat.diffuseColor = BABYLON.Color3.Green();
        box.material = boxMat;
    }

    createBox(3, 0.35, 0);
    createBox(3, 0.35, 3);
    createBox(-3, 0.35, 3);
    createBox(-3, 0.35, -3);
    createBox(3, 0.35, -3);
}