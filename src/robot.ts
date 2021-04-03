import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { Arduino } from './Arduino';
import { RobotManager } from './RobotManager';

export class Robot extends BABYLON.TransformNode {

    public arduino: Arduino;
    protected cost: number;
    protected plaMaterial: BABYLON.StandardMaterial;

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene, true);
        this.plaMaterial = new BABYLON.StandardMaterial("PLA", this._scene);
        this.arduino = new Arduino();
        RobotManager.instance.AddRobot(this);
    }

    public setColor(color: BABYLON.Color3) {
        this.plaMaterial.diffuseColor.copyFrom(color);
    }

    public getColor() {
        return this.plaMaterial.diffuseColor;
    }
}