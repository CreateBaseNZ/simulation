import * as BABYLON from "@babylonjs/core";
import { RoboticArm } from "../RoboticArm";
import { Star } from "../assets/Star";
import { Buckets } from "../assets/Buckets";
import { Vector3 } from "@babylonjs/core";
import { Seashank } from "../assets/Seashank";
import { CBObject } from "../assets/CBObject";

export let defaultScene = (scene: BABYLON.Scene) => {
    new RoboticArm('roboticArm', scene);
    new CBObject(scene, "default/box/default_box.babylon");
    new CBObject(scene, "default/floor/default_floor.babylon");
}
