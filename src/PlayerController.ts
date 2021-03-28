import * as BABYLON from '@babylonjs/core';
import { CBObject } from "./CBObject";
import { SceneManager } from "./SceneManager";

export class PlayerController {

    private _navigationPlugin: BABYLON.RecastJSPlugin;

    constructor(scene, playerMesh) {
        this._navigationPlugin = new BABYLON.RecastJSPlugin();

        this.BakeNavMesh(scene);

        let crowd = this._navigationPlugin.createCrowd(1, 0.35, scene);
        let agentParameters = {
            radius: 0.35,
            height: 1.7,
            maxAcceleration: 4,
            maxSpeed: 2,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0
        };

        let transform = new BABYLON.TransformNode("agent");
        crowd.addAgent(BABYLON.Vector3.Zero(), agentParameters, transform);
        playerMesh.parent = transform;

        let startingPoint;
        let getGroundPosition = () => {
            let pickinfo = scene.pick(scene.pointerX, scene.pointerY);
            if (pickinfo.hit) {
                return pickinfo.pickedPoint;
            }
            return null;
        }

        let pointerDown = () => {
            startingPoint = getGroundPosition();
            if (startingPoint) {
                var agents = crowd.getAgents();
                agents.forEach(agent => {
                    crowd.agentGoto(agent, this._navigationPlugin.getClosestPoint(startingPoint));
                });
            }
        }

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.pickInfo.hit && pointerInfo.event.button == 0) {
                        pointerDown();
                    }
                    break;
            }
        });

        let camera = scene.getCameraByName("mainCamera");
        camera = this.CreateCameraControls(camera);
        camera.parent = playerMesh;
    }

    private BakeNavMesh(scene: BABYLON.Scene) {
        let parameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 35,
            walkableHeight: 1,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 1,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };

        let navMeshList = []
        scene.meshes.forEach(mesh => {
            if (mesh.name != "player") {
                navMeshList.push(mesh);
            }
        });

        this._navigationPlugin.createNavMesh(navMeshList, parameters);
    }

    private CreateCameraControls(camera: BABYLON.Camera) {
        camera.inputs.remove(camera.inputs.attached.pointers);
        let pointerInput = new BABYLON.ArcRotateCameraPointersInput();
        pointerInput.panningSensibility = 0;
        pointerInput.buttons = [1, 2];
        pointerInput.angularSensibilityX = 300;
        pointerInput.angularSensibilityY = 300;
        camera.inputs.add(pointerInput);
        camera.attachControl();

        return camera;
    }

}