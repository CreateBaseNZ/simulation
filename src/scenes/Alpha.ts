import * as BABYLON from "@babylonjs/core";
import { RoboticArm } from "../roboticArm";

export let alphaScene = (scene: BABYLON.Scene) => {

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 10, height: 1, depth: 10 }, scene);
    ground.position.y -= 1;
    ground.material = null;

    // Create roboticArm
    new RoboticArm('roboticArm', scene);

    // Importing Meshes use "npx serve --cors" on asset folder
    BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", "SK_Drone.glb", scene, (meshes, particleSystems, skeletons) => {
        meshes.forEach(mesh => {
            if (mesh.parent) { // This logic applies to the mesh bodies
            }
            else if (!mesh.parent) { // This logic will apply to the root of the mesh import
                mesh.position = new BABYLON.Vector3(3, 3, 1.5); 
            }
        });
    });

    let createStar = (position: BABYLON.Vector3) => {
        BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", "Star.glb", scene, (meshes, particleSystems, skeletons) => {
            // Creating a material
            var starMat = new BABYLON.StandardMaterial("starMat", scene);
            starMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Base color
            starMat.emissiveColor = new BABYLON.Color3(0.9, 0.75, 0.2); // Glow color

            meshes.forEach(mesh => {
                if (mesh.parent) {
                    mesh.material = starMat;
                }
                else if (!mesh.parent) {
                    mesh.position = position;
                    mesh.scaling = new BABYLON.Vector3(0.006, 0.006, -0.006);
                }
            });
        });
    }

    createStar(new BABYLON.Vector3(2, 2, 1.5));
    createStar(new BABYLON.Vector3(0, 1.5, 1.5));
    createStar(new BABYLON.Vector3(-1.6, 2.1, 0));
    createStar(new BABYLON.Vector3(0, 3, -1.8));

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