import * as BABYLON from '@babylonjs/core';
import { defaultScene } from "./scenes/Default";
import { CBObject } from "./CBObject";
import { SceneManager } from "./SceneManager";

export class GameManager extends CBObject{

    public static instance: GameManager;

    constructor(scene: BABYLON.Scene) {
        super();
        if (GameManager.instance == null) {
            GameManager.instance = this;
        }
        else {
            return GameManager.instance;
        }
    }

    Start(){
        SceneManager.instance.LoadScene(defaultScene);
    }
}