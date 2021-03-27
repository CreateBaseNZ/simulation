import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { RoboticArm } from './roboticArm';
import { Interactable } from './interactable';
import { UIManager } from './uiManager';
import { createPs } from "./particles";
import { alphaScene } from "./scenes/Alpha";
import { CBObject } from "./CBObject";
import { SceneManager } from "./SceneManager";
window.CANNON = require('cannon');

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
        SceneManager.instance.LoadScene(alphaScene);
    }
}