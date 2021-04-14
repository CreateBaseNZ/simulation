import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';

export class CBObject {

    protected readonly rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
    protected fileURL: string;
    public result;
    public frozen;
    public physics;
    public objective;

    private _active;

    constructor(scene: Scene, frozen: boolean = false, _physics: boolean = false, _objective: boolean = false) {
        scene.executeWhenReady(() => {
            scene.registerAfterRender(() => {
                this.Update();
            });
        });
    }

    protected ImportAsset(scene: Scene, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        customImport: (result: BABYLON.ISceneLoaderAsyncResult) => void = null) {

        BABYLON.SceneLoader.ImportMeshAsync(null, this.rootURL, this.fileURL, scene).then((result) => {
            let meshes = result.meshes;
            meshes.forEach(mesh => {
                mesh.position = position;
                mesh.rotation = rotation;
                mesh.scaling = scale;
                mesh.id = "objective";
            });

            customImport(result);

            this.result = result;
        });
    }

    protected Update() {

    }
}