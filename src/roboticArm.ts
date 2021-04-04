import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { Robot } from "./Robot";

export class RoboticArm extends Robot {

    private servoAngle: number[] = [1, 1, 1, 1].map(x => x * 90);
    private _baseBottom: BABYLON.AbstractMesh;
    private _baseLid: BABYLON.AbstractMesh;
    private _arm1: BABYLON.AbstractMesh;
    private _arm2: BABYLON.AbstractMesh;
    private _arm3: BABYLON.AbstractMesh;
    private joint1: BABYLON.MotorEnabledJoint;
    private joint2: BABYLON.MotorEnabledJoint;
    private joint3: BABYLON.MotorEnabledJoint;
    private joint4: BABYLON.MotorEnabledJoint;

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
        this._baseBottom = new BABYLON.AbstractMesh("baseBottom", scene);
        this._baseLid = new BABYLON.AbstractMesh("baseLid", scene);
        this._arm1 = new BABYLON.AbstractMesh("arm1", scene);
        this._arm2 = new BABYLON.AbstractMesh("arm2", scene);
        this._arm3 = new BABYLON.AbstractMesh("arm3", scene);
        this._createObject(scene);

        scene.executeWhenReady(() => {
            scene.registerAfterRender(() => {
                this.setServoAngle(0, this.arduino.angleB[0]);
                this.setServoAngle(1, this.arduino.angleB[1]);
                this.setServoAngle(2, this.arduino.angleB[2]);
                this.setServoAngle(3, this.arduino.angleB[3]);
            });
        });
    }

    private _createObject(scene) {
        let createNode = (assetName: string) => {
            BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", assetName + ".glb", scene, (meshes, particleSystems, skeletons) => {
                //this._setMaterials(assetName, meshes);

                var baseBottomMeshes = [];
                var baseLidMeshes = [];
                var arm1Meshes = [];
                var arm2Meshes = [];
                var arm3Meshes = [];

                meshes.forEach(mesh => {
                    if (mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
                        mesh.id = "robot";
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
                this._effector = BABYLON.MeshBuilder.CreateSphere("endEffector", { diameter: 0.5 }, scene);

                this._baseBottom.physicsImpostor = new BABYLON.PhysicsImpostor(this._baseBottom, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
                this._baseBottom.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
                this._baseBottom.physicsImpostor.setScalingUpdated();
                this._baseLid.physicsImpostor = new BABYLON.PhysicsImpostor(this._baseLid, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1000 }, scene);
                this._baseLid.physicsImpostor.setScalingUpdated();
                this._arm1.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10 }, scene);
                this._arm1.physicsImpostor.setScalingUpdated();
                this._arm2.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.1 }, scene);
                this._arm2.physicsImpostor.setScalingUpdated();
                this._arm3.physicsImpostor = new BABYLON.PhysicsImpostor(this._arm3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.001 }, scene);
                this._arm3.physicsImpostor.setScalingUpdated();

                this._baseBottom.parent = this;
                this._effector.parent = this._arm3;
                this._baseBottom.position.y += 0.5;
                this._effector.position.y += 0.5;

                var endMat = new BABYLON.StandardMaterial("endMat", scene);
                endMat.alpha = 0.4;
                endMat.emissiveColor = BABYLON.Color3.Blue(); // Glow color
                this._effector.material = endMat;

                this.joint1 = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                    mainPivot: new BABYLON.Vector3(0, 0.565, -0.03),
                    connectedPivot: new BABYLON.Vector3(0, -0.098, 0),
                    mainAxis: new BABYLON.Vector3(1, 0, 0),
                    connectedAxis: new BABYLON.Vector3(1, 0, 0),
                    collision: false,
                });

                this.joint2 = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                    mainPivot: new BABYLON.Vector3(0, 0.565, -0.03),
                    connectedPivot: new BABYLON.Vector3(0, -0.565, -0.03),
                    mainAxis: new BABYLON.Vector3(1, 0, 0),
                    connectedAxis: new BABYLON.Vector3(1, 0, 0),
                    collision: false,
                });

                this.joint3 = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                    mainPivot: new BABYLON.Vector3(0.08, 0.14, -0.02),
                    connectedPivot: new BABYLON.Vector3(0, -0.565, -0.03),
                    mainAxis: new BABYLON.Vector3(1, 0, 0),
                    connectedAxis: new BABYLON.Vector3(1, 0, 0),
                    collision: false,
                });
                this.joint4 = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
                    mainPivot: new BABYLON.Vector3(0, 0.61, 0),
                    connectedPivot: new BABYLON.Vector3(0, 0, 0),
                    mainAxis: new BABYLON.Vector3(0, 1, 0),
                    connectedAxis: new BABYLON.Vector3(0, 1, 0),
                    collision: false,
                });



                this._arm2.physicsImpostor.addJoint(this._arm3.physicsImpostor, this.joint1);
                this._arm1.physicsImpostor.addJoint(this._arm2.physicsImpostor, this.joint2);
                this._baseLid.physicsImpostor.addJoint(this._arm1.physicsImpostor, this.joint3);
                this._baseBottom.physicsImpostor.addJoint(this._baseLid.physicsImpostor, this.joint4);

                this.joint1.setMotor(0);
                this.joint2.setMotor(0);
                this.joint3.setMotor(0);
                this.joint4.setMotor(0);
            });
        }

        createNode("RoboticArm");
    }

    public setServoAngle(servo: number, angle: number) {
        let clamp = (val, min, max) => {
            return val > max ? max : val < min ? min : val;
        }
        angle = clamp(angle, 0, 180);

        let baseAngle = BABYLON.Tools.ToDegrees(this._baseLid.rotationQuaternion.toEulerAngles().y);
        let arm1Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._baseLid.up, this._arm1.up, this._baseLid.right));
        let arm2Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._arm1.up, this._arm2.up, this._arm2.right));
        let arm3Angle = BABYLON.Tools.ToDegrees(BABYLON.Vector3.GetAngleBetweenVectors(this._arm2.up, this._arm3.up, this._arm3.right));

        this.servoAngle = [baseAngle, arm1Angle, arm2Angle, arm3Angle].map(x => x + 90);

        var error = angle - this.servoAngle[servo]
        if (Math.abs(error) > 1) {
            let speed = -Math.sign(error) * 1.5;
            if (servo == 0) { this.joint4.setMotor(speed); }
            else if (servo == 1) { this.joint3.setMotor(speed); }
            else if (servo == 2) { this.joint2.setMotor(speed); }
            else if (servo == 3) { this.joint1.setMotor(speed); }
        }
        else {
            if (servo == 0) { this.joint4.setMotor(0); }
            else if (servo == 1) { this.joint3.setMotor(0); }
            else if (servo == 2) { this.joint2.setMotor(0); }
            else if (servo == 3) { this.joint1.setMotor(0); }
        }
    }
    
}