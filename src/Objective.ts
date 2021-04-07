import * as BABYLON from '@babylonjs/core';
import { GameManager } from './GameManager';
import { ObjectiveManager } from './ObjectiveManager';
import { SceneManager } from "./SceneManager";
import * as GUI from "@babylonjs/gui";

export class Objective {

    public mesh: BABYLON.AbstractMesh;
    private _active: boolean;
    private _controls: GUI.Control[];

    constructor() {
        this._active = false;
        this._controls = new Array<GUI.Control>();
        ObjectiveManager.instance.AddObjective(this);
    }

    public SetActive(active: boolean, advancedTexture: GUI.AdvancedDynamicTexture = null) {
        this._active = active;
        this.mesh.isVisible = active;
        if (active) {
            this.CreateLabel(advancedTexture);
        }
        else {
            this._controls.forEach(control => {
                advancedTexture.removeControl(control);
                control.dispose();
                console.log('hello');
            });
        }
    }

    public GetActive() {
        return this._active;
    }

    public CreateLabel(advancedTexture: GUI.AdvancedDynamicTexture) {
        const rect = new GUI.Rectangle();
        rect.width = "150px";
        rect.height = "40px";
        rect.cornerRadius = 20;
        rect.color = "Orange";
        rect.thickness = 4;
        rect.background = "green";
        advancedTexture.addControl(rect);
        rect.linkWithMesh(this.mesh);
        rect.linkOffsetY = -100;

        const label = new GUI.TextBlock();
        label.text = "(" + this.mesh.position.z.toFixed(1) + ", " + this.mesh.position.x.toFixed(1) + ", " + (this.mesh.position.y - 0.6).toFixed(1) + ")";
        rect.addControl(label);

        const target = new GUI.Ellipse();
        target.width = "20px";
        target.height = "20px";
        target.color = "Orange";
        target.thickness = 4;
        target.background = "green";
        advancedTexture.addControl(target);
        target.linkWithMesh(this.mesh);

        const line = new GUI.Line();
        line.lineWidth = 4;
        line.color = "Orange";
        line.y2 = 20;
        line.linkOffsetY = -10;
        advancedTexture.addControl(line);
        line.linkWithMesh(this.mesh);
        line.connectedControl = rect;

        this._controls.push(rect);
        this._controls.push(label);
        this._controls.push(target);
        this._controls.push(line);
    }
}