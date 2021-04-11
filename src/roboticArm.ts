import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { Robot } from "./Robot";
import { request } from "@octokit/request";

export class RoboticArm extends Robot {

    private servoAngles: number[] = [1, 1, 1, 1].map(x => x * 90);
    private _baseBottom: BABYLON.AbstractMesh;
    private _baseLid: BABYLON.AbstractMesh;
    private _arm1: BABYLON.AbstractMesh;
    private _arm2: BABYLON.AbstractMesh;
    private _arm3: BABYLON.AbstractMesh;
    private _joints: BABYLON.MotorEnabledJoint[];

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
        this._baseBottom = new BABYLON.AbstractMesh("baseBottom", scene);
        this._baseLid = new BABYLON.AbstractMesh("baseLid", scene);
        this._arm1 = new BABYLON.AbstractMesh("arm1", scene);
        this._arm2 = new BABYLON.AbstractMesh("arm2", scene);
        this._arm3 = new BABYLON.AbstractMesh("arm3", scene);
        this._joints = new Array<BABYLON.MotorEnabledJoint>();
        this._createObject(scene);

        scene.executeWhenReady(() => {
            setInterval(() => {
                this.setServoAngle([this.arduino.angleB[0], this.arduino.angleB[1], this.arduino.angleB[2], this.arduino.angleB[3]]);
            }, 20);
        });
    }

    private _createObject(scene) {
        let rootURL = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/";
        BABYLON.SceneLoader.ImportMeshAsync(null, rootURL + "/robots/arm/", "arm.glb", scene).then((result) => {
            let sF = 10;
            let meshes = result.meshes;
            let baseBottomMeshes = [];
            let baseLidMeshes = [];
            let arm1Meshes = [];
            let arm2Meshes = [];
            let arm3Meshes = [];

            meshes.forEach(mesh => {
                if (mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
                    mesh.scaling = mesh.scaling.multiplyByFloats(sF, sF, sF);
                    if (mesh.name.includes("BaseBottom")) {
                        baseBottomMeshes.push(mesh);
                    }
                    else if (mesh.name.includes("BaseLid")) {
                        baseLidMeshes.push(mesh);
                    }
                    else if (mesh.name.includes("Arm1")) {
                        arm1Meshes.push(mesh);
                    }
                    else if (mesh.name.includes("Arm2")) {
                        arm2Meshes.push(mesh);
                    }
                    else if (mesh.name.includes("Arm3")) {
                        arm3Meshes.push(mesh);
                    }
                }
            });

            this._baseBottom = BABYLON.Mesh.MergeMeshes(baseBottomMeshes, true, true, undefined, false, true);
            this._baseLid = BABYLON.Mesh.MergeMeshes(baseLidMeshes, true, true, undefined, false, true);
            this._arm1 = BABYLON.Mesh.MergeMeshes(arm1Meshes, true, true, undefined, false, true);
            this._arm2 = BABYLON.Mesh.MergeMeshes(arm2Meshes, true, true, undefined, false, true);
            this._arm3 = BABYLON.Mesh.MergeMeshes(arm3Meshes, true, true, undefined, false, true);
            this._effector = BABYLON.MeshBuilder.CreateSphere("endEffector", { diameter: 0.035 * sF }, scene);

            this._baseBottom.physicsImpostor = new BABYLON.PhysicsImpostor(this._baseBottom, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
            this._baseBottom.physicsImpostor.setScalingUpdated();
            this._baseLid.physicsImpostor = new BABYLON.PhysicsImpostor(this._baseLid, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1000 }, scene);
            this._baseLid.physicsImpostor.setScalingUpdated();
            this._arm1.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10 }, scene);
            this._arm1.physicsImpostor.setScalingUpdated();
            this._arm2.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.1 }, scene);
            this._arm2.physicsImpostor.setScalingUpdated();
            this._arm3.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.001 }, scene);
            this._arm3.physicsImpostor.setScalingUpdated();

            this._baseBottom.id = "robot";
            this._baseLid.id = "robot";
            this._arm1.id = "robot";
            this._arm2.id = "robot";
            this._arm3.id = "robot";

            this._baseBottom.parent = this;
            this._effector.parent = this._arm3;
            this._baseBottom.position.y += 0.033 * sF;
            this._effector.position.y += 0.035 * sF;

            var endMat = new BABYLON.StandardMaterial("endMat", scene);
            endMat.alpha = 0.4;
            endMat.emissiveColor = BABYLON.Color3.Blue(); // Glow color
            this._effector.material = endMat;

            //base joints
            this._joints.push(new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                mainPivot: new BABYLON.Vector3(0, 0.05, 0).multiplyByFloats(sF, sF, sF),
                connectedPivot: new BABYLON.Vector3(0, 0, 0),
                mainAxis: new BABYLON.Vector3(0, 1, 0),
                connectedAxis: new BABYLON.Vector3(0, 1, 0),
                collision: false,
            }));

            this._joints.push(new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                mainPivot: new BABYLON.Vector3(0.008, 0.014, -0.002).multiplyByFloats(sF, sF, sF),
                connectedPivot: new BABYLON.Vector3(0, -0.0565, -0.003).multiplyByFloats(sF, sF, sF),
                mainAxis: new BABYLON.Vector3(1, 0, 0),
                connectedAxis: new BABYLON.Vector3(1, 0, 0),
                collision: false,
            }));

            this._joints.push(new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                mainPivot: new BABYLON.Vector3(0, 0.0565, -0.003).multiplyByFloats(sF, sF, sF),
                connectedPivot: new BABYLON.Vector3(0, -0.0565, -0.003).multiplyByFloats(sF, sF, sF),
                mainAxis: new BABYLON.Vector3(1, 0, 0),
                connectedAxis: new BABYLON.Vector3(1, 0, 0),
                collision: false,
            }));

            //end joint
            this._joints.push(new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                mainPivot: new BABYLON.Vector3(0, 0.0565, -0.003).multiplyByFloats(sF, sF, sF),
                connectedPivot: new BABYLON.Vector3(0, -0.0098, 0).multiplyByFloats(sF, sF, sF),
                mainAxis: new BABYLON.Vector3(1, 0, 0),
                connectedAxis: new BABYLON.Vector3(1, 0, 0),
                collision: false,
            }));

            this._arm2.physicsImpostor.addJoint(this._arm3.physicsImpostor, this._joints[3]);
            this._arm1.physicsImpostor.addJoint(this._arm2.physicsImpostor, this._joints[2]);
            this._baseLid.physicsImpostor.addJoint(this._arm1.physicsImpostor, this._joints[1]);
            this._baseBottom.physicsImpostor.addJoint(this._baseLid.physicsImpostor, this._joints[0]);
        });
    }


    public setServoAngle(angles: number[]) {
        let clamp = (val, min, max) => {
            return val > max ? max : val < min ? min : val;
        }
        angles.map(angle => clamp(angle, 0, 180));

        let baseAngle = BABYLON.Tools.ToDegrees(this._baseLid.rotationQuaternion.toEulerAngles().y);
        let arm1Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._baseLid.up, this._arm1.up, this._baseLid.right));
        let arm2Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._arm1.up, this._arm2.up, this._arm2.right));
        let arm3Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._arm2.up, this._arm3.up, this._arm3.right));

        this.servoAngles = [baseAngle, arm1Angle, arm2Angle, arm3Angle].map(x => x + 90);

        let errors = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            errors[i] = angles[i] - this.servoAngles[i];

            let absErrors = errors.map(error => Math.abs(error));

            if (absErrors[i] > 0.25) {
                let weight = 1;
                if (absErrors[i] > 0.25) { weight = 0.05; }
                if (absErrors[i] > 0.5) { weight = 0.25; }
                if (absErrors[i] > 1) { weight = 1; }
                if (absErrors[i] > 5) { weight = 2; }

                let speed = -Math.sign(errors[i]) * weight;
                this._joints[i].setMotor(speed);
            }
            else {
                this._joints[i].setMotor(0);
            }
        }
    }

}