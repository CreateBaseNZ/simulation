import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import { Camera } from 'babylonjs/Cameras/index';

export class Ui {

    private _camera: BABYLON.Camera;
    public advancedTexture: GUI.AdvancedDynamicTexture;

    constructor(scene: BABYLON.Scene) {
        this._camera = new BABYLON.Camera("uiCamera", BABYLON.Vector3.Zero(), scene);
        this._camera.layerMask = 2;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.layer.layerMask = 2;

        const menuBtn = GUI.Button.CreateSimpleButton("editor", "Editor");
        menuBtn.width = "100px"
        menuBtn.height = "40px";
        menuBtn.color = "white";
        menuBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        menuBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        menuBtn.top = "2%";
        menuBtn.left = "2%";
        menuBtn.background = "Blue";
        menuBtn.zIndex = 1;
        advancedTexture.addControl(menuBtn);

        //this handles interactions with the start button attached to the scene
        let editorOpened = false;
        menuBtn.onPointerDownObservable.add(() => {
            editorOpened = !editorOpened;
            if(editorOpened){

            }
        });


    }

}