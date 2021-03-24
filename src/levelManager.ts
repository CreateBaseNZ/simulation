import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { RoboticArm } from './roboticArm';
import { Interactable } from './interactable';
import { UIManager } from './uiManager';
import * as ammo from "ammo.js";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { Material } from "babylonjs/Materials/material";
import { createPs } from "./particles";
import { BabylonFileLoaderConfiguration } from "babylonjs/Loading/Plugins/babylonFileLoader";
window.CANNON = require('cannon');

export enum State { MENU = 0, GAME = 1, SELECT_ROBOT = 3, SELECT_CHALLENGE = 4 }

export class LevelManager {

    public static instance: LevelManager;
    public targetState: State = 1;
    public engine: BABYLON.Engine;

    protected _activeState: State = 1;

    constructor(engine) {
        if (LevelManager.instance == null) {
            LevelManager.instance = this;
        }
        else {
            return LevelManager.instance;
        }
        this.engine = engine;
    }

    public start() {
        //--Create scenes
        var menu = new Menu();
        var game = new Game();
        var selectRobot = new SelectRobot();
        var selectChallenge = new SelectChallenge();

        // Initial scene
        game.begin();

        this.engine.runRenderLoop(() => {
            switch (this.targetState) {
                case State.MENU:
                    this.targetState != this._activeState ? menu.begin() : menu.tick();
                    break;
                case State.GAME:
                    this.targetState != this._activeState ? game.begin() : game.tick();
                    break;
                case State.SELECT_ROBOT:
                    this.targetState != this._activeState ? selectRobot.begin() : selectRobot.tick();
                    break;
                case State.SELECT_CHALLENGE:
                    this.targetState != this._activeState ? selectChallenge.begin() : selectChallenge.tick();
                    break;
                default:
                    break;
            }
            this._activeState = this.targetState
        });
    }
}

export class Menu {

    protected _scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);

    public async begin() {
        //LevelManager.instance.engine.displayLoadingUI();
        //Create environment
        this._scene = new BABYLON.Scene(LevelManager.instance.engine);
        this._scene.clearColor = new BABYLON.Color4(0.7, 0.7, 0.7, 1);
        let camera: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -1), this._scene);
        camera.setTarget(new BABYLON.Vector3(0, 200, 0));
        camera.attachControl();
        camera.inertia = 0;
        camera.speed = 100;
        camera.angularSensibility = 300;
        camera.keysUp.push(87);
        camera.keysDown.push(83);
        camera.keysLeft.push(65);
        camera.keysRight.push(68);
        camera.keysUpward.push(32);
        camera.keysDownward.push(17);

        // Create GUI
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this._scene);
        advancedTexture.idealHeight = 720; //fit our fullscreen ui to this height

        const title = new GUI.TextBlock();
        title.fontSize = 100;
        title.text = "Arduino Simulator";
        title.top = "-200px";
        advancedTexture.addControl(title);

        // Create Start Button
        const startBtn = GUI.Button.CreateSimpleButton("start", "Start");
        startBtn.width = 0.2
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "100px";
        startBtn.thickness = 0;
        startBtn.background = "green";
        advancedTexture.addControl(startBtn);

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            advancedTexture.dispose();
            this._scene.dispose();
            LevelManager.instance.targetState = State.SELECT_ROBOT;
        });

        // Create Options Button
        const optionsBtn = GUI.Button.CreateSimpleButton("options", "Options");
        optionsBtn.height = "40px";
        optionsBtn.width = 0.2
        optionsBtn.color = "white";
        optionsBtn.top = "150px";
        optionsBtn.thickness = 0;
        optionsBtn.background = "green";
        advancedTexture.addControl(optionsBtn);

        //this handles interactions with the start button attached to the scene
        optionsBtn.onPointerDownObservable.add(() => {
        });

        // Create Quit Button
        const quitBtn = GUI.Button.CreateSimpleButton("quit", "Quit");
        quitBtn.height = "40px";
        quitBtn.width = 0.2
        quitBtn.color = "white";
        quitBtn.top = "200px";
        quitBtn.thickness = 0;
        quitBtn.background = "green";
        advancedTexture.addControl(quitBtn);

        //this handles interactions with the start button attached to the scene
        quitBtn.onPointerDownObservable.add(() => {
        });

        //Load in assets
        const box = BABYLON.Mesh.CreateBox("box", 1, this._scene);
        // Wait until loading is complete
        await this._scene.whenReadyAsync();

        //LevelManager.instance.engine.hideLoadingUI();
    }

    public tick() {
        this._scene.render();
    }
}

export class SelectRobot {

