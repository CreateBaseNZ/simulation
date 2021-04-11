import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import * as monaco from 'monaco-editor';
import * as data from "../guide.json";
import * as data2 from "../keyword.json";
import { RobotManager } from './RobotManager';
import interact from 'interactjs';
import { SceneManager } from "./SceneManager";
import { defaultScene } from './scenes/Default';

export class Ui {

    private _editorsReadOnly: monaco.editor.IStandaloneCodeEditor[];
    private _editorsWrite: monaco.editor.IStandaloneCodeEditor[];
    private _numberOfEditors: number;
    private _readOnlyCompileButtons: HTMLElement[];
    private _readOnlyStopButtons: HTMLElement[];
    private _writeCompileButtons: HTMLElement[];
    private _writeStopButtons: HTMLElement[];

    constructor(scene: BABYLON.Scene) {
        monaco.editor.defineTheme("prototype", {
            "base": "vs", "inherit": true,
            "rules": [
                { "token": "comment", "foreground": "#6db261" },
                { "token": "keyword", "foreground": "#209ce2" },
                { "token": "typeKeyword", "foreground": "#81A1C1" },
                { "token": "identifier", "foreground": "#050505" },
                { "token": "delimiter", "foreground": "#2C03CF" },
                { "token": "number", "foreground": "#3667AF" },
                { "token": "string", "foreground": "#ffb649" },
                { "token": "string.escape", "foreground": "#FF7B1C" }
            ],
            "colors": {
                "editor.background": "#f4f4f4",
                "editor.foreground": "#f4f4f4",
                "editorLineNumber.foreground": "#ababab",
                "editorLineNumber.activeForeground": "#5f5f5f",
                "editor.lineHighlightBorder": "#e3e3e3",
                "editor.inactiveSelectionBackground": "#434c5ecc",
                "editorCursor.foreground": "#d8dee9"
            }
        });
        this._editorsReadOnly = new Array<monaco.editor.IStandaloneCodeEditor>();
        this._editorsWrite = new Array<monaco.editor.IStandaloneCodeEditor>();
        this._numberOfEditors = 0;
        this._readOnlyCompileButtons = new Array<HTMLElement>();
        this._readOnlyStopButtons = new Array<HTMLElement>();
        this._writeCompileButtons = new Array<HTMLElement>();
        this._writeStopButtons = new Array<HTMLElement>();

        //this handles interactions with the start button attached to the scene
        let educContent = document.querySelector(".educ-content") as HTMLElement;

        const { contents } = data;
        contents.forEach(element => {
            switch (element.type) {
                case "subsystem-heading":
                    this.CreateSubsystemHeading(educContent, element.content);
                    break;
                case "task-heading":
                    this.CreateTaskHeading(educContent, element.content);
                    break;
                case "text":
                    this.CreateText(educContent, element.content);
                    break;
                case "editor-read-only":
                    this.CreateEditorReadOnly(educContent, element.content);
                    break;
                case "code-block":
                    this.CreateCodeBlock(educContent, element.content);
                    break;
                case "editor-write":
                    this.CreateWriteEditor(educContent, element.content);
                    break;
                case "image":
                    this.CreateImage(educContent, element.src, element.alt);
                    break;
                default:
                    break;
            }
        });

        // Add the read-only compile system
        for (let i = 0; i < this._readOnlyCompileButtons.length; i++) {
            const element = this._readOnlyCompileButtons[i];
            this.CompileReadOnly(element, 0);
        }
        // Add the read-only stop system
        for (let i = 0; i < this._readOnlyStopButtons.length; i++) {
            const element = this._readOnlyStopButtons[i];
            element.addEventListener("click", () => {
                this.StopCode();
                RobotManager.instance.Stop();
            });
        }
        // Add the write compile system
        for (let i = 0; i < this._writeCompileButtons.length; i++) {
            const element = this._writeCompileButtons[i];
            this.CompileWrite(element, 0);
        }
        // Add the write stop system
        for (let i = 0; i < this._writeStopButtons.length; i++) {
            const element = this._writeStopButtons[i];
            element.addEventListener("click", () => {
                this.StopCode();
                RobotManager.instance.Stop();
            });
        }
        this.CompileWrite(document.querySelector(".compile-btn"), 0);
        // Add reset listener
        document.querySelector(".reset-btn").addEventListener("click", () => {
            SceneManager.instance.LoadScene(defaultScene);
        });
        interact('.main-wrapper')
            .resizable({
                edges: { top: false, left: false, bottom: true, right: false },
                listeners: {
                    move: function (e) {
                        e.target.style.height = (e.clientY - e.target.offsetTop - 8) + 'px';
                        const terminalWrapper = document.querySelector('.terminal-wrapper') as HTMLElement;
                        terminalWrapper.style.height = (terminalWrapper.offsetTop - e.clientY + terminalWrapper.offsetHeight) + 'px';
                    }
                }
            })

        interact('.terminal-wrapper')
            .resizable({
                edges: { top: true, left: false, bottom: false, right: false },
                listeners: {
                    move: function (e) {
                        e.target.style.height = (e.target.offsetTop - e.clientY + e.target.offsetHeight) + 'px';
                        const mainWrapper = document.querySelector('.main-wrapper') as HTMLElement;
                        mainWrapper.style.height = (e.clientY - mainWrapper.offsetTop - 8) + 'px';
                    }
                }
            })

        educContent.addEventListener('scroll', (e) => {
            const scrollPos = educContent.scrollTop;
            const contentHeader = document.querySelector(".content-header");
            if (scrollPos === 0) {
                contentHeader.classList.remove("header-collapse");
            } else {
                contentHeader.classList.add("header-collapse");
            }
        });

        const { keywords } = data2;
        this.GenerateHover(keywords);
    }



