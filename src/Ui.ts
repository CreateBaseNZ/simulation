import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import { Camera } from 'babylonjs/Cameras/index';
import * as monaco from 'monaco-editor';
import { SceneManager } from './SceneManager';

export class Ui {

    public advancedTexture: GUI.AdvancedDynamicTexture;

    private _camera: BABYLON.Camera;
    protected _editors: monaco.editor.IStandaloneCodeEditor[];

    constructor(scene: BABYLON.Scene) {
        this._editors = new Array<monaco.editor.IStandaloneCodeEditor>();
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
        let gameCanvas = (document.getElementById("gameCanvas"));
        let sidePanel = this.CreateSidePanel();
        sidePanel.innerHTML = DEFAULT_TEXT;
        this.CreateEditor("20%", sidePanel);
        this.CreateEditor("70%", sidePanel);
        this.CreateEditor("170%", sidePanel);
        



        menuBtn.onPointerDownObservable.add(() => {
            editorOpened = !editorOpened;
            if (editorOpened) {
                sidePanel.style.visibility = "visible";
                gameCanvas.style.width = "60%";
                SceneManager.instance.engine.resize();
            }
            else {
                sidePanel.style.visibility = "hidden";
                gameCanvas.style.width = "100%";
                SceneManager.instance.engine.resize();
            }
        });


    }

    CreateSidePanel() {
        const sidePanel = document.createElement("div");
        sidePanel.style.height = "100%";
        sidePanel.style.width = "40%";
        sidePanel.style.position = "absolute";
        sidePanel.style.top = "0px";
        sidePanel.style.left = "0px";
        sidePanel.style.visibility = "hidden";
        sidePanel.style.overflow = "scroll";
        sidePanel.id = "sidePanel";
        document.body.appendChild(sidePanel);

        return sidePanel;
    }

    CreateEditor(top: string, sidePanel: HTMLDivElement) {
        const editor = document.createElement("div");
        editor.style.height = "20%";
        editor.style.width = "95%";
        editor.style.position = "absolute";
        editor.style.top = top;
        editor.style.left = ((100 - parseFloat(editor.style.width)) / 2) + "%";
        editor.id = "editor";

        sidePanel.appendChild(editor);

        this._editors.push(monaco.editor.create(editor, {
            value: DEFAULT_CODE,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            theme: "hc-black",
        }));

        return editor;
    }

}

const DEFAULT_TEXT = `Coding tutorial for dummies` 
const DEFAULT_CODE = 
`for(int i = 0; i < 10; i++){
    if(i == 2){
        Serial.print(i);
    }
}`
