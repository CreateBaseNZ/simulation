import * as BABYLON from '@babylonjs/core';
import { Vector3, Scene } from '@babylonjs/core';
import { Objective } from '../Objective';
import { AssetOptions } from './AssetOptions';

export class CBObject {

    protected readonly rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
    public meshes: BABYLON.AbstractMesh[];
    public objective: Objective;
    public active: boolean;

    private _fileURL: string;
    private _options: AssetOptions;

    constructor(scene: Scene, fileURL: string,
        position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        options: AssetOptions = { frozen: false, physics: false, objective: false },
        importMod: (result: BABYLON.ISceneLoaderAsyncResult) => void = null) {

        this.meshes = new Array<BABYLON.AbstractMesh>();
        this._fileURL = fileURL;
        this._options = options;

        this.ImportAsset(scene, position, rotation, scale, importMod)

        scene.executeWhenReady(() => {
            scene.registerAfterRender(() => {
                this.Update(scene);
            });
        });
    }

    protected ImportAsset(scene: Scene,
        position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero(), scale: Vector3 = Vector3.One(),
        customImport: (result: BABYLON.ISceneLoaderAsyncResult) => void = null) {

        BABYLON.SceneLoader.ImportMeshAsync(null, this.rootURL + this._fileURL, null, scene).then((result) => {
            if (customImport != null) { customImport(result); }
            
            this.meshes.forEach(mesh => {
                mesh.position = position;
                mesh.rotation = rotation;
                mesh.scaling = scale;
                if (this._options.objective && this.meshes.length == 1) {
                    this.objective = new Objective(mesh);
                }
                if (this._options.frozen) {
                    mesh.freezeWorldMatrix();
                }
                if (this._options.physics) {
                    let m = this._options.frozen ? 1 : 0;
                    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: m }, scene);
                }
            });

        });
    }

    protected Update(scene: BABYLON.Scene) {

    }

}