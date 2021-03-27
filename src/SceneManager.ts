import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { CBObject } from "./CBObject";
import { GameManager } from "./GameManager";
import { Player } from "./Player";
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
        this.PostEnvironment(this.scene);
        this.engine.hideLoadingUI();
    }

    private CreateEnvironment(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.
        const player = new Player(scene);

        scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
        scene.shadowsEnabled = true;
        scene.collisionsEnabled = true;
        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("http://localhost:5000/skybox/Country.env", scene);

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        const glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.5;

        const camera = new BABYLON.ArcRotateCamera("camera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
        camera.parent = player.playerMesh;
        camera.lowerRadiusLimit = 3;
        camera.upperRadiusLimit = 30;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.inertia = 0;
        camera.wheelPrecision = 5;
        camera.inputs.remove(camera.inputs.attached.pointers);
        let pointerInput = new BABYLON.ArcRotateCameraPointersInput();
        pointerInput.panningSensibility = 0;
        pointerInput.buttons = [1, 2];
        pointerInput.angularSensibilityX = 300;
        pointerInput.angularSensibilityY = 300;
        camera.inputs.add(pointerInput);
        camera.attachControl();

        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(1, 1, 0), scene);
        hemiLight.diffuse = new BABYLON.Color3(0.95, 0.98, 0.97);
        hemiLight.intensity = 0.4;

        const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-30, -40, 0), scene);
        directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
        directionalLight.intensity = 1;
        directionalLight.shadowMinZ = 0;
        directionalLight.shadowMaxZ = 100;
    }

    private PostEnvironment(scene: BABYLON.Scene) {
        let navigationPlugin = new BABYLON.RecastJSPlugin();
        var parameters = {
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
        scene.getActiveMeshes().forEach(mesh => {
            if (mesh.name != "player") {
                navMeshList.push(mesh);
            }
        })
        navigationPlugin.createNavMesh(navMeshList, parameters);
        let navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
        navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
        var matdebug = new BABYLON.StandardMaterial('matdebug', scene);
        matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
        matdebug.alpha = 0.2;
        navmeshdebug.material = matdebug;

        var crowd = navigationPlugin.createCrowd(1, 0.35, scene);
        var agentParameters = {
            radius: 0.35,
            height: 1.7,
            maxAcceleration: 4,
            maxSpeed: 2,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0
        };

        var transform = new BABYLON.TransformNode("agent");
        crowd.addAgent(BABYLON.Vector3.Zero(), agentParameters, transform);
        scene.getMeshByName("player").parent = transform;
        var startingPoint;

        var getGroundPosition = () => {
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
            if (pickinfo.hit) {
                return pickinfo.pickedPoint;
            }

            return null;
        }

        var pointerDown = () => {
            startingPoint = getGroundPosition();
            if (startingPoint) {
                var agents = crowd.getAgents();
                agents.forEach(agent => {
                    crowd.agentGoto(agent, navigationPlugin.getClosestPoint(startingPoint));
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
        return scene;
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




