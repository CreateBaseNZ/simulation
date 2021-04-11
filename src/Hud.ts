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

    public WinUI() {
        const winText = new GUI.TextBlock("win", "PROJECT COMPLETE");
        winText.fontSize = 96;
        winText.width = "100%"
        winText.height = "100%";
        winText.color = "black";
        winText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        winText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        winText.left = "500px";
        winText.zIndex = 1;

        this._advancedTexture.addControl(winText);
    }
}