    protected _scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);

    public async begin() {
        //LevelManager.engine.displayLoadingUI();
        //Create environment
        this._scene = new BABYLON.Scene(LevelManager.instance.engine);
        this._scene.createDefaultEnvironment();
        let camera: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -1), this._scene);

        // Create GUI
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this._scene);
        advancedTexture.idealHeight = 720; //fit our fullscreen ui to this height

        const title = new GUI.TextBlock();
        title.fontSize = 100;
        title.text = "Select a Robot";
        title.top = "-200px";
        advancedTexture.addControl(title);

        var panel = new GUI.StackPanel();
        advancedTexture.addControl(panel);

        var textblock = new GUI.TextBlock();
        textblock.height = "50px";
        panel.addControl(textblock);

        var addRadio = function (text, parent) {

            var button = new GUI.RadioButton();
            button.width = "20px";
            button.height = "20px";
            button.color = "white";
            button.background = "green";
            button.onIsCheckedChangedObservable.add(function (state) {
                if (state) {
                    textblock.text = "You selected " + text;
                }
            });

            var header = GUI.Control.AddHeader(button, text, "100px", { isHorizontal: true, controlFirst: true });
            header.height = "30px";

            parent.addControl(header);
        }

        addRadio("Robot Arm", panel);
        addRadio("Electric Car", panel);
        addRadio("Drone", panel);

        // Create Options Button
        const optionsBtn = GUI.Button.CreateSimpleButton("options", "Next");
        optionsBtn.height = "40px";
        optionsBtn.width = 0.2
        optionsBtn.color = "white";
        optionsBtn.top = "150px";
        optionsBtn.thickness = 0;
        optionsBtn.background = "green";
        advancedTexture.addControl(optionsBtn);

        //this handles interactions with the start button attached to the scene
        optionsBtn.onPointerDownObservable.add(() => {
            advancedTexture.dispose();
            this._scene.dispose();
            LevelManager.instance.targetState = State.SELECT_CHALLENGE;
        });

        // Wait until loading is complete
        await this._scene.whenReadyAsync();

        //LevelManager.engine.hideLoadingUI();
    }

    public tick() {
        this._scene.render();
    }
}

export class SelectChallenge {

    protected _scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);

    public async begin() {
        //LevelManager.engine.displayLoadingUI();
        //Create environment
        this._scene = new BABYLON.Scene(LevelManager.instance.engine);
        this._scene.createDefaultEnvironment();
        let camera: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -1), this._scene);

        // Create GUI
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this._scene);
        advancedTexture.idealHeight = 720; //fit our fullscreen ui to this height

        const title = new GUI.TextBlock();
        title.fontSize = 100;
        title.text = "Select a Challenge";
        title.top = "-200px";
        advancedTexture.addControl(title);

        var panel = new GUI.StackPanel();
        advancedTexture.addControl(panel);

        var textblock = new GUI.TextBlock();
        textblock.height = "50px";
        panel.addControl(textblock);

        var addRadio = function (text, parent) {

            var button = new GUI.RadioButton();
            button.width = "20px";
            button.height = "20px";
            button.color = "white";
            button.background = "green";
            button.onIsCheckedChangedObservable.add(function (state) {
                if (state) {
                    textblock.text = "You selected " + text;
                }
            });

            var header = GUI.Control.AddHeader(button, text, "100px", { isHorizontal: true, controlFirst: true });
            header.height = "30px";

            parent.addControl(header);
        }

        addRadio("Navigation", panel);
        addRadio("Pick and Place", panel);
        addRadio("Drawing", panel);

        // Create Options Button
        const optionsBtn = GUI.Button.CreateSimpleButton("options", "Next");
        optionsBtn.height = "40px";
        optionsBtn.width = 0.2
        optionsBtn.color = "white";
        optionsBtn.top = "150px";
        optionsBtn.thickness = 0;
        optionsBtn.background = "green";
        advancedTexture.addControl(optionsBtn);

        //this handles interactions with the start button attached to the scene
        optionsBtn.onPointerDownObservable.add(() => {
            advancedTexture.dispose();
            this._scene.dispose();
            LevelManager.instance.targetState = State.GAME;
        });

        // Wait until loading is complete
        await this._scene.whenReadyAsync();

        //LevelManager.engine.hideLoadingUI();
    }

    public tick() {
        this._scene.render();
    }
}

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

        /*var pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, this._scene, [camera]);
        pipeline.samples = 4;
        pipeline.fxaaEnabled = true;
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.1;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;*/

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

        /*createStar(new BABYLON.Vector3(2, 2, 1.5));
        createStar(new BABYLON.Vector3(0, 1.5, 1.5));
        createStar(new BABYLON.Vector3(-1.6, 2.1, 0));
        createStar(new BABYLON.Vector3(0, 3, -1.8));*/

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

        LevelManager.instance.engine.hideLoadingUI();
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


export class Template {

    protected _scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);

    public async begin() {
        LevelManager.instance.engine.displayLoadingUI();
        //Create environment
        this._scene = new BABYLON.Scene(LevelManager.instance.engine);
        this._scene.createDefaultEnvironment();
        let camera: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -1), this._scene);

        // Wait until loading is complete
        await this._scene.whenReadyAsync();

        LevelManager.instance.engine.hideLoadingUI();
    }

    public tick() {
        this._scene.render();
    }
}



