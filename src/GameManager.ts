import * as BABYLON from '@babylonjs/core';
import { defaultScene } from "./scenes/Default";
import { SceneManager } from "./SceneManager";
import { Objective } from './Objective';
import { Player } from './Player';

export class GameManager {

    public static instance: GameManager;
    private _players: Player[];

    constructor() {
        if (GameManager.instance == null) {
            GameManager.instance = this;
        }
        else {
            return GameManager.instance;
        }

        this._players = new Array<Player>();
    }

    public AddPlayer(player: Player) {
        this._players.push(player);
    }

    public WinGame(){
        this._players.forEach(player => {
            player.hud.WinUI();
        });
    }
}