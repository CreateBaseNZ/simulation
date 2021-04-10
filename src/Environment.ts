import * as BABYLON from '@babylonjs/core';
import { ObjectiveManager } from './ObjectiveManager';
import { Player } from './Player';
import { RobotManager } from './RobotManager';
import { request } from "@octokit/request";
import { SceneManager } from './SceneManager';
import * as MATERIALS from '@babylonjs/materials';


export class Environment {
    scene: BABYLON.Scene;
    player: Player;
    staticShadowGenerator: BABYLON.ShadowGenerator;
    dynamicShadowGenerator: BABYLON.ShadowGenerator;

    constructor(scene: BABYLON.Scene, sceneFunction: (scene: BABYLON.Scene) => void) {
        this.scene = scene;
        this.CreateEnvironmentDefaults(scene);
        sceneFunction(scene);
        this.player = new Player(scene);
        this.EvaluateEnvironment(scene);
    }

    private async CreateEnvironmentDefaults(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.
        scene.clearColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
        scene.shadowsEnabled = true;
        scene.collisionsEnabled = true;

        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/skybox/Country.env", scene, '.env');

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        const glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.5;

        const staticDirectionalLight = new BABYLON.DirectionalLight("staticDirectionalLight", new BABYLON.Vector3(-0.75, -1, 0), scene);
        staticDirectionalLight.diffuse = new BABYLON.Color3(1, 1, 0.98);
        staticDirectionalLight.intensity = 5;
        staticDirectionalLight.shadowMinZ = -1;
        staticDirectionalLight.shadowMaxZ = 50;

        const dynamicDirectionalLight = new BABYLON.DirectionalLight("dynamicDirectionalLight", new BABYLON.Vector3(-0.75, -1, 0), scene);
        dynamicDirectionalLight.diffuse = new BABYLON.Color3(1, 1, 0.98);
        dynamicDirectionalLight.intensity = 5;
        dynamicDirectionalLight.shadowMinZ = -1;
        dynamicDirectionalLight.shadowMaxZ = 50;

        // Shadows
        let createShadowGenerator = (light: BABYLON.IShadowLight) => {
            let shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
            shadowGenerator.bias = 0.001;
            shadowGenerator.normalBias = 0.02;
            shadowGenerator.useContactHardeningShadow = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.05;
            shadowGenerator.setDarkness(0);
            return shadowGenerator;
        }
        this.staticShadowGenerator = createShadowGenerator(staticDirectionalLight);
        this.dynamicShadowGenerator = createShadowGenerator(dynamicDirectionalLight);
    }

    private async EvaluateEnvironment(scene: BABYLON.Scene) {
        await scene.whenReadyAsync();
        ObjectiveManager.instance.SetAllObjectivesActive(this.player.ui.GetAdvancedTexture());
        RobotManager.instance.GetEffectors().forEach(effector => {
            effector.actionManager = new BABYLON.ActionManager(scene);
            ObjectiveManager.instance.GetObjectives().forEach(objective => {
                effector.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        {
                            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                            parameter: objective
                        },
                        () => {
                            if (objective.GetActive()) {
                                ObjectiveManager.instance.RemoveObjective(objective, this.player.ui.GetAdvancedTexture());
                            }
                        },
                    ),
                );
            });
        });

        scene.meshes.forEach(mesh => {
            (scene.getMeshByName("water.001").material as MATERIALS.WaterMaterial).addToRenderList(mesh);
            mesh.receiveShadows = true;
            if (mesh.id == "robot" || mesh.id == "objective") {
                this.dynamicShadowGenerator.addShadowCaster(mesh, true);
            }
            else {
                this.staticShadowGenerator.addShadowCaster(mesh, true);
            }
            this.staticShadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        });
    }
}