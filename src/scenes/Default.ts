import * as BABYLON from "@babylonjs/core";
import { RoboticArm } from "../RoboticArm";
import { CBObject } from "../assets/CBObject";
import { Seashank } from "../assets/Seashank";
import { Star } from "../assets/Star";
import { Vector3 } from "@babylonjs/core";
import * as data from "./project.json";

export let defaultScene = (scene: BABYLON.Scene) => {
    //new CBObject(scene, "default/box/default_floor.babylon", new Vector3(0, 3, 0), undefined, undefined, { physics: true });
    //new CBObject(scene, "default/floor/default_floor.babylon", undefined, undefined, undefined, { frozen: true, physics: true });
    //new Star(scene, new Vector3(-1.3, 1.5, 1.5), Vector3.Zero(), new Vector3(0.006, 0.006, 0.006));
    
    const { assets } = data;
    assets.forEach(element => {
        new CBObject(scene, element.default.url,
            new Vector3(parseFloat(element.position.x), parseFloat(element.position.y), parseFloat(element.position.z)),
            new Vector3(parseFloat(element.rotation.x), parseFloat(element.rotation.y), parseFloat(element.rotation.z)),
            undefined,
            { frozen: element.frozen, physics: element.physics, objective: element.objective });
    });
}

export let prototypeScene = (scene: BABYLON.Scene) => {
    new RoboticArm('roboticArm', scene);
    new Seashank(scene);
    new Star(scene, new Vector3(-1.3, 1.5, 1.5), Vector3.Zero(), new Vector3(0.006, 0.006, 0.006));
    new Star(scene, new Vector3(-1.5, 2, -1.4), Vector3.Zero(), new Vector3(0.006, 0.006, 0.006));
    new Star(scene, new Vector3(1.6, 2.3, -1.1), Vector3.Zero(), new Vector3(0.006, 0.006, 0.006));
}

