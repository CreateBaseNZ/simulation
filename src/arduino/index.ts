import { PinState } from 'avr8js';
import { buildHex } from './compile';
import { CPUPerformance } from './cpu-performance';
import { AVRRunner } from './execute';
import { formatTime } from './format-time';
import './index.css';
import { EditorHistoryUtil } from './utils/editor-history.util';
import * as monaco from 'monaco-editor'

const BLINK_CODE = `
// put your setup code here, to run once:
void setup() {
  Serial.begin(9600);
}

// put your main code here, to run repeatedly:
void loop() {

}`.trim();


let editor = monaco.editor.create(document.getElementById('editor'), {
  value: EditorHistoryUtil.getValue() || BLINK_CODE,
  language: 'cpp',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  theme: "vs-dark",
});

// Set up toolbar
let runner: AVRRunner;

/* eslint-disable @typescript-eslint/no-use-before-define */
const runButton = document.querySelector('#run-button');
runButton.addEventListener('click', compileAndRun);
const stopButton = document.querySelector('#stop-button');
stopButton.addEventListener('click', stopCode);
const statusLabel = document.querySelector('#status-label');
const compilerOutputText = document.querySelector('#compiler-output-text');
const serialOutputText = document.querySelector('#serial-output-text');

function executeProgram(hex: string) {
  runner = new AVRRunner(hex);
  const MHZ = 16000000;

  let lastStateD = [PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input];
  let startHighCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];
  let lastHighCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];
  let startLowCyclesD = [0, 0, 0, 0, 0, 0, 0, 0];
  let angleD = [0, 0, 0, 0, 0, 0, 0, 0];

  //Hook to PORTD register
  runner.portD.addListener(() => {
    for (let i = 0; i < 8; i++) {
      const pinState = runner.portD.pinState(i);
      if (pinState != lastStateD[i]) {
        // Rising Edge
        if (lastStateD[i] === PinState.Low && pinState === PinState.High) {
          lastHighCyclesD[i] = startHighCyclesD[i];
          startHighCyclesD[i] = runner.cpu.cycles;
        }

        // Falling edge
        else if (lastStateD[i] === PinState.High && pinState === PinState.Low) {
          // Servo pwm results in 38399 high cycles at 180 degrees and 3695 high cycles at 0 degrees.
          // This linearly interpolates for all in between angles
          startLowCyclesD[i] = runner.cpu.cycles;
          angleD[i] = Math.round(mapfloat((startLowCyclesD[i] - startHighCyclesD[i]), 8695, 38399, 0, 180));
        }
        lastStateD[i] = pinState;
      }
    }

  });

  let lastStateB = [PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input, PinState.Input];
  let startHighCyclesB = [0, 0, 0, 0, 0, 0];
  let lastHighCyclesB = [0, 0, 0, 0, 0, 0];
  let startLowCyclesB = [0, 0, 0, 0, 0, 0];
  let angleB = [0, 0, 0, 0, 0, 0, 0, 0];
  let prevTimeB = Date.now();

  runner.portB.addListener(() => {

    for (let i = 0; i < 6; i++) {
      const pinState = runner.portB.pinState(i);
      if (pinState != lastStateB[i]) {

        // Rising Edge
        if (lastStateB[i] === PinState.Low && pinState === PinState.High) {
          lastHighCyclesB[i] = startHighCyclesB[i];
          startHighCyclesB[i] = runner.cpu.cycles;
        }

        // Falling edge
        else if (lastStateB[i] === PinState.High && pinState === PinState.Low) {
          startLowCyclesB[i] = runner.cpu.cycles;
          startLowCyclesB[i] = runner.cpu.cycles;
          angleB[i] = Math.round(mapfloat((startLowCyclesB[i] - startHighCyclesB[i]), 8695, 38399, 0, 180)) * Math.PI / 180;
        }
        lastStateB[i] = pinState;
      }
    }
    prevTimeB = Date.now();

  });

  runner.usart.onByteTransmit = (value) => {
    serialOutputText.textContent += String.fromCharCode(value);
  };

  const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
  runner.execute((cpu) => {
    const time = formatTime(cpu.cycles / MHZ);
    const speed = (cpuPerf.update() * 100).toFixed(0);
    statusLabel.textContent = `Simulation time: ${time} (${speed}%)`;
  });
}

async function compileAndRun() {
  storeUserSnippet();

  runButton.setAttribute('disabled', '1');

  serialOutputText.textContent = '';
  try {
    statusLabel.textContent = 'Compiling...';
    const result = await buildHex(editor.getModel().getValue());
    compilerOutputText.textContent = result.stderr || result.stdout;
    if (result.hex) {
      compilerOutputText.textContent += '\nProgram running...';
      stopButton.removeAttribute('disabled');
      executeProgram(result.hex);
    } else {
      runButton.removeAttribute('disabled');
    }
  } catch (err) {
    runButton.removeAttribute('disabled');
    alert('Failed: ' + err);
  } finally {
    statusLabel.textContent = '';
  }
}

function storeUserSnippet() {
  EditorHistoryUtil.clearSnippet();
  EditorHistoryUtil.storeSnippet(editor.getValue());
}

function stopCode() {
  stopButton.setAttribute('disabled', '1');
  runButton.removeAttribute('disabled');
  if (runner) {
    runner.stop();
    runner = null;
  }
}

function mapfloat(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}