import * as BABYLON from "@babylonjs/core";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";

export let defaultScene = (scene: BABYLON.Scene) => {

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 10, height: 1, depth: 10 }, scene);
    ground.position.y -= 1;
    ground.material = null;
    ground.receiveShadows = true; // Shadows are disabled by default

    // Create roboticArm
    new RoboticArm('roboticArm', scene);

    function RandomNumber(min: number, max: number) {
        return (Math.random() * (max - min) + min);
    };

    for (let i = 0; i < 5; i++) {
        new Star(scene, new BABYLON.Vector3(RandomNumber(-5, 5), 0.3, RandomNumber(-5, 5)));
    }

    let createBox = (color: BABYLON.Color3, position: BABYLON.Vector3) => {
        let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position = position;

        var boxMat = new BABYLON.StandardMaterial("boxMat", scene);
        boxMat.diffuseColor = color;
        box.material = boxMat;
    }

    createBox(BABYLON.Color3.Green(), new BABYLON.Vector3(3, 0, 0));
    createBox(BABYLON.Color3.Green(), new BABYLON.Vector3(3, 0, 3));
    createBox(BABYLON.Color3.Green(), new BABYLON.Vector3(-3, 0, 3));
    createBox(BABYLON.Color3.Green(), new BABYLON.Vector3(-3, 0, -3));
    createBox(BABYLON.Color3.Red(), new BABYLON.Vector3(3, 0, -3));
}