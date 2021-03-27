import {SceneManager} from "./SceneManager";

export class CBObject {

    constructor(){
        SceneManager.instance.objects.push(this);
        this.Start();
    }

    Start(){

    }

    Update(){

    }

    LateUpdate(){

    }

}