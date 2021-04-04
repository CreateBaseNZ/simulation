import * as BABYLON from '@babylonjs/core';

export class PlayerController {

    private _navigationPlugin: BABYLON.RecastJSPlugin;

    constructor(scene) {
        this._navigationPlugin = new BABYLON.RecastJSPlugin();

        this.BakeNavMesh(scene);
    }

    public CreateNavAgent(scene: BABYLON.Scene) {
        let crowd = this._navigationPlugin.createCrowd(1, 0.35, scene);
        let agentParameters = {
            radius: 0.35,
            height: 1.7,
            maxAcceleration: 10,
            maxSpeed: 2,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0
        };

        let transform = new BABYLON.TransformNode("agent");
        crowd.addAgent(BABYLON.Vector3.Zero(), agentParameters, transform);
        crowd.agentTeleport(0, new BABYLON.Vector3(0, 0, 3));
        this.CreateAgentControls(crowd, scene);

        return transform;
    }

    private CreateAgentControls(crowd: BABYLON.ICrowd, scene: BABYLON.Scene) {
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
                    crowd.agentGoto(agent, startingPoint);
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
    }

    private BakeNavMesh(scene: BABYLON.Scene) {
        var parameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 35,
            walkableHeight: 1,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12.,
            maxSimplificationError: 0.1,
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

    public CreateCameraControls(camera: BABYLON.Camera) {
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