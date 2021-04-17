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
        position: Vector3 = null, rotation: Vector3 = null, scale: Vector3 = null,
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
        position: Vector3 = null, rotation: Vector3 = null, scale: Vector3 = null,
        customImport: (result: BABYLON.ISceneLoaderAsyncResult) => void = null) {

        BABYLON.SceneLoader.ImportMeshAsync(null, this.rootURL + this._fileURL, null, scene).then((result) => {
            this.meshes = result.meshes;
            if (customImport != null) { customImport(result); }

            this.meshes.forEach(mesh => {
                mesh.position = position === null ? mesh.position : position;
                mesh.rotation = rotation === null ? mesh.rotation : rotation;
                mesh.scaling = scale === null ? mesh.scaling : scale;

                if (this._options.objective && this.meshes.length === 1) {
                    this.objective = new Objective(mesh);
                }
                if (this._options.frozen && !this._options.physics) {
                    mesh.freezeWorldMatrix();
                }
                if (this._options.physics) {
                    let m = this._options.frozen ? 0 : 1;
                    if (!mesh.parent && mesh.getChildMeshes().length === 0) {
                        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: m }, scene);
                    }
                    else if (mesh.parent) {
                        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
                    }
                    else if (!mesh.parent && mesh.getChildMeshes().length > 0) {
                        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.NoImpostor, { mass: m }, scene);
                    }

                    mesh.physicsImpostor.setScalingUpdated();
                    this.meshes.push(mesh);

                }
            });

        });
    }

    protected Update(scene: BABYLON.Scene) {

    }

}