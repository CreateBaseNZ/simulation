import * as BABYLON from '@babylonjs/core';
import { ObjectiveManager } from './ObjectiveManager';
import { Player } from './Player';

export class Environment {
    scene: BABYLON.Scene;
    player: Player;

    constructor(scene: BABYLON.Scene, sceneFunction: (scene: BABYLON.Scene) => void) {
        this.scene = scene;
        this.CreateEnvironmentDefaults(scene);
        sceneFunction(scene);
        this.player = new Player(scene);
        this.EvaluateEnvironment(scene);
    }

    private CreateEnvironmentDefaults(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.

        scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);
        scene.shadowsEnabled = true;
        scene.collisionsEnabled = true;
        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("http://localhost:5000/skybox/Country.env", scene);

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        const glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.5;

        const camera = new BABYLON.ArcRotateCamera("mainCamera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 3;
        camera.upperRadiusLimit = 30;
        camera.lowerBetaLimit = 0;
        camera.upperBetaLimit = Math.PI / 2;
        camera.inertia = 0;
        camera.wheelPrecision = 5;

        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(1, 1, 0), scene);
        hemiLight.diffuse = new BABYLON.Color3(0.95, 0.98, 0.97);
        hemiLight.intensity = 0.5;

        const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-30, -40, 0), scene);
        directionalLight.diffuse = new BABYLON.Color3(0.95, 0.98, 0.97);
        directionalLight.intensity = 0.5;
        directionalLight.shadowMinZ = 0;
        directionalLight.shadowMaxZ = 100;
    }

    private async EvaluateEnvironment(scene: BABYLON.Scene) {
        await scene.whenReadyAsync();
        ObjectiveManager.instance.GetObjectives().forEach(objective => {
            this.player.mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                        parameter: objective
                    },
                    () => {
                        objective.mesh.dispose();
                    },
                ),
            );
        });

    }
}