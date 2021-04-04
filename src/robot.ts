import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { Arduino } from './Arduino';
import { RobotManager } from './RobotManager';

export class Robot extends BABYLON.TransformNode {

    public arduino: Arduino;
    protected _effector: BABYLON.AbstractMesh;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene, true);
        this.arduino = new Arduino();
        RobotManager.instance.AddRobot(this);
    }

    public GetEffector() {
        return this._effector;
    }
}