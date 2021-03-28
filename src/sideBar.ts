import * as GUI from "@babylonjs/gui";
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders";
import { Robot } from './robot';
import { RoboticArm } from './RoboticArm';
import { UIManager } from './uiManager';
import { SceneManager } from "./SceneManager";

export class SideBar {

    private _advancedTexture: GUI.AdvancedDynamicTexture;
    private _activeTab: string;
    private _tabContent: GUI.Container[];

    constructor(advancedDynamicTexture) {
        // Create the GUI
        this._advancedTexture = advancedDynamicTexture;
        this._tabContent = [];
        this._activeTab = ""

        let sideBar = new GUI.Container();
        sideBar.width = "100%";
        sideBar.height = "100%";
        sideBar.left = "43.2%";
        sideBar.zIndex = 3;
        this._advancedTexture.addControl(sideBar);

        // Info Panel
        let infoDisplay = new GUI.Rectangle();
        infoDisplay.background = "#1e1e1e";
        infoDisplay.color = "black";
        infoDisplay.height = "98%";
        infoDisplay.width = "45%";
        infoDisplay.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        infoDisplay.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        infoDisplay.left = 20;
        infoDisplay.cornerRadius = 20;
        infoDisplay.thickness = 5;
        infoDisplay.zIndex = 5;
        sideBar.addControl(infoDisplay);

        var addTab = (name, top) => {
            var button = new GUI.Button();
            button.rotation = -Math.PI / 2;
            button.width = "100px";
            button.height = "40px";
            button.color = "black";
            button.background = "black";
            button.alpha = 1;
            button.left = "52%";
            button.thickness = 0;
            button.top = top;
            button.cornerRadius = 5;
            button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            button.zIndex = 4;

            button.onPointerDownObservable.add(() => {
                if (this._activeTab == name) {
                    sideBar.left = "43.2%";
                    this._activeTab = "";
                    UIManager.instance.ide.hideIDE();
                }
                else {
                    sideBar.left = "0px";
                    this._activeTab = name;
                    this._tabContent.forEach(control => {
                        sideBar.removeControl(control);
                    });
                    if (name == "Editor") {
                        UIManager.instance.ide.showIDE();
                        sideBar.addControl(editorTab);
                    }
                    else {
                        UIManager.instance.ide.hideIDE();
                        if (name == "Robots") {
                            sideBar.addControl(robotsTab);
                        }
                        else if (name == "Info") {
                            sideBar.addControl(infoTab);
                        }
                    }
                }
            });

            var label = new GUI.TextBlock("button" + name, name);
            label.fontSize = 25;
            label.color = "white";
            button.addControl(label);
            sideBar.addControl(button);
        }

        addTab("Robots", "55px");
        addTab("Editor", "155px");
        addTab("Info", "255px");

        let editorTab = new GUI.Container();
        editorTab.height = "20px";
        editorTab.width = "45%";
        editorTab.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        editorTab.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        editorTab.top = "13px";
        editorTab.left = 20;
        editorTab.zIndex = 10;

        let createButton = (name: string, color: string, left: string, onclick: () => void) => {
            const btn = GUI.Button.CreateSimpleButton(name, name);
            btn.width = "60px"
            btn.height = "20px";
            btn.color = "white";
            btn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            btn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            btn.background = color;
            btn.left = left;
            btn.textBlock.fontSize = 12;
            btn.cornerRadius = 5;
            editorTab.addControl(btn);

            btn.onPointerDownObservable.add(onclick);
        }

        createButton("Verify", "teal", "50px", () => {
            let selectedRobot = UIManager.instance.selectedRobot;
            if (selectedRobot != null) {
                selectedRobot.arduino.compile();
            }
        })

        createButton("Upload", "green", "120px", () => {
            let selectedRobot = UIManager.instance.selectedRobot;
            if (selectedRobot != null) {
                selectedRobot.arduino.code = UIManager.instance.ide.getText();
            }

            UIManager.instance.robots.forEach(robot => {
                robot.arduino.stopCode();
                robot.arduino.compile(true);
            })
            UIManager.instance.startTimer = true;
        });

        createButton("Stop", "orange", "190px", () => {
            let selectedRobot = UIManager.instance.selectedRobot;
            if (selectedRobot != null) {
                selectedRobot.arduino.stopCode();
            }
        });

        createButton("Stop All", "red", "260px", () => {
            UIManager.instance.robots.forEach(robot => {
                robot.arduino.stopCode();
            })
        });

        const status = new GUI.TextBlock("status", "Compiling...");
        status.color = "white";
        status.width = "100px"
        status.height = "20px";
        status.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        status.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        status.left = "500px";
        status.fontSize = 12;
        editorTab.addControl(status);

        this._tabContent.push(editorTab);

        let robotsTab = new GUI.Container();
        robotsTab.height = "98%";
        robotsTab.width = "45%";
        robotsTab.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        robotsTab.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        robotsTab.left = 20;
        robotsTab.zIndex = 10;

        const robotBtn = GUI.Button.CreateSimpleButton("addRobot", "Robotic Arm");
        robotBtn.width = "120px"
        robotBtn.height = "120px";
        robotBtn.color = "black"
        robotBtn.background = "grey"
        robotBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        robotBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER

        robotBtn.textBlock.fontSize = 18;
        robotBtn.cornerRadius = 5;
        robotsTab.addControl(robotBtn);

        //this handles interactions with the start button attached to the scene
        robotBtn.onPointerDownObservable.add(() => {
            let robot = new RoboticArm("roboticArm", UIManager.instance.scene);
            setTimeout(() => {
                robot.setupHierarchy();
                UIManager.instance.robots.push(robot);
            }, 50);
        });

        this._tabContent.push(robotsTab);

        let infoTab = new GUI.Container();
        infoTab.height = "98%";
        infoTab.width = "45%";
        infoTab.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        infoTab.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        infoTab.left = 20;
        infoTab.zIndex = 10;

        const colorPicker = UIManager.instance.colorPicker;
        colorPicker.size = 0.5;

        let selectedRobot = UIManager.instance.selectedRobot;
        colorPicker.onValueChangedObservable.add((color) => {
            selectedRobot = UIManager.instance.selectedRobot;
            if (selectedRobot != null) {
                selectedRobot.setColor(color);
            }
        });

        infoTab.addControl(colorPicker);
        this._tabContent.push(infoTab);

    }

}