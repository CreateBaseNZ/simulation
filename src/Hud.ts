import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";

export class Hud {

    private _advancedTexture: GUI.AdvancedDynamicTexture;
    private _camera: BABYLON.Camera;

    constructor(parentCamera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene) {
        let uiCamera = new BABYLON.FreeCamera("uiCamera", BABYLON.Vector3.Zero(), scene);
        uiCamera.layerMask = 0x10000000;
        uiCamera.parent = parentCamera;
        uiCamera.fov = 0.2;
        this._camera = uiCamera;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.layer.layerMask = 0x10000000;
        this._advancedTexture = advancedTexture;
        scene.registerBeforeRender(() =>{
            this._advancedTexture.renderScale = (parentCamera.radius/10) * 1.25;
        })
    }

    public GetAdvancedTexture() {
        return this._advancedTexture;
    }
}