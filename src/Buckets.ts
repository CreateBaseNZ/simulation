import * as BABYLON from '@babylonjs/core';
import { Objective as Objective } from './Objective';

export class Buckets {

    constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        //super();
        let rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
        BABYLON.SceneLoader.ImportMeshAsync(null, rootURL + "buckets/", "buckets.babylon", scene).then((result) => {
            let meshes = result.meshes;

            let buffer = new Array();
            let hitBox;
            meshes.forEach(mesh => {
                if (mesh.name == "Buckets") {
                    mesh.position = BABYLON.Vector3.Zero();
                    hitBox = mesh;
                }
                else if (mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
                    buffer.push(mesh);
                }
            });

            let mesh = BABYLON.Mesh.MergeMeshes(buffer, true, true, undefined, false, true);
            let invisibleMaterial = new BABYLON.StandardMaterial("invisible", scene);
            invisibleMaterial.alpha = 0;
            hitBox.material = invisibleMaterial;

            mesh.parent = hitBox;
            hitBox.position = position;
            //this.mesh = hitBox;
        });
    }
}