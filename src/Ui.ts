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

        scene.executeWhenReady(() => {
            scene.registerAfterRender(() => {
                this.Update();
            });
        });

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.layer.layerMask = 2;

        const editorBtn = GUI.Button.CreateSimpleButton("editor", "Hide Guide");
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
        let editorOpened = true;
        let gameCanvas = (document.getElementById("gameCanvas"));
        let sidePanel = document.getElementById("sidePanel");
        let guidePanel = document.getElementById("guide");

        editorBtn.onPointerDownObservable.add(() => {
            editorOpened = !editorOpened;
            SceneManager.instance.EnableResize();
            setTimeout(() => { SceneManager.instance.DisableResize(); }, 1000);
            if (editorOpened) {
                sidePanel.classList.replace("close", "open");
                gameCanvas.classList.replace("close", "open");
                editorBtn.textBlock.text = "Hide Guide";
            }
            else {
                sidePanel.classList.replace("open", "close");
                gameCanvas.classList.replace("open", "close");
                editorBtn.textBlock.text = "Show Guide";
            }
        });

        const { guide } = data;
        guide.forEach(element => {
            switch (element.type) {
                case "text":
                    this.CreateText(guidePanel, element.content)
                    break;
                case "editor":
                    this.CreateEditor(guidePanel, element.content);
                    break;
                case "editor-image":
                    this.CreateEditor(guidePanel, element.content, true);
                    break;
                default:
                    break;
            }
        });

        this.advancedTexture = advancedTexture;
    }

    private CreateText(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "text font-monospace lh-base fw-normal fs-6"
        text.textContent = content;
        parentElement.appendChild(text);
    }

    private CreateEditor(parentElement: HTMLElement, content: string, readOnlyFlag: boolean = false) {
        const editor = document.createElement("div");
        editor.className = "editor"
        editor.id = "editor" + this._editors.length;
        parentElement.appendChild(editor);

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
            button.className = "compile-button btn btn-primary btn-lg";
            button.textContent = "Compile";
            button.id = "compile" + this._editors.length;
            button.addEventListener("click", () => {
                let code = STARTER_CODE;
                let id = parseInt(button.id.replace(/^\D+/g, ''));
                for (let i = 0; i <= id; i++) {
                    code = code.concat(this._editors[i].getModel().getValue() + "\n");
                }
                code = code.concat("}");
                console.log(code);
            });
            parentElement.appendChild(button);

            this._editors.push(monacoEditor);
        }
    }

    Update() {

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
