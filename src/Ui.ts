import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import * as monaco from 'monaco-editor';
import * as data from "../guide.json";
import { RobotManager } from './RobotManager';

export class Ui {

    private _advancedTexture: GUI.AdvancedDynamicTexture;
    private _camera: BABYLON.Camera;
    private _editorsReadOnly: monaco.editor.IStandaloneCodeEditor[];
    private _editorsWrite: monaco.editor.IStandaloneCodeEditor[];
    private _numberOfEditors: number;
    private _readOnlyCompileButtons: HTMLElement[];
    private _writeCompileButtons: HTMLElement[];

    constructor(scene: BABYLON.Scene) {
        monaco.editor.defineTheme("prototype", { "base": "vs", "inherit": true,
            "rules": [
                { "token": "comment", "foreground": "#6db261" },
                { "token": "keyword", "foreground": "#209ce2"},
                { "token": "typeKeyword", "foreground": "#81A1C1" },
                { "token": "identifier", "foreground": "#050505"},
                { "token": "delimiter", "foreground": "#2C03CF" },
                { "token": "number", "foreground": "#3667AF" },
                { "token": "string", "foreground": "#ffb649" },
                { "token": "string.escape", "foreground": "#FF7B1C" }
            ],
            "colors": {
                "editor.background": "#f4f4f4",
                "editor.foreground": "#f4f4f4",
                "editorLineNumber.foreground": "#ababab",
                "editorLineNumber.activeForeground": "#5f5f5f",
                "editor.lineHighlightBorder": "#e3e3e3",
                "editor.inactiveSelectionBackground": "#434c5ecc",
                "editorCursor.foreground": "#d8dee9"
            }
        });
        this._editorsReadOnly = new Array<monaco.editor.IStandaloneCodeEditor>();
        this._editorsWrite = new Array<monaco.editor.IStandaloneCodeEditor>();
        this._numberOfEditors = 0;
        this._readOnlyCompileButtons = new Array<HTMLElement>();
        this._writeCompileButtons = new Array<HTMLElement>();

        this._camera = new BABYLON.Camera("uiCamera", BABYLON.Vector3.Zero(), scene);
        this._camera.layerMask = 2;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.layer.layerMask = 2;

        //this handles interactions with the start button attached to the scene
        let educContent = document.querySelector(".educ-content") as HTMLElement;

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
                // case "compile":
                    // this.CreateCompileButton(educContent, element.content);
                    // break;
                default:
                    break;
            }
        });

        this._advancedTexture = advancedTexture;
        // Add the read-only compile system
        for (let i = 0; i < this._readOnlyCompileButtons.length; i++) {
            const element = this._readOnlyCompileButtons[i];
            this.CompileReadOnly(element, 0);
        }
        // Add the write compile system
        for (let i = 0; i < this._writeCompileButtons.length; i++) {
            const element = this._writeCompileButtons[i];
            this.CompileWrite(element, 0);
        }
        this.CompileWrite(document.querySelector(".compile-btn"), 0);
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
            wrappingStrategy: "advanced",
            lineNumbersMinChars: 3,
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            folding: true,
            foldingStrategy: 'indentation',
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
            overviewRulerBorder: false,
            theme: "prototype"
        });
        editor.style.height = monacoEditor.getContentHeight() + "px";
        // Adding Monaco into an array of editors
        this._editorsReadOnly.push(monacoEditor);
        this._numberOfEditors++;
        editorID.innerHTML = "[" + this._numberOfEditors + "]";
        // Add button in the read-only array buttons
        this._readOnlyCompileButtons.push(runAll);
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
            wrappingStrategy: "advanced",
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            foldingStrategy: 'indentation',
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

    private CreateWriteEditor(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container writable";
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
        const undo = document.createElement("img");
        undo.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/undo.svg";
        headerLeft.appendChild(undo).className = "editor-undo";
        const reset = document.createElement("img");
        reset.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/reset.svg";
        headerLeft.appendChild(reset).className = "editor-reset";
        // Right side buttons
        const headerRight = document.createElement("div");
        header.appendChild(headerRight).className = "editor-header-right";
        const editorType = document.createElement("div");
        editorType.innerHTML = "Writable";
        headerRight.appendChild(editorType).className = "editor-header-text";
        let headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const editorID = document.createElement("div");
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
        editor.id = "editor" + (this._editorsWrite.length + 1);
        wrapperEditor.appendChild(editor);

        // Build the editor
        let monacoEditor = monaco.editor.create(editor, {
            wrappingStrategy: "advanced",
            lineNumbersMinChars: 3,
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            folding: true,
            foldingStrategy: 'indentation',
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
            }
        });
        monacoEditor.onDidContentSizeChange(() => {
            if (monacoEditor.getModel().getLineCount() < 5) {
                editor.style.height = "80px";
            } else {
                editor.style.height = monacoEditor.getContentHeight() + "px";
            }
        });
        this._editorsWrite.push(monacoEditor);
        this._numberOfEditors++;
        editorID.innerHTML = "[" + this._numberOfEditors + "]";
        // Add button in the read-only array buttons
        this._writeCompileButtons.push(runAll);
    }

    private CompileWrite(button : HTMLElement, readOnlyEditorNumber : number) {
        button.addEventListener("click", () => {
            if (readOnlyEditorNumber) {

            } else {
                console.log("Compiling the entire write code");
                let code = "";
                for (let i = 0; i < this._editorsWrite.length; i++) {
                    code = code.concat(this._editorsWrite[i].getModel().getValue() + "\n");
                }
                RobotManager.instance.UploadCode(code);
            }
        });
    }

    private CompileReadOnly(button : HTMLElement, readOnlyEditorNumber : number) {
        button.addEventListener("click", () => {
            if (readOnlyEditorNumber) {

            } else {
                console.log("Compiling the entire read-only code");
                let code = "";
                for (let i = 0; i < this._editorsReadOnly.length; i++) {
                    code = code.concat(this._editorsReadOnly[i].getModel().getValue() + "\n");
                }
                RobotManager.instance.UploadCode(code);
            }
        });
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