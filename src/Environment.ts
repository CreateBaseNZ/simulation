import * as BABYLON from '@babylonjs/core';
import { ObjectiveManager } from './ObjectiveManager';
import { Player } from './Player';
import { RobotManager } from './RobotManager';
import { request } from "@octokit/request";

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

    private async CreateEnvironmentDefaults(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.

        scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);
        scene.shadowsEnabled = true;
        scene.collisionsEnabled = true;
        const result = await request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'CreateBaseNZ',
            repo: 'cb-simulation-model',
            path: '/assets/skybox'
        });
        const sha = result.data[15].sha;
        const result2 = await request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
            owner: 'CreateBaseNZ',
            repo: 'cb-simulation-model',
            file_sha: sha
        });
        let b64URL = 'data:octet/stream;base64,' + result2.data.content;

        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(b64URL, scene, '.env');

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        const glow = new BABYLON.GlowLayer("glow", scene);
        glow.intensity = 0.5;

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
        ObjectiveManager.instance.NextObjective(this.player.ui.GetAdvancedTexture());
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
                                ObjectiveManager.instance.NextObjective(this.player.ui.GetAdvancedTexture());
                            }
                        },
                    ),
                );
            });
        })


    }
}