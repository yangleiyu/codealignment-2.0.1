import * as vscode from 'vscode';
import { AlignFunctions } from './AlignFunctions';
import { Key } from './business/Key';
import { Options } from './business/Options';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'codealignment.alignBy';
    statusBarItem.text = '$(symbol-misc) Align';
    statusBarItem.tooltip = 'Code Alignment';
    context.subscriptions.push(statusBarItem);

    updateStatusBarVisibility(vscode.window.activeTextEditor);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            updateStatusBarVisibility(editor);
        })
    );

    const commands = [
        { id: 'codealignment.alignBy',               handler: () => executeAlign('alignBy') },
        { id: 'codealignment.alignByEquals',          handler: () => executeAlign('alignByEquals') },
        { id: 'codealignment.alignByEqualsEquals',    handler: () => executeAlign('alignByEqualsEquals') },
        { id: 'codealignment.alignByMUnderscore',     handler: () => executeAlign('alignByMUnderscore') },
        { id: 'codealignment.alignByQuote',           handler: () => executeAlign('alignByQuote') },
        { id: 'codealignment.alignByPeriod',          handler: () => executeAlign('alignByPeriod') },
        { id: 'codealignment.alignBySpace',           handler: () => executeAlign('alignBySpace') },
        { id: 'codealignment.alignFromCaret',         handler: () => executeAlign('alignFromCaret') },
        { id: 'codealignment.alignByKey',             handler: () => executeAlign('alignByKey') },
        { id: 'codealignment.showOptions',            handler: () => OptionsPanel.createOrShow(context.extensionUri) },
        { id: 'codealignment.vlAlignByNonBlocking',   handler: () => executeAlign('vlAlignByNonBlocking') },
        { id: 'codealignment.vlAlignByPortDecl',      handler: () => executeAlign('vlAlignByPortDecl') },
        { id: 'codealignment.vlAlignBySignalDecl',    handler: () => executeAlign('vlAlignBySignalDecl') },
        { id: 'codealignment.vlAlignByInstance',      handler: () => executeAlign('vlAlignByInstance') },
        { id: 'codealignment.vlAlignByComment',       handler: () => executeAlign('vlAlignByComment') },
        { id: 'codealignment.vlAlignByAssign',        handler: () => executeAlign('vlAlignByAssign') },
        { id: 'codealignment.vlAlignByCase',          handler: () => executeAlign('vlAlignByCase') },
        { id: 'codealignment.vlAlignByEquals',        handler: () => executeAlign('vlAlignByEquals') },
    ];

    for (const cmd of commands) {
        context.subscriptions.push(
            vscode.commands.registerCommand(cmd.id, cmd.handler)
        );
    }
}

