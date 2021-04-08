import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import * as monaco from 'monaco-editor';
import { SceneManager } from './SceneManager';
import * as data from "../guide.json";
import { RobotManager } from './RobotManager';
import { on } from 'events';

export class Ui {

    private _advancedTexture: GUI.AdvancedDynamicTexture;
    private _camera: BABYLON.Camera;
    private _editorsWrite: monaco.editor.IStandaloneCodeEditor[];
    private _editorsReadOnly: monaco.editor.IStandaloneCodeEditor[];

    constructor(scene: BABYLON.Scene) {
        this._editorsWrite = new Array<monaco.editor.IStandaloneCodeEditor>();
        this._camera = new BABYLON.Camera("uiCamera", BABYLON.Vector3.Zero(), scene);
        this._camera.layerMask = 2;

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
                case "editor-write":
                    this.CreateEditor(guidePanel, element.content);
                    break;
                case "block-code":
                    this.CreateEditorReadOnly(guidePanel, element.content);
                    break;
                case "editor-read-only":
                    this.CreateEditorReadOnlyFull(guidePanel, element.content);
                    break;
                case "heading-1":
                    this.CreateHeading1(guidePanel, element.content)
                    break;
                case "compile":
                    this.CreateCompileButton(guidePanel, element.content)
                    break;
                default:
                    break;
            }
        });

        this._advancedTexture = advancedTexture;
    }

    public GetAdvancedTexture() {
        return this._advancedTexture;
    }

    private CreateText(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "text font-monospace lh-base fw-normal fs-6"
        text.innerHTML = content;
        parentElement.appendChild(text);
    }

    private CreateHeading1(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "heading-1 h4";
        text.innerText = content;
        parentElement.appendChild(text);
    }

    private CreateEditor(parentElement: HTMLElement, content: string) {
        const editor = document.createElement("div");
        editor.className = "editor";
        editor.id = "editor" + this._editorsWrite.length;
        parentElement.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            theme: "hc-black",
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            }
        });

        monacoEditor.onDidContentSizeChange(() => {
            if (monacoEditor.getModel().getLineCount() < 5) {
                editor.style.height = "95px";
            } else {
                editor.style.height = monacoEditor.getContentHeight() + "px";
            }
        });

        this._editorsWrite.push(monacoEditor);
    }

    private CreateCompileButton(parentElement: HTMLElement, content: string) {
        const button = document.createElement("button");
        button.className = "compile-button btn btn-primary btn-lg";
        button.innerText = "Compile";
        button.id = "compile" + (this._editorsWrite.length - 1);
        button.addEventListener("click", () => {
            let code = "";
            let id = parseInt(button.id.replace(/^\D+/g, ''));
            for (let i = 0; i <= id; i++) {
                code = code.concat(this._editorsWrite[i].getModel().getValue() + "\n");
            }
            document.getElementById("terminal").innerText = "";
            RobotManager.instance.UploadCode(code);
        });
        parentElement.appendChild(button);
    }

    private CreateEditorReadOnly(parentElement: HTMLElement, content: string) {
        const editor = document.createElement("div");
        editor.className = "editor";
        parentElement.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            },
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            overviewRulerBorder: false
        });
        monacoEditor.onDidContentSizeChange(() => {
            editor.style.height = monacoEditor.getContentHeight() + "px";
        });
    }

    private CreateEditorReadOnlyFull(parentElement: HTMLElement, content: string) {
        const editor = document.createElement("div");
        editor.className = "editor";
        parentElement.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            },
            overviewRulerBorder: false
        });
        editor.style.height = monacoEditor.getContentHeight() + "px";
    }

    public WinUI() {
        const winText = new GUI.TextBlock("win", "PROJECT COMPLETE");
        winText.fontSize = 96;
        winText.width = "100%"
        winText.height = "100%";
        winText.color = "black";
        winText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        winText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        winText.zIndex = 1;

        this._advancedTexture.addControl(winText);
    }

}