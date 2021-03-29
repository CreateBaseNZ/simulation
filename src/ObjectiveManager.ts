import * as BABYLON from '@babylonjs/core';
import { defaultScene } from "./scenes/Default";
import { SceneManager } from "./SceneManager";
import { Objective } from './Objective';
import { Player } from './Player';

export class ObjectiveManager {

    public static instance: ObjectiveManager;

    private _objectives: Objective[];

    constructor() {
        if (ObjectiveManager.instance == null) {
            ObjectiveManager.instance = this;
        }
        else {
            return ObjectiveManager.instance;
        }

        this._objectives = new Array<Objective>();
    }

    public AddObjective(objective: Objective) {
        this._objectives.push(objective);
    }

    public GetObjectives() {
        return this._objectives;
    }

}