function updateStatusBarVisibility(editor: vscode.TextEditor | undefined): void {
    if (editor) {
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

function executeAlign(cmdType: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Code Alignment: No active editor.');
        return;
    }

    const functions = new AlignFunctions(editor);

    switch (cmdType) {
        case 'alignBy':
            functions.alignByDialog(false);
            break;
        case 'alignByEquals':
            functions.alignBy('=');
            break;
        case 'alignByEqualsEquals':
            functions.alignBy('==');
            break;
        case 'alignByMUnderscore':
            functions.alignBy('m_');
            break;
        case 'alignByQuote':
            functions.alignBy('"');
            break;
        case 'alignByPeriod':
            functions.alignBy('.');
            break;
        case 'alignBySpace':
            functions.alignBy(' ');
            break;
        case 'alignFromCaret':
            functions.alignByDialog(true);
            break;
        case 'alignByKey':
            functions.startKeyGrabMode();
            break;
        case 'vlAlignByNonBlocking':
            functions.alignVlNonBlockingAssign(false);
            break;
        case 'vlAlignByPortDecl':
            functions.alignVlPortDeclaration(false);
            break;
        case 'vlAlignBySignalDecl':
            functions.alignVlSignalDeclaration(false);
            break;
        case 'vlAlignByInstance':
            functions.alignVlModuleInstance(false);
            break;
        case 'vlAlignByComment':
            functions.alignVlInlineComment(false);
            break;
        case 'vlAlignByAssign':
            functions.alignVlAssignStatement(false);
            break;
        case 'vlAlignByCase':
            functions.alignVlCaseItems(false);
            break;
        case 'vlAlignByEquals':
            functions.alignVlEquals(true);
            break;
    }
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

class OptionsPanel {
    public static currentPanel: OptionsPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (OptionsPanel.currentPanel) {
            OptionsPanel.currentPanel.panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'codealignment.options',
            'Code Alignment Options',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        OptionsPanel.currentPanel = new OptionsPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri): void {
        OptionsPanel.currentPanel = new OptionsPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'saveOptions':
                        this.saveOptions(message.data);
                        break;
                    case 'resetShortcuts':
                        this.resetShortcuts();
                        break;
                    case 'resetSelectors':
                        this.resetSelectors();
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    private update(): void {
        this.panel.webview.html = this.getHtmlForWebview();
    }

    private saveOptions(data: any): void {
        const config = vscode.workspace.getConfiguration('codealignment');
        if (data.shortcuts !== undefined) {
            config.update('shortcuts', data.shortcuts, vscode.ConfigurationTarget.Global);
        }
        if (data.useIdeTabSettings !== undefined) {
            config.update('useIdeTabSettings', data.useIdeTabSettings, vscode.ConfigurationTarget.Global);
        }
        if (data.xmlTypes !== undefined) {
            config.update('xmlTypes', data.xmlTypes, vscode.ConfigurationTarget.Global);
        }
        if (data.vlTypes !== undefined) {
            config.update('vlTypes', data.vlTypes, vscode.ConfigurationTarget.Global);
        }
        if (data.scopeSelectorLineValues !== undefined) {
            config.update('scopeSelectorLineValues', data.scopeSelectorLineValues, vscode.ConfigurationTarget.Global);
        }
        if (data.scopeSelectorLineEnds !== undefined) {
            config.update('scopeSelectorLineEnds', data.scopeSelectorLineEnds, vscode.ConfigurationTarget.Global);
        }
        vscode.window.showInformationMessage('Code Alignment settings saved.');
    }

    private resetShortcuts(): void {
        const defaults = [
            { value: 187, alignment: '=', language: null, alignFromCaret: false, useRegex: false, addSpace: false },
            { value: 32, alignment: ' ', language: null, alignFromCaret: false, useRegex: false, addSpace: false },
            { value: 190, alignment: '.', language: null, alignFromCaret: false, useRegex: false, addSpace: false },
            { value: 222, alignment: '"', language: null, alignFromCaret: false, useRegex: false, addSpace: false },
            { value: 77, alignment: 'm_', language: null, alignFromCaret: false, useRegex: false, addSpace: false },
        ];
        vscode.workspace.getConfiguration('codealignment').update('shortcuts', defaults, vscode.ConfigurationTarget.Global);
        this.update();
    }

    private resetSelectors(): void {
        const config = vscode.workspace.getConfiguration('codealignment');
        config.update('scopeSelectorLineValues', '', vscode.ConfigurationTarget.Global);
        config.update('scopeSelectorLineEnds', '', vscode.ConfigurationTarget.Global);
        this.update();
    }

    public dispose(): void {
        OptionsPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private getHtmlForWebview(): string {
        const config = vscode.workspace.getConfiguration('codealignment');
        const shortcuts = config.get<any[]>('shortcuts') || [];
        const useIdeTabSettings = config.get<boolean>('useIdeTabSettings') ?? true;
        const xmlTypes = config.get<string[]>('xmlTypes') || [];
        const vlTypes = config.get<string[]>('vlTypes') || ['.v', '.sv', '.vh', '.svh', '.vhd', '.svp'];
        const scopeSelectorLineValues = config.get<string>('scopeSelectorLineValues') || '';
        const scopeSelectorLineEnds = config.get<string>('scopeSelectorLineEnds') || '';

        const shortcutsJson = JSON.stringify(shortcuts);
        const xmlTypesJson = JSON.stringify(xmlTypes);

        const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Alignment Options</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); padding: 20px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
        h2 { margin: 20px 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid var(--vscode-widget-border); }
        h2:first-child { margin-top: 0; }
        .section { margin-bottom: 20px; }
        label { display: block; margin-bottom: 6px; font-weight: 500; }
        input[type="text"], textarea, select { width: 100%; padding: 6px 10px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; font-family: var(--vscode-editor-font-family, monospace); font-size: 13px; }
        textarea { resize: vertical; min-height: 60px; }
        input[type="checkbox"] { margin-right: 8px; }
        .checkbox-row { display: flex; align-items: center; margin-bottom: 12px; }
        .checkbox-row label { display: inline-flex; align-items: center; font-weight: normal; cursor: pointer; margin: 0; }
        button { padding: 6px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer; font-size: 13px; margin-right: 8px; margin-bottom: 8px; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
        button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
        .shortcut-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .shortcut-table th, .shortcut-table td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--vscode-widget-border); font-size: 13px; }
        .shortcut-table th { font-weight: 600; background: var(--vscode-sideBarSectionHeader-background); }
        .shortcut-table input[type="text"] { width: 120px; padding: 4px 6px; }
        .shortcut-table input[type="checkbox"] { width: auto; margin: 0; }
        .shortcut-table select { width: 120px; padding: 4px 6px; }
        .actions { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--vscode-widget-border); }
        .hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
        .del-btn { background: var(--vscode-inputValidation-errorBackground); color: var(--vscode-inputValidation-errorForeground); padding: 2px 8px; font-size: 12px; }
    </style>
</head>
<body>
    <h2>General</h2>
    <div class="section">
        <div class="checkbox-row">
            <label>
                <input type="checkbox" id="useIdeTabSettings" ${useIdeTabSettings ? 'checked' : ''}>
                Use IDE tab settings for alignments
            </label>
        </div>
    </div>

    <h2>Keyboard Shortcuts</h2>
    <div class="section">
        <table class="shortcut-table" id="shortcutTable">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Alignment</th>
                    <th>Language</th>
                    <th>From Caret</th>
                    <th>Regex</th>
                    <th>Add Space</th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="shortcutBody"></tbody>
        </table>
        <button id="addShortcutBtn">+ Add Shortcut</button>
        <button id="resetShortcutsBtn" class="secondary">Restore Defaults</button>
    </div>

    <h2>Auto Selection</h2>
    <div class="section">
        <label for="xmlTypes">XML File Types (one per line)</label>
        <textarea id="xmlTypes" rows="6">${esc(xmlTypes.join('\n'))}</textarea>
        <div class="hint">File extensions that should use XML scope selection for alignment.</div>

        <label for="vlTypes" style="margin-top: 12px;">Verilog/SV File Types (one per line)</label>
        <textarea id="vlTypes" rows="4">${esc(vlTypes.join('\n'))}</textarea>
        <div class="hint">File extensions to treat as Verilog/SystemVerilog for smart block-boundary alignment.</div>

        <label for="scopeSelectorLineValues" style="margin-top: 12px;">Scope Selector Line Values</label>
        <input type="text" id="scopeSelectorLineValues" value="${escAttr(scopeSelectorLineValues)}">
        <div class="hint">Space-separated values that match blank lines for scope selection.</div>

        <label for="scopeSelectorLineEnds" style="margin-top: 12px;">Scope Selector Line Ends</label>
        <input type="text" id="scopeSelectorLineEnds" value="${escAttr(scopeSelectorLineEnds)}">
        <div class="hint">Space-separated patterns that match line endings for scope selection.</div>

        <button id="resetSelectorsBtn" class="secondary" style="margin-top: 8px;">Restore Defaults</button>
    </div>

    <div class="actions">
        <button id="saveBtn">Save Settings</button>
    </div>

    <script>
        var KEY_NAMES = {
            48:'D0',49:'D1',50:'D2',51:'D3',52:'D4',53:'D5',54:'D6',55:'D7',56:'D8',57:'D9',
            65:'A',66:'B',67:'C',68:'D',69:'E',70:'F',71:'G',72:'H',73:'I',74:'J',
            75:'K',76:'L',77:'M',78:'N',79:'O',80:'P',81:'Q',82:'R',83:'S',84:'T',
            85:'U',86:'V',87:'W',88:'X',89:'Y',90:'Z',32:'Space',106:'Num*',107:'Num+',
            109:'Num-',110:'Num.',111:'Num/',186:';',187:'=',188:',',189:'-',190:'.',
            191:'/',192:'~',219:'[',220:'\\\\',221:']',222:"'",226:'\\\\'
        };

        var KEY_OPTIONS = Object.entries(KEY_NAMES).map(function(e) { return '<option value="'+e[0]+'">'+e[1]+'</option>'; }).join('');

        var shortcuts = ${shortcutsJson};

        function renderShortcuts() {
            var tbody = document.getElementById('shortcutBody');
            var html = '';
            for (var i = 0; i < shortcuts.length; i++) {
                var s = shortcuts[i];
                var keyOpts = Object.entries(KEY_NAMES).map(function(e) {
                    return '<option value="'+e[0]+'"' + (e[0] == s.value.toString() ? ' selected' : '') + '>'+e[1]+'</option>';
                }).join('');
                html += '<tr>' +
                    '<td><select data-idx="'+i+'" data-field="value">'+keyOpts+'</select></td>' +
                    '<td><input type="text" value="'+escapeAttr(s.alignment || '')+'" data-idx="'+i+'" data-field="alignment"></td>' +
                    '<td><input type="text" value="'+escapeAttr(s.language || '')+'" data-idx="'+i+'" data-field="language" placeholder="(any)"></td>' +
                    '<td><input type="checkbox" '+(s.alignFromCaret ? 'checked' : '')+' data-idx="'+i+'" data-field="alignFromCaret"></td>' +
                    '<td><input type="checkbox" '+(s.useRegex ? 'checked' : '')+' data-idx="'+i+'" data-field="useRegex"></td>' +
                    '<td><input type="checkbox" '+(s.addSpace ? 'checked' : '')+' data-idx="'+i+'" data-field="addSpace"></td>' +
                    '<td><button class="del-btn" data-idx="'+i+'">X</button></td>' +
                '</tr>';
            }
            tbody.innerHTML = html;

            var selects = tbody.querySelectorAll('select');
            for (var j = 0; j < selects.length; j++) {
                selects[j].addEventListener('change', function(e) {
                    var idx = parseInt(this.dataset.idx);
                    shortcuts[idx].value = parseInt(this.value);
                });
            }
            var textInputs = tbody.querySelectorAll('input[type="text"]');
            for (var k = 0; k < textInputs.length; k++) {
                textInputs[k].addEventListener('change', function(e) {
                    var idx = parseInt(this.dataset.idx);
                    var field = this.dataset.field;
                    shortcuts[idx][field] = this.value;
                });
            }
            var checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
            for (var m = 0; m < checkboxes.length; m++) {
                checkboxes[m].addEventListener('change', function(e) {
                    var idx = parseInt(this.dataset.idx);
                    var field = this.dataset.field;
                    shortcuts[idx][field] = this.checked;
                });
            }
            var delBtns = tbody.querySelectorAll('.del-btn');
            for (var n = 0; n < delBtns.length; n++) {
                delBtns[n].addEventListener('click', function(e) {
                    var idx = parseInt(this.dataset.idx);
                    shortcuts.splice(idx, 1);
                    renderShortcuts();
                });
            }
        }

        function escapeAttr(str) {
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        document.getElementById('addShortcutBtn').addEventListener('click', function() {
            shortcuts.push({value:187,alignment:'=',language:null,alignFromCaret:false,useRegex:false,addSpace:false});
            renderShortcuts();
        });

        document.getElementById('resetShortcutsBtn').addEventListener('click', function() {
            shortcuts = [
                {value:187,alignment:'=',language:null,alignFromCaret:false,useRegex:false,addSpace:false},
                {value:32,alignment:' ',language:null,alignFromCaret:false,useRegex:false,addSpace:false},
                {value:190,alignment:'.',language:null,alignFromCaret:false,useRegex:false,addSpace:false},
                {value:222,alignment:'"',language:null,alignFromCaret:false,useRegex:false,addSpace:false},
                {value:77,alignment:'m_',language:null,alignFromCaret:false,useRegex:false,addSpace:false}
            ];
            renderShortcuts();
        });

        document.getElementById('resetSelectorsBtn').addEventListener('click', function() {
            document.getElementById('scopeSelectorLineValues').value = '';
            document.getElementById('scopeSelectorLineEnds').value = '';
        });

        document.getElementById('saveBtn').addEventListener('click', function() {
            var vscode = acquireVsCodeApi();
            var data = {
                shortcuts: shortcuts,
                useIdeTabSettings: document.getElementById('useIdeTabSettings').checked,
                xmlTypes: document.getElementById('xmlTypes').value.split('\\n').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; }),
                vlTypes: document.getElementById('vlTypes').value.split('\\n').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; }),
                scopeSelectorLineValues: document.getElementById('scopeSelectorLineValues').value.trim(),
                scopeSelectorLineEnds: document.getElementById('scopeSelectorLineEnds').value.trim()
            };
            vscode.postMessage({command:'saveOptions',data:data});
        });

        renderShortcuts();
    </script>
</body>
</html>`;
    }
}

export { OptionsPanel };
