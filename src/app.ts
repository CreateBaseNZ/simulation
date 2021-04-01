import * as BABYLON from '@babylonjs/core';
import { SceneManager } from "./SceneManager";

export class App {

    // General Entire Application
    protected _canvas: HTMLCanvasElement;
    protected _editor: HTMLDivElement;
    protected _engine: BABYLON.Engine;

    //Scene - related
    protected _sceneManager: SceneManager;

    constructor() {
        this._styleDocument();
        //this._editor = this._createEditor(this._editor);
        this._canvas = this._createCanvas(this._canvas);

        // initialize babylon engine
        this._engine = new BABYLON.Engine(this._canvas, true);

        this._sceneManager = new SceneManager(this._engine);

        // run the main render loop
        this._main();
    }

    private _styleDocument() {
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
    }

    private _createCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
        //create the canvas html element and attach it to the webpage
        canvas = document.createElement("canvas");
        canvas.style.height = "100%";
        canvas.style.width = "100%";
        canvas.style.position = "absolute";
        canvas.style.right = "0px";
        canvas.style.outlineStyle = "none";
        canvas.id = "gameCanvas";

        document.body.appendChild(canvas);

        return canvas;
    }

    private _createEditor(editor: HTMLDivElement): HTMLDivElement {
        
        // Creating a div element
        var editor = document.createElement("div");
        editor.style.height = "75%";
        editor.style.width = "43%";
        editor.style.position = "absolute";
        editor.style.top = "5%";
        editor.style.right = "0px";
        editor.style.display = "initial";
        editor.id = "editor";

        document.body.appendChild(editor);

        return editor;
    }

    private async _main(): Promise<void> {
        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}
new App();