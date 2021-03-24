import { AVRIOPort, PinState } from 'avr8js';
import { CPUPerformance } from './arduino/cpu-performance';
import { AVRRunner } from './arduino/execute';

self.onmessage = (e: MessageEvent) => {
    let runner: AVRRunner;
    let serialOutputText: string;
    let angleB = [90, 90, 90, 90, 90, 90];
    let angleC = [90, 90, 90, 90, 90, 90];
    let angleD = [90, 90, 90, 90, 90, 90, 90, 90];

    if (e.data.hexString !== undefined) {
        runner = new AVRRunner(e.data.hexString);
        const MHZ = 16e6;

        let lastStateB = [PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input];
        let startHighCyclesB = [0, 0, 0, 0, 0, 0];
        let lastHighCyclesB = [0, 0, 0, 0, 0, 0];
        let startLowCyclesB = [0, 0, 0, 0, 0, 0];

        let lastStateC = [PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input];
        let startHighCyclesC = [0, 0, 0, 0, 0, 0];
        let lastHighCyclesC = [0, 0, 0, 0, 0, 0];
        let startLowCyclesC = [0, 0, 0, 0, 0, 0];

        let lastStateD = [PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input];
        let startHighCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];
        let lastHighCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];
        let startLowCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];

        let calculatePWM = (port: AVRIOPort, lastState: PinState[], startHighCycles: number[], lastHighCycles: number[], startLowCycles: number[], angle: number[]) => {
            for (let i = 0; i < angle.length; i++) {
                const pinState = port.pinState(i);
                if (pinState != lastState[i]) {
                    // Rising Edge
                    if (lastState[i] === PinState.Low && pinState === PinState.High) {
                        lastHighCycles[i] = startHighCycles[i];
                        startHighCycles[i] = runner.cpu.cycles;
                    }

                    // Falling edge
                    else if (lastState[i] === PinState.High && pinState === PinState.Low) {
                        // Servo pwm results in 38399 high cycles at 180 degrees and 3695 high cycles at 0 degrees.
                        // This linearly interpolates for all in between angles
                        startLowCycles[i] = runner.cpu.cycles;
                        angle[i] = Math.round(mapfloat((startLowCycles[i] - startHighCycles[i]), 8695, 38399, 0, 180));
                    }
                    lastState[i] = pinState;
                }
            }
        }

        //Hook to PORTB register - Pins 8-13
        runner.portB.addListener(() => {
            calculatePWM(runner.portB, lastStateB, startHighCyclesB, lastHighCyclesB, startLowCyclesB, angleB);
        });

        //Hook to PORTC register - Pins A0 - A5
        runner.portC.addListener(() => {
            calculatePWM(runner.portC, lastStateC, startHighCyclesC, lastHighCyclesC, startLowCyclesC, angleC);
        });

        //Hook to PORTD register - Pins 0-7
        runner.portD.addListener(() => {
            calculatePWM(runner.portD, lastStateD, startHighCyclesD, lastHighCyclesD, startLowCyclesD, angleD);
        });

        runner.usart.onByteTransmit = (value) => {
            serialOutputText += String.fromCharCode(value);
        };

        const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
        runner.execute((cpu) => {
            const time = cpu.cycles / MHZ;
            const speed = (cpuPerf.update() * 100).toFixed(0);
            let message = { angleB: angleB, angleC: angleC, angleD: angleD };
            postMessage(message);
        });
    }
}

let mapfloat = (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
