import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { Arduino } from './arduino';
import * as monaco from 'monaco-editor'
import { Robot } from "./Robot";

const DEFAULT_TEXT = `Select a Robot to view its Code`;

export class IDE {

    protected _editor: monaco.editor.IStandaloneCodeEditor;

    constructor() {
        this._editor = monaco.editor.create(document.getElementById("editor"), {
            value: DEFAULT_TEXT,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            theme: "vs-dark",
        });
        this.hideIDE();
    }

    public showIDE() {
        document.getElementById("editor").style.display = "initial";
    }

    public hideIDE() {
        document.getElementById("editor").style.display = "none";
    }

    public setText(text: string) {
        this._editor.getModel().setValue(text);
    }

    public getText() {
        return (this._editor.getModel().getValue());
    }
}