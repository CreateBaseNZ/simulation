import * as BABYLON from '@babylonjs/core';
import { CBObject } from "./CBObject";
import { SceneManager } from "./SceneManager";

export class Player extends CBObject{

    public playerMesh: BABYLON.AbstractMesh;

    constructor(scene){
        super();

        let capsuleOptions = {subdivisions: 10, tessellation: 10, height: 1.7, radius: 0.35, capSubdivisions: 10};
        this.playerMesh = BABYLON.MeshBuilder.CreateCapsule("player", capsuleOptions, scene)
    }

    Start(){

    }

}