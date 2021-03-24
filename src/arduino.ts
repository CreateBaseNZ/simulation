import { AVRIOPort, PinState } from 'avr8js';
import { buildHex } from './arduino/compile';
import { CPUPerformance } from './/arduino/cpu-performance';
import { AVRRunner } from './arduino//execute';
import { formatTime } from './arduino/format-time';
import './arduino/index.css';

const DEFAULT_CODE = `
#include <Servo.h>

Servo myservo0;
Servo myservo1;
Servo myservo2;
Servo myservo3;


int pos = 0;   

void setup() {
    myservo0.attach(8); 
    myservo1.attach(9); 
    myservo2.attach(10); 
    myservo3.attach(11); 
}

void loop() {
    for (pos = 0; pos <= 180; pos += 1) {
        myservo0.write(pos);
        myservo1.write(pos); 
        myservo2.write(pos); 
        myservo3.write(pos);  

        delay(15);                       
    }
    for (pos = 180; pos >= 0; pos -= 1) {
        myservo0.write(pos);
        myservo1.write(pos);  
        myservo2.write(pos);           
        myservo3.write(pos);            

        delay(15);                       
    }
}`.trim();

export class Arduino {

    public code: string = DEFAULT_CODE;
    protected _runner: AVRRunner;
    protected _statusLabel: string;
    protected _compilerOutputText: string;
    protected _serialOutputText: string;
    public angleB = [90, 90, 90, 90, 90, 90];
    public angleC = [90, 90, 90, 90, 90, 90];
    public angleD = [90, 90, 90, 90, 90, 90, 90, 90];
    private _myWorker: Worker;

    constructor() {
    }

    private _executeProgram(hex: string) {
        this._myWorker = new Worker('js/worker.bundle.js');
        if (this._myWorker != null) {
            let message = { hexString: hex };
            this._myWorker.postMessage(message);
            this._myWorker.onmessage = (e) => {
                this.angleB = e.data.angleB;
                this.angleC = e.data.angleC;
                this.angleD = e.data.angleD;
            }
        }
    }

    public async compile(run: boolean = false) {
        //runButton.setAttribute('disabled', '1');
        this._serialOutputText = '';
        try {
            this._statusLabel = 'Compiling...';
            const result = await buildHex(this.code);
            this._compilerOutputText = result.stderr || result.stdout;
            console.log(this._compilerOutputText);
            if (result.hex) {
                this._compilerOutputText += '\nProgram running...';
                //stopButton.removeAttribute('disabled');
                if (run) {
                    this._executeProgram(result.hex);
                }
            } else {
                //runButton.removeAttribute('disabled');
            }
        } catch (err) {
            //runButton.removeAttribute('disabled');
            alert('Failed: ' + err);
        } finally {
            this._statusLabel = '';
        }
    }

    public stopCode() {
        if (this._myWorker != null) {
            this._myWorker.terminate();
        }
    }
}
