import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import * as monaco from 'monaco-editor';
import { SceneManager } from './SceneManager';
import * as data from "../guide.json";
import { RobotManager } from './RobotManager';
//import { on } from 'events';
//import { editorClass, createEditor } from 'open-cb-editor';

export class Ui {

    private _advancedTexture: GUI.AdvancedDynamicTexture;
    private _camera: BABYLON.Camera;
    private _editorsWrite: monaco.editor.IStandaloneCodeEditor[];

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
        let educContent = document.querySelector(".educ-content") as HTMLElement;

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

        const { contents } = data;
        contents.forEach(element => {
            switch (element.type) {
                case "subsystem-heading":
                    this.CreateSubsystemHeading(educContent, element.content);
                    break;
                case "task-heading":
                    this.CreateTaskHeading(educContent, element.content);
                    break;
                case "text":
                    this.CreateText(educContent, element.content);
                    break;
                case "editor-read-only":
                    this.CreateEditorReadOnly(educContent, element.content);
                    break;
                case "code-block":
                    this.CreateCodeBlock(educContent, element.content);
                    break;
                case "editor-write":
                    this.CreateWriteEditor(educContent, element.content);
                    break;
                case "compile":
                    this.CreateCompileButton(educContent, element.content);
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

    private CreateSubsystemHeading(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "sim-h1";
        text.innerText = content;
        parentElement.appendChild(text);
    }

    private CreateTaskHeading(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "sim-h2";
        text.innerText = content;
        parentElement.appendChild(text);
    }

    private CreateText(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "sim-p"
        text.innerHTML = content;
        parentElement.appendChild(text);
    }

    private CreateEditorReadOnly(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container read-only";
        parentElement.appendChild(containerEditor);
        // Create the header element
        const header = document.createElement("div");
        header.className = "editor-header";
        containerEditor.appendChild(header);
        // Left side buttons
        const headerLeft = document.createElement("div");
        header.appendChild(headerLeft).className = "editor-header-left";
        const runAll = document.createElement("img");
        runAll.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/run-all.svg";
        headerLeft.appendChild(runAll).className = "run-all";
        const runAbove = document.createElement("img");
        runAbove.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/run-above.svg";
        headerLeft.appendChild(runAbove).className = "run-above";
        // Right side buttons
        const headerRight = document.createElement("div");
        header.appendChild(headerRight).className = "editor-header-right";
        const editorType = document.createElement("div");
        editorType.innerHTML = "Read-only";
        headerRight.appendChild(editorType).className = "editor-header-text";
        let headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const editorID = document.createElement("div");
        editorID.innerHTML = "[]";
        headerRight.appendChild(editorID).className = "editor-header-text";
        headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const expand = document.createElement("img");
        expand.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/expand.svg";
        headerRight.appendChild(expand).className = "editor-expand";
        const collapse = document.createElement("img");
        collapse.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/collapse.svg";
        headerRight.appendChild(collapse).className = "editor-collapse";
        // Create the wrapper element
        const wrapperEditor = document.createElement("div");
        wrapperEditor.className = "editor-wrapper";
        containerEditor.appendChild(wrapperEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        wrapperEditor.appendChild(editor);

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

    private CreateCodeBlock(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container block";
        parentElement.appendChild(containerEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        containerEditor.appendChild(editor);

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

    /* private CreateEditor(parentElement: HTMLElement, content: string, type: editorClass) {
        const editor = document.createElement("div");
        editor.className = "editor";
        parentElement.appendChild(editor);
        const options : monaco.editor.IEditorOptions = {
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
        }
        let monacoEditor = new createEditor(editor, options, type);
        monacoEditor.setCode(content);
        //monacoEditor.editor.updateOptions(options);
        //editor.style.height = monacoEditor.editor.getContentHeight() + "px";
    }*/

    private CreateWriteEditor(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container writable";
        parentElement.appendChild(containerEditor);
        // Create the header element
        const header = document.createElement("div");
        header.className = "editor-header";
        containerEditor.appendChild(header);
        // Create the wrapper element
        const wrapperEditor = document.createElement("div");
        wrapperEditor.className = "editor-wrapper";
        containerEditor.appendChild(wrapperEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        editor.id = "editor" + this._editorsWrite.length;
        wrapperEditor.appendChild(editor);

        // Build the editor
        let monacoEditor = monaco.editor.create(editor, {
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            },
            theme: "hc-black"
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