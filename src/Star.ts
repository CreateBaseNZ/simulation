import * as BABYLON from '@babylonjs/core';
import { Objective as Objective } from './Objective';

export class Star extends Objective {

    constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();
        let rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
        BABYLON.SceneLoader.ImportMeshAsync(null, rootURL, "Star.glb", scene).then((result) => {
            let meshes = result.meshes;
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
            mesh.position = position;
            mesh.scaling = new BABYLON.Vector3(0.006, 0.006, -0.006);
            mesh.isVisible = false;
            mesh.id = "objective";
            this.mesh = mesh;
        });

        scene.executeWhenReady(() => {
            scene.registerAfterRender(() => {
                this.mesh.rotation.y += (1.5 * (scene.deltaTime/1000));
            });
        });
    }
}