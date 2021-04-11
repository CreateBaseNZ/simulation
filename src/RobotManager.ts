import * as BABYLON from '@babylonjs/core';
import { Objective } from './Objective';
import * as GUI from "@babylonjs/gui";
import { Robot } from './Robot';

export class RobotManager {
    public static instance: RobotManager;

    private _robots: Robot[];
    private _terminal: HTMLElement;
    private _status: HTMLElement;

    constructor() {
        if (RobotManager.instance == null) {
            RobotManager.instance = this;
        }
        else {
            return RobotManager.instance;
        }

        this._robots = new Array<Robot>();
        this._terminal = document.querySelector(".terminal");
        this._status = document.getElementById("status");
    }

    public AddRobot(robot: Robot) {
        this._robots.push(robot);
    }

    public GetRobots() {
        return this._robots;
    }

    public async UploadCode(code: string, success: string = "Compiled successfully!") {
        // this._status.classList.remove("error");
        // this._status.classList.remove("success");
        // this._status.innerText = "Compiling sketch...";
        const hexs = await (this.CompileCode(code));
        if (hexs != null) {
            for (let i = 0; i < hexs.length; i++) {
                this._robots[i].arduino.ExecuteProgram(hexs[i]);
            }
            // this._status.innerText = success;
            // this._status.classList.remove("error");
            // this._status.classList.add("success");
        }
        else {
            // this._status.innerText = "An error occured while uploading the sketch.";
            // this._status.classList.add("error");
            // this._status.classList.remove("success");
        }
        this._terminal.innerHTML = this.BuildCompilerOutput();
    }

    private async CompileCode(code: string) {
        let hexs = [];

        for await (const hex of this._robots.map(robot => robot.arduino.Compile(code))) {
            if (hex != null) {
                hexs.push(hex)
            }
            else {
                return null;
            }
        }
        return await hexs;
    }

    public Stop() {
        this._robots.forEach(robot => {
            robot.arduino.Stop();
        })
    }

    private BuildCompilerOutput() {
        let terminalOutput = "";
        for (let i = 0; i < this._robots.length; i++) {
            terminalOutput += "---------- Robot " + i + " ----------<br>";
            terminalOutput += this._robots[i].arduino.compilerOutputText;
        }
        if (terminalOutput.length > 1000) {
            terminalOutput = terminalOutput.slice(500);
        }
        return terminalOutput;
    }

    public GetEffectors() {
        return this._robots.map(robot => robot.GetEffector());
    }
}