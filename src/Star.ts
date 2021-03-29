import * as BABYLON from '@babylonjs/core';
import { ActionManager } from 'babylonjs/Actions/actionManager';
import { VertexBuffer } from 'babylonjs/Meshes/buffer';
import { Objective as Objective } from './Objective';
import { SceneManager } from "./SceneManager";

export class Star extends Objective {

    constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();

        BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", "Star.glb", scene, (meshes, particleSystems, skeletons) => {
            // Creating a material
            var starMat = new BABYLON.StandardMaterial("starMat", scene);
            starMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Base color
            starMat.emissiveColor = new BABYLON.Color3(0.9, 0.75, 0.2); // Glow color

            let buffer = new Array();
            meshes.forEach(mesh => {
                if (mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
                    buffer.push(mesh);
                }
            });

            let mesh = BABYLON.Mesh.MergeMeshes(buffer, true, true, undefined, false, true);
            mesh.material = starMat;
            mesh.receiveShadows = true;
            mesh.position = position;
            mesh.scaling = new BABYLON.Vector3(0.006, 0.006, -0.006);
            this.mesh = mesh;
        });

    }

}