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
        //this.ApplyPostProcessingEffects(scene);
    }

    private async CreateEnvironmentDefaults(scene: BABYLON.Scene) {
        // These are the default components that EVERY scene should have.
        scene.clearColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
        scene.shadowsEnabled = false;
        scene.collisionsEnabled = true;

        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/skybox/Country.env", scene, '.env');

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());

        var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { segments: 1, diameter: 300 }, scene);
        skybox.infiniteDistance = true;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;

        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/assets/skybox/custom/custom", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const staticDirectionalLight = new BABYLON.DirectionalLight("staticDirectionalLight", new BABYLON.Vector3(-0.75, -1, 0), scene);
        staticDirectionalLight.diffuse = new BABYLON.Color3(1, 1, 0.98);
        staticDirectionalLight.intensity = 3;
        staticDirectionalLight.shadowMinZ = -1;
        staticDirectionalLight.shadowMaxZ = 50;

        const dynamicDirectionalLight = new BABYLON.DirectionalLight("dynamicDirectionalLight", new BABYLON.Vector3(-0.75, -1, 0), scene);
        dynamicDirectionalLight.diffuse = new BABYLON.Color3(1, 1, 0.98);
        dynamicDirectionalLight.intensity = 3;
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
        ObjectiveManager.instance.SetAllObjectivesActive(this.player.hud.GetAdvancedTexture());
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
                                ObjectiveManager.instance.RemoveObjective(objective, this.player.hud.GetAdvancedTexture());
                            }
                        },
                    ),
                );
            });
        });

        scene.meshes.forEach(mesh => {
            (scene.getMeshByName("Water Cube").material as MATERIALS.WaterMaterial).addToRenderList(mesh);
            mesh.receiveShadows = true;
            mesh.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
            if (mesh.id == "robot" || mesh.id == "objective") {
                this.dynamicShadowGenerator.addShadowCaster(mesh, true);
            }
            else {
                this.staticShadowGenerator.addShadowCaster(mesh, true);
            }
            this.staticShadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        });

        scene.activeCameras = [scene.getCameraByName("mainCamera"), scene.getCameraByName("uiCamera")];
    }

    private ApplyPostProcessingEffects(scene: BABYLON.Scene) {
        let mainCamera = scene.getCameraByName("mainCamera");
        let motionBlur = new BABYLON.MotionBlurPostProcess('mb', scene, 1, mainCamera);
        motionBlur.motionStrength = 0.01;
        motionBlur.isObjectBased = false;
        let defaultPipeline = new BABYLON.DefaultRenderingPipeline(
            "DefaultRenderingPipeline",
            true, // is HDR?
            scene,
            [mainCamera]
        );
        if (defaultPipeline.isSupported) {
            /* MSAA */
            defaultPipeline.samples = 1; // 1 by default
            /* imageProcessing */
            defaultPipeline.imageProcessingEnabled = true; //true by default
            if (defaultPipeline.imageProcessingEnabled) {
                defaultPipeline.imageProcessing.contrast = 1.6; // 1 by default
                defaultPipeline.imageProcessing.exposure = 1; // 1 by default
                /* color grading */
                defaultPipeline.imageProcessing.colorGradingEnabled = false; // false by default
                if (defaultPipeline.imageProcessing.colorGradingEnabled) {
                    // using .3dl (best) :
                    defaultPipeline.imageProcessing.colorGradingTexture = new BABYLON.ColorGradingTexture("textures/LateSunset.3dl", scene);
                    // using .png :
                    /*
                    var colorGradingTexture = new BABYLON.Texture("textures/colorGrade-highContrast.png", scene, true, false);
                    colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                    colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;                
                    defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                    defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false;
                    */
                }
                /* color curves */
                defaultPipeline.imageProcessing.colorCurvesEnabled = true; // false by default
                if (defaultPipeline.imageProcessing.colorCurvesEnabled) {
                    var curve = new BABYLON.ColorCurves();
                    curve.globalDensity = 0; // 0 by default
                    curve.globalExposure = 0; // 0 by default
                    curve.globalHue = 30; // 30 by default
                    curve.globalSaturation = 0; // 0 by default
                    curve.highlightsDensity = 0; // 0 by default
                    curve.highlightsExposure = 0; // 0 by default
                    curve.highlightsHue = 30; // 30 by default
                    curve.highlightsSaturation = 0; // 0 by default
                    curve.midtonesDensity = 0; // 0 by default
                    curve.midtonesExposure = 0; // 0 by default
                    curve.midtonesHue = 30; // 30 by default
                    curve.midtonesSaturation = 0; // 0 by default
                    curve.shadowsDensity = 0; // 0 by default
                    curve.shadowsExposure = 0; // 0 by default
                    curve.shadowsHue = 100; // 30 by default
                    curve.shadowsSaturation = 100; // 0 by default;
                    defaultPipeline.imageProcessing.colorCurves = curve;
                }
            }
            /* bloom */
            defaultPipeline.bloomEnabled = true; // false by default
            if (defaultPipeline.bloomEnabled) {
                defaultPipeline.bloomKernel = 32; // 64 by default
                defaultPipeline.bloomScale = 0.3; // 0.5 by default
                defaultPipeline.bloomThreshold = 0.9; // 0.9 by default
                defaultPipeline.bloomWeight = 0.05; // 0.15 by default
            }
            /* chromatic abberation */
            defaultPipeline.chromaticAberrationEnabled = false; // false by default
            if (defaultPipeline.chromaticAberrationEnabled) {
                defaultPipeline.chromaticAberration.aberrationAmount = 2; // 30 by default
                defaultPipeline.chromaticAberration.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.chromaticAberration.alphaMode = 0; // 0 by default
                defaultPipeline.chromaticAberration.alwaysForcePOT = false; // false by default
                defaultPipeline.chromaticAberration.enablePixelPerfectMode = false; // false by default
                defaultPipeline.chromaticAberration.forceFullscreenViewport = true; // true by default
            }
            /* DOF */
            defaultPipeline.depthOfFieldEnabled = false; // false by default
            if (defaultPipeline.depthOfFieldEnabled && defaultPipeline.depthOfField.isSupported) {
                defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.High; // 0 by default
                defaultPipeline.depthOfField.fStop = 1.4; // 1.4 by default
                defaultPipeline.depthOfField.focalLength = 300; // 50 by default, mm
                defaultPipeline.depthOfField.focusDistance = 25000; // 2000 by default, mm
                defaultPipeline.depthOfField.lensSize = 50; // 50 by default
            }
            /* FXAA */
            defaultPipeline.fxaaEnabled = true; // false by default
            if (defaultPipeline.fxaaEnabled) {
                defaultPipeline.fxaa.samples = 32; // 1 by default
                defaultPipeline.fxaa.adaptScaleToCurrentViewport = false; // false by default
            }
            /* glowLayer */
            defaultPipeline.glowLayerEnabled = true;
            if (defaultPipeline.glowLayerEnabled) {
                defaultPipeline.glowLayer.blurKernelSize = 8; // 16 by default
                defaultPipeline.glowLayer.intensity = 0.5; // 1 by default
            }
            /* grain */
            defaultPipeline.grainEnabled = false;
            if (defaultPipeline.grainEnabled) {
                defaultPipeline.grain.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.grain.animated = false; // false by default
                defaultPipeline.grain.intensity = 30; // 30 by default
            }
            /* sharpen */
            defaultPipeline.sharpenEnabled = false;
            if (defaultPipeline.sharpenEnabled) {
                defaultPipeline.sharpen.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.sharpen.edgeAmount = 0.1; // 0.3 by default
                defaultPipeline.sharpen.colorAmount = 1; // 1 by default
            }
        }
    }
}