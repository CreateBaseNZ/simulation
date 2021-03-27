import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { RoboticArm } from './roboticArm';
import { Interactable } from './interactable';
import { UIManager } from './uiManager';
import { createPs } from "./particles";
import { CBObject } from "./CBObject";
import { GameManager } from "./GameManager";
window.CANNON = require('cannon');

export class SceneManager {

    public static instance: SceneManager;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;

    public objects: CBObject[];

    constructor(engine) {
        if (SceneManager.instance == null) {
            SceneManager.instance = this;
        }
        else {
            return SceneManager.instance;
        }
        this.engine = engine;
        this.scene = new BABYLON.Scene(engine);
        this.objects = new Array<CBObject>();
    }

    public Start() {
        new GameManager(this.scene);
        setInterval(() => {
            this.objects.forEach(object => {
                object.FixedUpdate();
            });
        }, 20);
        this.engine.runRenderLoop(() => {

            this.objects.forEach(object => {
                object.Update();
            });

            this.scene.render();

            this.objects.forEach(object => {
                object.LateUpdate();
            });
        });

    }

    public async LoadScene(sceneFunction: (scene: BABYLON.Scene) => void) {
        this.engine.displayLoadingUI();
        this.scene.dispose();
        this.scene = new BABYLON.Scene(this.engine);
        this.CreateEnvironment(this.scene);
        sceneFunction(this.scene);
        await this.scene.whenReadyAsync();
        this.engine.hideLoadingUI();
    }

    private CreateEnvironment(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.
        scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
        scene.shadowsEnabled = true;
        scene.collisionsEnabled = true;
        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("http://localhost:5000/skybox/Country.env", scene);

        const glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.5;

        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl();
        camera.lowerRadiusLimit = 3;
        camera.upperRadiusLimit = 20;
        camera.wheelPrecision = 20;

        const hemiLight = new BABYLON.HemisphericLight("HemiLight1", new BABYLON.Vector3(1, 1, 0), scene);
        hemiLight.diffuse = new BABYLON.Color3(0.95, 0.98, 0.97);
        hemiLight.intensity = 0.4;

        const pointLight = new BABYLON.PointLight("PointLight", new BABYLON.Vector3(30, 20, 10), scene);
        pointLight.diffuse = new BABYLON.Color3(1, 1, 1);
        pointLight.intensity = 1;
        pointLight.shadowMinZ = 0;
        pointLight.shadowMaxZ = 100;

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());
    }
}


