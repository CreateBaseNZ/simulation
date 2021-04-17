import * as BABYLON from '@babylonjs/core';
import { Objective } from './Objective';
import * as GUI from "@babylonjs/gui";
import { GameManager } from './GameManager';

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

    public NextObjective(advancedTexture: GUI.AdvancedDynamicTexture = null) {
        if (this._objectives[0].GetActive() == false) {
            this._objectives[0].SetActive(true, advancedTexture);
        }
        else {
            this.RemoveObjective();
            if (this._objectives.length > 0) {
                this._objectives[0].SetActive(true, advancedTexture);
            }
            else {
                GameManager.instance.WinGame();
            }
        }
    }

    public RemoveObjective(objective: Objective = this._objectives[0], advancedTexture: GUI.AdvancedDynamicTexture = null) {
        this._objectives.splice(this._objectives.indexOf(objective), 1);
        objective.SetActive(false, advancedTexture);
        if (this._objectives.length == 0) {
            GameManager.instance.WinGame();
        }
    }

    public AddObjective(objective: Objective) {
        this._objectives.push(objective);
    }

    public SetAllObjectivesActive(advancedTexture: GUI.AdvancedDynamicTexture = null) {
        this._objectives.forEach(objective => {
            objective.SetActive(true, advancedTexture);
        });
    }

    public GetObjectives() {
        return this._objectives;
    }

}