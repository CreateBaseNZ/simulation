import * as BABYLON from '@babylonjs/core';
import { CBObject } from "./CBObject";
import { Collectable } from './Collectable';
import { SceneManager } from "./SceneManager";

export class Star extends Collectable {

    constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();

        BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", "Star.glb", scene, (meshes, particleSystems, skeletons) => {
            // Creating a material
            var starMat = new BABYLON.StandardMaterial("starMat", scene);
            starMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Base color
            starMat.emissiveColor = new BABYLON.Color3(0.9, 0.75, 0.2); // Glow color

            meshes.forEach(mesh => {
                if (mesh.parent) {
                    mesh.material = starMat;
                    mesh.receiveShadows = true;
                }
                else if (!mesh.parent) {
                    mesh.position = position;
                    mesh.scaling = new BABYLON.Vector3(0.006, 0.006, -0.006);
                }
            });
        });

    }

}