/*
export class Game {

    protected _scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);
    protected _robots: RoboticArm[];
    private _physics = false;

    constructor() {
        this._robots = [];
        this._scene = new BABYLON.Scene(LevelManager.instance.engine);
        //--GAME INITALISATION LOGIC
        this._scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
        this._scene.shadowsEnabled = false;
        this._scene.collisionsEnabled = true;
        this._physics = true;
    }

    public async begin() {
        LevelManager.instance.engine.displayLoadingUI();

        var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        this._scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        var gl = new BABYLON.GlowLayer("glow", this._scene);
        gl.intensity = 0.5;

        var hemiLight1 = new BABYLON.HemisphericLight("HemiLight1", new BABYLON.Vector3(1, 1, 0), this._scene);
        hemiLight1.diffuse = new BABYLON.Color3(0.98, 0.9, 0.9);
        hemiLight1.intensity = 0.8;

        var pointLight = new BABYLON.PointLight("PointLight", new BABYLON.Vector3(30, 20, 10), this._scene);
        pointLight.diffuse = new BABYLON.Color3(1, 1, 1);
        pointLight.intensity = 1.4;
        pointLight.shadowMinZ = 0;
        pointLight.shadowMaxZ = 100;

        var groundMaterial = new BABYLON.StandardMaterial("Ground", this._scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("http://localhost:5000/textures/T_FactoryConcreteFloor01_BC.BMP", this._scene);
        groundMaterial.bumpTexture = new BABYLON.Texture("http://localhost:5000/textures/T_FactoryConcreteFloor01_N.BMP", this._scene);
        (groundMaterial.diffuseTexture as BABYLON.Texture).uScale = 50.0;
        (groundMaterial.diffuseTexture as BABYLON.Texture).vScale = 50.0;
        (groundMaterial.bumpTexture as BABYLON.Texture).uScale = 50.0;
        (groundMaterial.bumpTexture as BABYLON.Texture).vScale = 50.0;

        const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 100, height: 0.01, depth: 100 }, this._scene);
        ground.material = groundMaterial;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, this._scene);
        ground.position.y -= 0.6;

        var matMaterial = new BABYLON.StandardMaterial("Mat", this._scene);
        matMaterial.diffuseTexture = new BABYLON.Texture("http://localhost:5000/textures/T_FloorMats01_BC.BMP", this._scene);
        matMaterial.bumpTexture = new BABYLON.Texture("http://localhost:5000/textures/T_FloorMats01_N.BMP", this._scene);
        (matMaterial.diffuseTexture as BABYLON.Texture).uScale = -0.48;
        (matMaterial.diffuseTexture as BABYLON.Texture).vScale = 0.48;
        (matMaterial.bumpTexture as BABYLON.Texture).uScale = -0.48;
        (matMaterial.bumpTexture as BABYLON.Texture).vScale = 0.48;

        var shadowGenerator = new BABYLON.ShadowGenerator(4096, pointLight);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;

        var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { segments: 100, diameter: 20000 }, this._scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("http://localhost:5000/skybox/06/sky6", this._scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("http://localhost:5000/skybox/Country.env", this._scene);
        this._scene.environmentTexture = hdrTexture;

        let camera: BABYLON.FreeCamera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(5, 5, -5), this._scene);
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        camera.attachControl();
        camera.minZ = 0;
        camera.maxZ = 50000;
        camera.inertia = 0;
        camera.speed = 1;
        camera.angularSensibility = 300;
        camera.keysUp.push(87);
        camera.keysDown.push(83);
        camera.keysLeft.push(65);
        camera.keysRight.push(68);
        camera.keysUpward.push(32);
        camera.keysDownward.push(17);

        var pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, this._scene, [camera]);
        pipeline.samples = 4;
        pipeline.fxaaEnabled = true;
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.1;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;

        // Enable interaction
        new Interactable(this._scene);
        // Create the GUI
        new UIManager(this._scene, this._robots);

        // Create robot
        let robot = new RoboticArm("roboticArm", this._scene);
        await this._scene.whenReadyAsync();
        this._robots.push(robot);

        let createStar = (position: BABYLON.Vector3) => {
            BABYLON.SceneLoader.LoadAssetContainer("http://localhost:5000/", "Star.glb", this._scene, (container) => {
                var starMaterial = new BABYLON.StandardMaterial("Star", this._scene);
                starMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
                starMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.75, 0.2);

                var newMeshes = container.meshes;
                newMeshes.forEach(mesh => {
                    if (mesh.parent) {
                        mesh.outlineWidth = 1;
                        mesh.outlineColor = BABYLON.Color3.Black();
                        mesh.renderOutline = true;
                        mesh.scaling = new BABYLON.Vector3(0.006, 0.006, -0.006);
                        mesh.material = starMaterial;
                        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, }, this._scene);
                        mesh.physicsImpostor.setScalingUpdated();
                        mesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 1, 0));
                        mesh.actionManager = new BABYLON.ActionManager(this._scene);
                        createPs(mesh, this._scene);
                        let codeAction = (triggerMesh) => {
                            return new BABYLON.ExecuteCodeAction(
                                {
                                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                                    parameter: triggerMesh,
                                },
                                () => {
                                    UIManager.instance.collectedStars++;
                                    mesh.parent.dispose();
                                },
                            );
                        }
                        mesh.actionManager.registerAction(codeAction(this._robots[0]._arm3));
                        mesh.actionManager.registerAction(codeAction(this._robots[0]._arm2));
                        mesh.actionManager.registerAction(codeAction(this._robots[0]._arm1));

                    }
                    if (!mesh.parent) {
                        mesh.position = position;
                    }
                });
                container.addAllToScene();
            });
        }

        let importRobot = (file: string) => {
            BABYLON.SceneLoader.ImportMesh(null, "http://localhost:5000/", file, this._scene, (meshes) => {
                meshes.forEach(mesh => {
                    mesh.position = new BABYLON.Vector3(-10, -0.6, 0);
                    mesh.renderOutline = true;
                    mesh.outlineWidth = 0.01;
                    mesh.outlineColor = BABYLON.Color3.Black();
                    mesh.id = "robot";
                });
            });
        }
        //importRobot("SK_Drone.glb");

        let box = BABYLON.Mesh.CreateBox("box", 1, this._scene);
        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 });
        box.position = new BABYLON.Vector3(0, 0, -2);

        createStar(new BABYLON.Vector3(2, 2, 1.5));
        createStar(new BABYLON.Vector3(0, 1.5, 1.5));
        createStar(new BABYLON.Vector3(-1.6, 2.1, 0));
        createStar(new BABYLON.Vector3(0, 3, -1.8));

        //--GAME INITALISATION LOGIC
        await this._scene.whenReadyAsync();

        let physicsViewer = new BABYLON.PhysicsViewer(this._scene);
        this._scene.meshes.forEach(mesh => {
            if (mesh.name != "__root__") {
                mesh.receiveShadows = true;
                shadowGenerator.getShadowMap().renderList.push(mesh);
            }
            if (mesh.physicsImpostor) {
                physicsViewer.showImpostor(mesh.physicsImpostor, mesh as BABYLON.Mesh);
            }
        })

        SceneManager.instance.engine.hideLoadingUI();
    }

    public tick() {

        this._robots.forEach(robot => {
            robot.setServoAngle(0, robot.arduino.angleB[0]);
            robot.setServoAngle(1, robot.arduino.angleB[1]);
            robot.setServoAngle(2, robot.arduino.angleB[2]);
            robot.setServoAngle(3, robot.arduino.angleB[3]);
        });

        UIManager.instance.tick();
        this._scene.render();
    }
}
*/