    private CreateSubsystemHeading(parentElement: HTMLElement, content: string) {
        document.querySelector('.sim-h1').innerHTML = content;
    }

    private CreateTaskHeading(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "sim-h2";
        text.innerText = content;
        parentElement.appendChild(text);
    }

    private CreateText(parentElement: HTMLElement, content: string) {
        const text = document.createElement("div");
        text.className = "sim-p"
        text.innerHTML = content;
        parentElement.appendChild(text);
    }

    private CreateImage(parentElement: HTMLElement, source: string, alternative: string) {
        const img = document.createElement("img");
        img.className = "sim-img";
        img.src = source;
        img.alt = alternative;
        parentElement.appendChild(img);
    }

    private CreateEditorReadOnly(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container read-only editor-wrapper-collapse";
        parentElement.appendChild(containerEditor);
        // Create the header element
        const header = document.createElement("div");
        header.className = "editor-header";
        containerEditor.appendChild(header);
        // Left side buttons
        const headerLeft = document.createElement("div");
        header.appendChild(headerLeft).className = "editor-header-left";
        const runAll = document.createElement("img");
        runAll.title = "Run all chunks";
        runAll.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/run-all.svg";
        headerLeft.appendChild(runAll).className = "run-all";
        const stop = document.createElement("img");
        stop.title = "Stop running";
        stop.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/stop.svg";
        headerLeft.appendChild(stop).className = "stop-all";
        const loading = document.createElement("div");
        headerLeft.appendChild(loading).className = "lds-dual-ring loading-all";
        // Right side buttons
        const headerRight = document.createElement("div");
        header.appendChild(headerRight).className = "editor-header-right";
        const editorType = document.createElement("div");
        editorType.innerHTML = "Read-only";
        headerRight.appendChild(editorType).className = "editor-header-text";
        let headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const editorID = document.createElement("div");
        headerRight.appendChild(editorID).className = "editor-header-text";
        headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const expand = document.createElement("img");
        expand.title = "Expand";
        expand.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/expand.svg";
        headerRight.appendChild(expand).className = "editor-expand";
        const collapse = document.createElement("img");
        collapse.title = "Collapse";
        collapse.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/collapse.svg";
        headerRight.appendChild(collapse).className = "editor-collapse";
        // Create the wrapper element
        const wrapperEditor = document.createElement("div");
        wrapperEditor.className = "editor-wrapper";
        containerEditor.appendChild(wrapperEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        wrapperEditor.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            wrappingStrategy: "advanced",
            lineNumbersMinChars: 3,
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            folding: true,
            foldingStrategy: 'indentation',
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            },
            overviewRulerBorder: false,
            theme: "prototype"
        });
        editor.style.height = monacoEditor.getContentHeight() + "px";
        // Adding Monaco into an array of editors
        this._editorsReadOnly.push(monacoEditor);
        this._numberOfEditors++;
        editorID.innerHTML = "[" + this._numberOfEditors + "]";
        // Add button in the read-only array buttons
        this._readOnlyCompileButtons.push(runAll);
        this._readOnlyStopButtons.push(stop);
        // Add collapse event listener
        expand.addEventListener("click", () => {
            containerEditor.classList.remove("editor-wrapper-collapse");
        });
        collapse.addEventListener("click", () => {
            containerEditor.classList.add("editor-wrapper-collapse");
        });
    }

    private CreateCodeBlock(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container block";
        parentElement.appendChild(containerEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        containerEditor.appendChild(editor);

        let monacoEditor = monaco.editor.create(editor, {
            wrappingStrategy: "advanced",
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            foldingStrategy: 'indentation',
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            },
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            overviewRulerBorder: false
        });
        monacoEditor.onDidContentSizeChange(() => {
            editor.style.height = monacoEditor.getContentHeight() + "px";
        });
    }

    private CreateWriteEditor(parentElement: HTMLElement, content: string) {
        // Create the container editor element
        const containerEditor = document.createElement("div");
        containerEditor.className = "editor-container writable";
        parentElement.appendChild(containerEditor);
        // Create the header element
        const header = document.createElement("div");
        header.className = "editor-header";
        containerEditor.appendChild(header);
        // Left side buttons
        const headerLeft = document.createElement("div");
        header.appendChild(headerLeft).className = "editor-header-left";
        const runAll = document.createElement("img");
        runAll.title = "Run all chunks";
        runAll.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/run-all.svg";
        headerLeft.appendChild(runAll).className = "run-all";
        // const undo = document.createElement("img");
        // undo.title = "Undo";
        // undo.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/undo.svg";
        // headerLeft.appendChild(undo).className = "editor-undo";
        // const reset = document.createElement("img");
        // reset.title = "Clear";
        // reset.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/reset.svg";
        // headerLeft.appendChild(reset).className = "editor-reset";
        const stop = document.createElement("img");
        stop.title = "Stop running";
        stop.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/stop.svg";
        headerLeft.appendChild(stop).className = "stop-all";
        const loading = document.createElement("div");
        headerLeft.appendChild(loading).className = "lds-dual-ring loading-all";
        // Right side buttons
        const headerRight = document.createElement("div");
        header.appendChild(headerRight).className = "editor-header-right";
        const editorType = document.createElement("div");
        editorType.innerHTML = "Writable";
        headerRight.appendChild(editorType).className = "editor-header-text";
        let headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const editorID = document.createElement("div");
        headerRight.appendChild(editorID).className = "editor-header-text";
        headerSep = document.createElement("div");
        headerRight.appendChild(headerSep).className = "editor-header-sep";
        const expand = document.createElement("img");
        expand.title = "Expand";
        expand.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/expand.svg";
        headerRight.appendChild(expand).className = "editor-expand";
        const collapse = document.createElement("img");
        collapse.title = "Collapse";
        collapse.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/collapse.svg";
        headerRight.appendChild(collapse).className = "editor-collapse";
        // Create the wrapper element
        const wrapperEditor = document.createElement("div");
        wrapperEditor.className = "editor-wrapper";
        containerEditor.appendChild(wrapperEditor);
        // Create the editor element
        const editor = document.createElement("div");
        editor.className = "editor";
        editor.id = "editor" + (this._editorsWrite.length + 1);
        wrapperEditor.appendChild(editor);

        // Build the editor
        let monacoEditor = monaco.editor.create(editor, {
            wrappingStrategy: "advanced",
            lineNumbersMinChars: 3,
            fontFamily: '"DM Mono", monospace',
            fontSize: 12,
            folding: true,
            foldingStrategy: 'indentation',
            value: content,
            language: "cpp",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0
            }
        });
        monacoEditor.onDidContentSizeChange(() => {
            if (monacoEditor.getModel().getLineCount() < 5) {
                editor.style.height = "80px";
            } else {
                editor.style.height = monacoEditor.getContentHeight() + "px";
            }
        });
        this._editorsWrite.push(monacoEditor);
        this._numberOfEditors++;
        editorID.innerHTML = "[" + this._numberOfEditors + "]";
        // Add button in the read-only array buttons
        this._writeCompileButtons.push(runAll);
        this._writeStopButtons.push(stop);
        // Add event listener on collapse and expand
        expand.addEventListener("click", () => {
            containerEditor.classList.remove("editor-wrapper-collapse");
        });
        collapse.addEventListener("click", () => {
            containerEditor.classList.add("editor-wrapper-collapse");
        });
    }

    private CompileWrite(button: HTMLElement, readOnlyEditorNumber: number) {
        button.addEventListener("click", () => {
            const idle = document.querySelector(".compile-btn").classList.contains("compile-idle");
            const running = document.querySelector(".compile-btn").classList.contains("compile-running");
            if (idle) {
                if (readOnlyEditorNumber) {

                } else {
                    console.log("Compiling the entire write code");
                    let code = "";
                    for (let i = 0; i < this._editorsWrite.length; i++) {
                        code = code.concat(this._editorsWrite[i].getModel().getValue() + "\n");
                    }
                    this.UploadCode(code);
                }
            } else if (running) {
                this.StopCode();
                RobotManager.instance.Stop();
            }
        });
    }

    private CompileReadOnly(button: HTMLElement, readOnlyEditorNumber: number) {
        button.addEventListener("click", () => {
            const idle = document.querySelector(".compile-btn").classList.contains("compile-idle");
            const running = document.querySelector(".compile-btn").classList.contains("compile-running");
            if (idle) {
                if (readOnlyEditorNumber) {

                } else {
                    console.log("Compiling the entire read-only code");
                    let code = "";
                    for (let i = 0; i < this._editorsReadOnly.length; i++) {
                        code = code.concat(this._editorsReadOnly[i].getModel().getValue() + "\n");
                    }
                    this.UploadCode(code);
                }
            } else if (running) {
                this.StopCode();
            }
        });
    }

    private UploadCode(code: string) {
        this.TerminalLoading("running");
        document.querySelector(".compile-btn").classList.remove("compile-idle");
        document.querySelector(".compile-btn").classList.add("compile-loading");
        document.querySelector(".compile-btn").classList.remove("compile-running");
        document.querySelectorAll(".editor-container").forEach(element => {
            element.classList.add("editor-loading");
            element.classList.remove("editor-running");
        });

        RobotManager.instance.UploadCode(code).then((isSuccess) => {
            if (isSuccess) {
                this.TerminalLoading("complete");
                document.querySelector(".compile-btn").classList.remove("compile-idle");
                document.querySelector(".compile-btn").classList.remove("compile-loading");
                document.querySelector(".compile-btn").classList.add("compile-running");
                document.querySelectorAll(".editor-container").forEach(element => {
                    element.classList.remove("editor-loading");
                    element.classList.add("editor-running");
                });
            }
            else {
                this.TerminalLoading("failed");
                this.StopCode();
            };
        });
    }

    private StopCode() {
        document.querySelector(".compile-btn").classList.add("compile-idle");
        document.querySelector(".compile-btn").classList.remove("compile-loading");
        document.querySelector(".compile-btn").classList.remove("compile-running");
        document.querySelector(".terminal-wrapper").classList.remove("terminal-running");
        document.querySelectorAll(".editor-container").forEach(element => {
            element.classList.remove("editor-loading");
            element.classList.remove("editor-running");
        });
        RobotManager.instance.Stop();
    }

    private GenerateHover(keywords: Array<Object>) {
        keywords.forEach(keyword => {
            // Find the elements containing the class
            const elements = document.querySelectorAll("." + keyword["class"]);
            elements.forEach(element => {
                element.addEventListener("mouseover", () => {
                    sessionStorage.setItem('hoveringKeyword', 'true');
                    sessionStorage.setItem('hoveringTooltip', 'false');
                    this.DeleteToolTip('force');
                    this.CreateToolTip(element, keyword["title"], keyword["contents"]);
                });
                element.addEventListener("mouseout", () => {
                  sessionStorage.setItem('hoveringKeyword', 'false');
                  this.DeleteToolTip('passive');
                });
            });
        });
    }

    private CreateToolTip(element, title: string, keyword: Array<Object>) {
      console.log(keyword)
      setTimeout(() => {
        if (sessionStorage.getItem('hoveringKeyword') === 'true') {
        // Tooltip container
        const toolTipContainer = document.createElement("div");
        document.body.appendChild(toolTipContainer).className = "tooltip-container";
        // Tooltip header
        const toolTipHeader = document.createElement("div");
        toolTipContainer.appendChild(toolTipHeader).className = "tooltip-header";
        const toolTipIcon = document.createElement("img");
        toolTipIcon.src = "https://raw.githubusercontent.com/CreateBaseNZ/cb-simulation-model/main/images/tooltip-icon.svg";
        toolTipHeader.appendChild(toolTipIcon).className = "tooltip-icon";
        const toolTipTitle = document.createElement("div");
        toolTipTitle.innerHTML = title;
        toolTipHeader.appendChild(toolTipTitle).className = "tooltip-title";
        // Tooltip wrapper
        const toolTipWrapper = document.createElement("div");
        toolTipContainer.appendChild(toolTipWrapper).className = "tooltip-wrapper";

        keyword.forEach((content: any) => {
          if (content.type === 'code-block') {
            this.CreateCodeBlock(toolTipWrapper, content.content);
          } else {
            let contentEl = document.createElement("div");
            contentEl.innerHTML = content.content;
            toolTipWrapper.appendChild(contentEl);
          }
        })
        
        let rect = element.getBoundingClientRect();
        toolTipContainer.style.top = rect.top + 25 + 'px';
        toolTipContainer.style.left = rect.left + 'px';

        toolTipContainer.addEventListener("mouseover", (e) => {
          sessionStorage.setItem('hoveringKeyword', 'false');
          sessionStorage.setItem('hoveringTooltip', 'true');
        })
        toolTipContainer.addEventListener("mouseout", (e) => {
          sessionStorage.setItem('hoveringTooltip', 'false');
          this.DeleteToolTip('passive');
        })
        }
      }, 250);
    }

    private DeleteToolTip(action: string) {
      const tooltip = document.querySelector('.tooltip-container');
      if (action === 'force') {
        if (tooltip) {
          tooltip.remove();
        }
      } else {
        setTimeout(() => {
          if (sessionStorage.getItem('hoveringKeyword') === 'false' && sessionStorage.getItem('hoveringTooltip') === 'false') {
            if (tooltip) {
              tooltip.remove();
            }
          }
        }, 250);
      }
    }

    private TerminalLoading(status: string) {
        const terminalWrapper = document.querySelector('.terminal-wrapper');
        const loadingBar = document.querySelector('.terminal-loading-bar');
        if (status === 'running') {
            terminalWrapper.classList.add('terminal-loading');
            loadingBar.classList.add('loading-10');
            setTimeout(() => {
                loadingBar.classList.remove('loading-10');
                loadingBar.classList.add('loading-80');
            }, 600)
        } else if (status === 'complete') {
            loadingBar.classList.add('loading-100');
            loadingBar.classList.remove('loading-80');
            setTimeout(() => {
                loadingBar.classList.remove('loading-100');
                terminalWrapper.classList.remove('terminal-loading');
                terminalWrapper.classList.add('terminal-running');
            }, 1000)
        } else if (status === 'failed') {
            loadingBar.classList.remove('loading-80');
            terminalWrapper.classList.remove('terminal-loading');
        }
    }

    public WinUI() {
        let terminal = document.querySelector(".terminal");
        terminal.innerHTML = "<span class='terminal-text-success'>The challenge has been completed!</span><br>";
        terminal.scrollTo(0, terminal.scrollHeight);
        this.StopCode();
    }
}