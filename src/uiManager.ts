import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { SideBar } from './sideBar';
import { LevelManager, State } from './levelManager';
import { Interactable } from './interactable';
import { Robot } from './robot';
import { IDE } from "./ide";
import { RoboticArm } from "./roboticArm";

export class UIManager {

    public static instance: UIManager;
    public fps: GUI.TextBlock = new GUI.TextBlock("fps", "FPS: 60")
    public objective: GUI.TextBlock = new GUI.TextBlock("objective", "Collect the Stars\n0/4")
    public objComplete: GUI.Rectangle = new GUI.Rectangle();
    public completeText: GUI.TextBlock = new GUI.TextBlock();
    public collectedStars: number = 0;
    public timer: GUI.TextBlock = new GUI.TextBlock("timer", "00:00:00");
    public startTimer: boolean = false;
    public elapsedTime: number;
    public sideBar: SideBar;
    public selectedRobot: Robot;
    public robots: RoboticArm[];
    public ide: IDE;
    public colorPicker: GUI.ColorPicker;

    public scene: BABYLON.Scene = new BABYLON.Scene(LevelManager.instance.engine);

    constructor(scene, robots) {
        if (UIManager.instance == null) {
            UIManager.instance = this;
        }
        else {
            return UIManager.instance;
        }

        this.scene = scene;
        this.elapsedTime = 0;
        this.collectedStars = 0;
        this.startTimer = false;
        this.ide = new IDE();
        this.robots = robots;
        this.colorPicker = new GUI.ColorPicker;

        // Create the GUI
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this.scene);
        advancedTexture.idealHeight = 720; //fit our fullscreen ui to this height

        this.sideBar = new SideBar(advancedTexture);

        //create a simple button
        const menuBtn = GUI.Button.CreateSimpleButton("mainMenu", "Main Menu");
        menuBtn.width = "100px"
        menuBtn.height = "40px";
        menuBtn.color = "white";
        menuBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        menuBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        menuBtn.paddingBottom = "10px";
        menuBtn.paddingRight = "10px";
        menuBtn.background = "green";
        menuBtn.zIndex = 1;
        advancedTexture.addControl(menuBtn);

        //this handles interactions with the start button attached to the scene
        menuBtn.onPointerDownObservable.add(() => {
            advancedTexture.dispose();
            this.scene.dispose();
            LevelManager.instance.targetState = State.MENU;
        });

        // Objective display
        this.objective.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.objective.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.objective.fontSize = 40;
        this.objective.top = "20px";
        this.objective.left = "10px";
        advancedTexture.addControl(this.objective);

        // Objective Complete display
        this.objComplete = new GUI.Rectangle();
        this.objComplete.background = "white"
        this.objComplete.height = "600px";
        this.objComplete.alpha = 0.75;
        this.objComplete.width = "350px";
        this.objComplete.cornerRadius = 20;
        this.objComplete.thickness = 1;
        this.objComplete.linkOffsetY = 30;
        this.objComplete.zIndex = 2;
        advancedTexture.addControl(this.objComplete);

        this.completeText = new GUI.TextBlock();
        this.completeText.color = "black";
        this.completeText.fontSize = 50;
        this.completeText.zIndex = 2;
        this.objComplete.addControl(this.completeText);

        let playAgainBtn = GUI.Button.CreateSimpleButton("playAgain", "Play Again");
        playAgainBtn.width = "200px"
        playAgainBtn.height = "60px";
        playAgainBtn.color = "white";
        playAgainBtn.top = "200px";
        playAgainBtn.fontSize = 30;
        playAgainBtn.background = "red";
        playAgainBtn.zIndex = 10;
        this.objComplete.addControl(playAgainBtn);

        playAgainBtn.onPointerDownObservable.add(() => {
            //advancedTexture.dispose();
            //this._scene.dispose();
            //Need to replace this logic with an abstracted level class
            //this.begin();
        });

        // FPS display
        this.fps.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.fps.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.fps.top = "10px";
        this.fps.left = "10px";
        this.fps.fontSize = 10;
        advancedTexture.addControl(this.fps);

        // Timer display
        this.timer.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.timer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.timer.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.timer.top = "20px";
        this.timer.paddingRight = "10px";
        this.timer.fontSize = 40;
        this.timer.width = "200px";
        advancedTexture.addControl(this.timer);
    }

    public tick() {
        if (this.collectedStars < 4) {
            this.objComplete.alpha = 0;
            if(this.startTimer){
                this.elapsedTime += LevelManager.instance.engine.getDeltaTime()/1000;
            }
        }
        else {
            UIManager.instance.objComplete.alpha = 0.75;
            UIManager.instance.completeText.text = "Challenge\nComplete!\n\nTime Taken:\n" + new Date(this.elapsedTime * 1000).toISOString().substr(14, 8);
        }


        this.objective.text = "Collect the Stars\n" + this.collectedStars + "/4";
        this.timer.text = new Date(this.elapsedTime * 1000).toISOString().substr(14, 8);
        this.fps.text = "FPS: " + LevelManager.instance.engine.getFps().toFixed(0);
    }
}