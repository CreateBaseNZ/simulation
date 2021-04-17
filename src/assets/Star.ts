import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { AssetOptions } from './AssetOptions';
import { CBObject } from './CBObject';

let fileURL = "Star.glb";
export class Star extends CBObject {

    constructor(scene: Scene,
        position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        options: AssetOptions = {frozen: false, physics: false, objective: false}) {

        super(scene, fileURL, position, rotation, scale, options, (result) => {
            let meshes = result.meshes;

            let buffer = new Array();
            meshes.forEach(mesh => {
                if (mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
                    buffer.push(mesh);
                }
            });

            let mesh = BABYLON.Mesh.MergeMeshes(buffer, true, true, undefined, false, true);
            this.meshes = [mesh];
        });
    }

    Update(scene: BABYLON.Scene) {
        // Can run custom optional code to execute every frame
        this.meshes[0].rotation.y += (1.5 * (scene.deltaTime / 1000));
    }
}