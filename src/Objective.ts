import * as BABYLON from '@babylonjs/core';
import { GameManager } from './GameManager';
import { ObjectiveManager } from './ObjectiveManager';
import { SceneManager } from "./SceneManager";

export class Objective {

    public mesh: BABYLON.AbstractMesh;

    constructor() {
        ObjectiveManager.instance.AddObjective(this);
    }
}