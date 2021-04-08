import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { Environment } from './Environment';
import { GameManager } from "./GameManager";
import { ObjectiveManager } from './ObjectiveManager';
import { Player } from "./Player";
import { RobotManager } from './RobotManager';
import { defaultScene } from './scenes/Default';
window.CANNON = require('cannon');

export class SceneManager {

    public static instance: SceneManager;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;

    private _resizeFunction;

    constructor(engine) {
        if (SceneManager.instance == null) {
            SceneManager.instance = this;
        }
        else {
            return SceneManager.instance;
        }
        this.engine = engine;
        this.scene = new BABYLON.Scene(engine);
        new GameManager();
        new ObjectiveManager();
        new RobotManager();
        this.LoadScene(defaultScene);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    public async LoadScene(sceneFunction: (scene: BABYLON.Scene) => void) {
        //this.engine.displayLoadingUI();
        this.scene.dispose();
        this.scene = new BABYLON.Scene(this.engine);
        new Environment(this.scene, sceneFunction);
        await this.scene.whenReadyAsync();
        //this.engine.hideLoadingUI();
    }

    public EnableResize() {
        this._resizeFunction = setInterval(() => { this.engine.resize(); }, 20);
    }

    public DisableResize() {
        clearInterval(this._resizeFunction);
    }
}