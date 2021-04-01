import * as BABYLON from '@babylonjs/core';
import { Objective } from './Objective';
import * as GUI from "@babylonjs/gui";

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
            this._objectives[0].SetActive(false, advancedTexture);
            this._objectives[0].mesh.dispose();
            this._objectives.splice(0, 1);
            if (this._objectives.length > 0) {
                this._objectives[0].SetActive(true, advancedTexture);
            }
            else {
                console.log("You Win!");
            }
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