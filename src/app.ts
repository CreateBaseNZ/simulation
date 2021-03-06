import * as BABYLON from '@babylonjs/core';
import { SceneManager } from "./SceneManager";
import "../public/index.min.css";

export class App {

    // General Entire Application
    private _engine: BABYLON.Engine;

    constructor() {
        // initialize babylon engine
        let canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(canvas, true);
        new SceneManager(this._engine);
        // for resizing
        this._windowResize();
    }

    private async _windowResize(): Promise<void> {
        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}
new App();