import * as BABYLON from "@babylonjs/core";
import { FresnelParameters } from "babylonjs/Materials/fresnelParameters";
import { Player } from "../Player";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../Star";

export let defaultScene = (scene: BABYLON.Scene) => {

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 30, height: 1, depth: 30 }, scene);
    ground.position.y -= 1;
    ground.material = null;
    ground.receiveShadows = true; // Shadows are disabled by default

    /*
    // Create roboticArm
    new RoboticArm('roboticArm', scene);
    */

    new Star(scene, new BABYLON.Vector3(2, 2, 1.5));
    new Star(scene, new BABYLON.Vector3(0, 1.5, 1.5));
    new Star(scene, new BABYLON.Vector3(-1.6, 2.1, 0));
    new Star(scene, new BABYLON.Vector3(0, 3, -1.8));

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

    const player = new Player(scene);
}