import * as BABYLON from '@babylonjs/core';
import { AbstractMesh, TransformNode } from 'babylonjs';
import { Robot } from './robot';
import { UIManager } from './uiManager';

export class Interactable {

    constructor(scene: BABYLON.Scene) {
        let ground: BABYLON.AbstractMesh = scene.getMeshByName("ground");
        let startingPoint;
        let currentMesh;
        let camera: BABYLON.Camera = scene.getCameraByName("camera");

        let getGroundPosition = () => {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground });
            if (pickinfo.hit) {
                return pickinfo.pickedPoint;
            }

            return null;
        }

        let pointerDoubleTap = () => {
            if (currentMesh != null) {
                (currentMesh as TransformNode).getChildMeshes().forEach(child => {
                    //child.outlineWidth = 1;
                    //child.outlineColor = BABYLON.Color3.Black();
                });
            }
        }

        let pointerDown = (mesh) => {
            if (currentMesh != null) {
                (currentMesh as TransformNode).getChildMeshes().forEach(child => {
                    //child.outlineWidth = 1;
                    //child.outlineColor = BABYLON.Color3.Black();
                });
            }

            currentMesh = mesh.parent;
            while (currentMesh.parent != null) {
                currentMesh = currentMesh.parent;
            }

            (currentMesh as TransformNode).getChildMeshes().forEach(child => {
                //child.outlineWidth = 1.5;
                //child.outlineColor = BABYLON.Color3.Purple();
            });

            try {
                UIManager.instance.selectedRobot = (currentMesh as Robot);
                UIManager.instance.ide.setText((currentMesh as Robot).arduino.code);
                UIManager.instance.colorPicker.value = ((currentMesh as Robot).getColor());
            }
            catch (error) {
            }

            startingPoint = getGroundPosition();
            if (startingPoint) { // we need to disconnect camera from canvas
                setTimeout(() => {
                    camera.detachControl();
                }, 0);
            }

        }

        let pointerUp = () => {
            if (startingPoint) {
                camera.attachControl();
                startingPoint = null;
                return;
            }
        }

        let pointerMove = () => {
            if (!startingPoint) {
                return;
            }
            var current = getGroundPosition();
            if (!current) {
                return;
            }

            var diff = current.subtract(startingPoint);
            currentMesh.position.addInPlace(diff);

            startingPoint = current;
        }

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                    if (pointerInfo.pickInfo.pickedMesh.id != "robot") {
                        pointerDoubleTap();
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.pickInfo.hit && pointerInfo.event.button == 0 && pointerInfo.pickInfo.pickedMesh.id == "robot") {
                        pointerDown(pointerInfo.pickInfo.pickedMesh)
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    pointerUp();
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    pointerMove();
                    break;

            }
        });
    }
}
