import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import * as monaco from 'monaco-editor';
import { SceneManager } from './SceneManager';
import * as data from "../guide.json";

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

        const editorBtn = GUI.Button.CreateSimpleButton("editor", "Show Editor");
        editorBtn.width = "120px"
        editorBtn.height = "40px";
        editorBtn.color = "white";
        editorBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        editorBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        editorBtn.top = "2%";
        editorBtn.left = "2%";
        editorBtn.background = "Blue";
        editorBtn.zIndex = 1;
        advancedTexture.addControl(editorBtn);

        //this handles interactions with the start button attached to the scene
        let editorOpened = false;
        let gameCanvas = (document.getElementById("gameCanvas"));
        let sidePanel = document.getElementById("sidePanel");

        editorBtn.onPointerDownObservable.add(() => {
            editorOpened = !editorOpened;
            if (editorOpened) {
                sidePanel.style.visibility = "visible";
                gameCanvas.style.width = "60%";
                editorBtn.textBlock.text = "Hide Guide";
                SceneManager.instance.engine.resize();
            }
            else {
                sidePanel.style.visibility = "hidden";
                gameCanvas.style.width = "100%";
                editorBtn.textBlock.text = "Show Guide";
                SceneManager.instance.engine.resize();
            }
        });

        this.advancedTexture = advancedTexture;

        const { guide } = data;
        guide.forEach(element => {
            switch (element.type) {
                case "text":
                    this.CreateText(sidePanel, element.content)
                    break;
                case "editor":
                    this.CreateEditor(sidePanel, element.content);
                    break;
                case "editor-image":
                    this.CreateEditor(sidePanel, element.content, true);
                    break;
                default:
                    break;
            }
        });
    }

    private CreateText(sidePanel: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.style.margin = "20px";
        text.textContent = content;
        sidePanel.appendChild(text);
    }

    private CreateEditor(sidePanel: HTMLElement, content: string, readOnlyFlag: boolean = false) {
        const editor = document.createElement("div");
        editor.style.height = "20%";
        editor.style.margin = "0px 20px";
        editor.id = "editor" + this._editors.length;
        sidePanel.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: readOnlyFlag,
            minimap: { enabled: false },
            theme: "hc-black",
        });

        if (!readOnlyFlag) {
            const button = document.createElement("button");
            button.className = "compile-button"
            button.textContent = "Compile";
            button.id = "compile" + this._editors.length;
            button.addEventListener("click", () => {
                let code = STARTER_CODE;
                let id = parseInt(button.id.replace(/^\D+/g, ''));
                for (let i = 0; i <= id; i++) {
                    code = code.concat(this._editors[i].getModel().getValue());
                }
                code = code.concat("}");
                console.log(code);
            });
            sidePanel.appendChild(button);

            this._editors.push(monacoEditor);
        }
    }
}

const STARTER_CODE = `
#include <Servo.h>
void setup() {
    myservo.attach(2);
    myservo.attach(3);
    myservo.attach(4);
    myservo.attach(5);
}

void loop() {
`
