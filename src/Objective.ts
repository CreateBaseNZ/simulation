import * as BABYLON from '@babylonjs/core';
import { ObjectiveManager } from './ObjectiveManager';
import * as GUI from "@babylonjs/gui";

export class Objective {

    public mesh: BABYLON.AbstractMesh;
    private _active: boolean;
    private _controls: GUI.Control[];

    constructor(mesh: BABYLON.AbstractMesh) {
        this.mesh = mesh;
        this._active = false;
        this._controls = new Array<GUI.Control>();
        ObjectiveManager.instance.AddObjective(this);
    }

    public SetActive(active: boolean, advancedTexture: GUI.AdvancedDynamicTexture = null) {
        this._active = active;
        this.mesh.isVisible = active;
        if (this._controls.length == 0) {
            this.CreateLabel(advancedTexture)
        }
        this._controls.forEach(control => {
            control.isVisible = active;
        });
    }

    public GetActive() {
        return this._active;
    }

    public CreateLabel(advancedTexture: GUI.AdvancedDynamicTexture) {
        const rect = new GUI.Rectangle();
        rect.width = "450px";
        rect.height = "120px";
        rect.cornerRadius = 60;
        rect.color = "#fdfdfd";
        rect.thickness = 8;
        rect.background = "#0000ff";
        advancedTexture.addControl(rect);
        rect.linkWithMesh(this.mesh);
        rect.linkOffsetY = -300;

        const label = new GUI.TextBlock();
        label.text = "(" + this.mesh.position.z.toFixed(1) + ", " + this.mesh.position.x.toFixed(1) + ", " + (this.mesh.position.y - 0.9).toFixed(1) + ")";
        label.fontSize = "54px";
        label.text.fontcolor("#fdfdfd");
        rect.addControl(label);

        const target = new GUI.Ellipse();
        target.width = "60px";
        target.height = "60px";
        target.color = "#fdfdfd";
        target.thickness = 8;
        target.background = "#0000ff";
        advancedTexture.addControl(target);
        target.linkWithMesh(this.mesh);

        const line = new GUI.Line();
        line.lineWidth = 8;
        line.color = "#fdfdfd";
        line.y2 = 60;
        line.linkOffsetY = -30;
        advancedTexture.addControl(line);
        line.linkWithMesh(this.mesh);
        line.connectedControl = rect;

        this._controls.push(rect);
        this._controls.push(label);
        this._controls.push(target);
        this._controls.push(line);
    }
}