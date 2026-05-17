import * as vscode from 'vscode';
import { Alignment } from './business/Alignment';
import { Options } from './business/Options';
import { Key, keyFromVSCodeKeyCode, getKeyName } from './business/Key';
import { IDelimiterFinder } from './business/interfaces/IDelimiterFinder';
import { NormalDelimiterFinder } from './business/delimiterFinders/NormalDelimiterFinder';
import { RegexDelimiterFinder } from './business/delimiterFinders/RegexDelimiterFinder';
import { GeneralScopeSelector } from './business/selectors/GeneralScopeSelector';
import { XmlScopeSelector } from './business/selectors/XmlScopeSelector';
import { VerilogScopeSelector } from './business/selectors/VerilogScopeSelector';
import { VSCodeDocument } from './VSCodeDocument';

export interface AlignResult {
    delimiter: string;
    alignFromCaret: boolean;
    useRegex: boolean;
}

export class AlignFunctions {
    private options = new Options();

    constructor(private editor: vscode.TextEditor) {}

    alignBy(alignDelimiter: string, alignFromCaret: boolean = false, useRegex: boolean = false, addSpace: boolean = false): void {
        if (!alignDelimiter) {
            return;
        }
        const alignment = this.createAlignment(useRegex);
        const doc = this.getDocument();
        alignment.performAlignment(alignDelimiter, alignFromCaret ? doc.caretColumn : 0, addSpace);
    }

    alignByKey(key: Key, forceFromCaret: boolean = false): void {
        const doc = this.getDocument();
        const shortcut = this.options.getShortcut(key, doc.fileType);
        if (shortcut) {
            this.alignBy(shortcut.alignment, forceFromCaret || shortcut.alignFromCaret, shortcut.useRegex, shortcut.addSpace);
        }
    }

    alignByDialog(alignFromCaret: boolean = false): void {
        this.showQuickPickDialog(alignFromCaret);
    }

    alignVlNonBlockingAssign(alignFromCaret: boolean = false): void {
        this.alignBy('<=', alignFromCaret, false, false);
    }

    alignVlPortDeclaration(alignFromCaret: boolean = false): void {
        this.alignBy('input', alignFromCaret, false, false);
    }

    alignVlSignalDeclaration(alignFromCaret: boolean = false): void {
        this.alignBy('[', alignFromCaret, false, false);
    }

    alignVlModuleInstance(alignFromCaret: boolean = false): void {
        this.alignBy('.(', alignFromCaret, false, false);
    }

    alignVlInlineComment(alignFromCaret: boolean = false): void {
        this.alignBy('//', alignFromCaret, false, false);
    }

    alignVlAssignStatement(alignFromCaret: boolean = false): void {
        this.alignBy('assign', alignFromCaret, false, false);
    }

    alignVlCaseItems(alignFromCaret: boolean = false): void {
        this.alignBy(':', alignFromCaret, false, false);
    }

    alignVlEquals(addSpace: boolean = true): void {
        this.alignBy('=', false, false, addSpace);
    }

    alignVlCombine(): void {
        const doc = this.getDocument();
        const vlType = doc.fileType;
        if (this.options.isVerilogFile(vlType)) {
            this.alignVlEquals(true);
        } else {
            this.alignBy('=', false, false, true);
        }
    }

    private async showQuickPickDialog(alignFromCaret: boolean): Promise<void> {
        const delimiters = this.options.delimiters;
        const editor = this.editor;
        const doc = this.getDocument();

        const quickPick = vscode.window.createQuickPick();
        quickPick.title = 'Enter String To Align - Code Alignment';
        quickPick.placeholder = 'Enter delimiter string...';
        quickPick.canSelectMany = false;

        quickPick.buttons = [
            {
                iconPath: new vscode.ThemeIcon('regex'),
                tooltip: 'Use Regular Expressions'
            },
            {
                iconPath: new vscode.ThemeIcon('debug-stackframe'),
                tooltip: 'Align From Caret'
            },
            {
                iconPath: new vscode.ThemeIcon('settings-gear'),
                tooltip: 'Options'
            }
        ];

        let useRegex = false;
        let fromCaret = alignFromCaret;

        quickPick.onDidChangeValue(value => {
            quickPick.items = [{ label: value, description: 'Press Enter to align by this delimiter' }];
        });

        quickPick.onDidTriggerButton(button => {
            if (button.tooltip === 'Use Regular Expressions') {
                useRegex = !useRegex;
                quickPick.title = `Enter String To Align${useRegex ? ' (Regex)' : ''} - Code Alignment`;
            } else if (button.tooltip === 'Align From Caret') {
                fromCaret = !fromCaret;
                quickPick.title = `Enter String To Align${fromCaret ? ' (From Caret)' : ''} - Code Alignment`;
            } else if (button.tooltip === 'Options') {
                quickPick.hide();
                vscode.commands.executeCommand('codealignment.showOptions');
            }
        });

        quickPick.onDidAccept(async () => {
            const value = quickPick.value;
            if (value) {
                quickPick.hide();
                await this.options.addDelimiter(value);
                this.alignBy(value, fromCaret, useRegex);
            }
        });

        if (delimiters.length > 0) {
            quickPick.items = delimiters.map(d => ({
                label: d,
                description: 'Recent delimiter'
            }));
        }

        quickPick.show();
    }

    getDocument(): VSCodeDocument {
        return new VSCodeDocument(this.editor);
    }

    private createAlignment(useRegex: boolean = false): Alignment {
        const doc = this.getDocument();
        const alignment = new Alignment();
        alignment.view = doc;
        alignment.useIdeTabSettings = this.options.useIdeTabSettings;

        if (this.options.isVerilogFile(doc.fileType)) {
            alignment.selector = new VerilogScopeSelector(
                this.options.getScopeSelectorRegex(),
                doc.startSelectionLineNumber,
                doc.endSelectionLineNumber
            );
        } else if (this.options.isXmlFile(doc.fileType)) {
            alignment.selector = new XmlScopeSelector(
                this.options.getScopeSelectorRegex(),
                doc.startSelectionLineNumber,
                doc.endSelectionLineNumber
            );
        } else {
            alignment.selector = new GeneralScopeSelector(
                this.options.getScopeSelectorRegex(),
                doc.startSelectionLineNumber,
                doc.endSelectionLineNumber
            );
        }

        if (useRegex) {
            alignment.finder = new RegexDelimiterFinder();
        }

        return alignment;
    }

    startKeyGrabMode(): void {
        const editor = this.editor;
        const options = this.options;
        const doc = this.getDocument();

        const shortcuts = options.shortcuts.filter(s => s.alignment);
        if (shortcuts.length === 0) {
            vscode.window.showInformationMessage('Code Alignment: No shortcut keys configured. Add shortcuts in Options.');
            return;
        }

        let lastAlignment = -1;
        let isChained = false;
        let chainCount = 0;

        const quickPick = vscode.window.createQuickPick();
        quickPick.title = 'Align by Key - Type a key to align (Backspace=from caret)';
        quickPick.placeholder = 'Type a shortcut key... (Esc to exit)';
        quickPick.ignoreFocusOut = true;
        quickPick.matchOnDescription = true;

        const refreshItems = (typedChar: string) => {
            const matchingShortcuts = typedChar
                ? shortcuts.filter(s => {
                    if (!s.alignment) { return false; }
                    const keyChar = String.fromCharCode(s.value);
                    return s.alignment === typedChar ||
                           keyChar === typedChar ||
                           keyChar.toUpperCase() === typedChar.toUpperCase();
                  })
                : shortcuts;

            quickPick.items = matchingShortcuts.map(s => {
                const kName = getKeyName(s.value);
                const flags: string[] = [];
                if (s.alignFromCaret) { flags.push('fromCaret'); }
                if (s.useRegex) { flags.push('regex'); }
                if (s.addSpace) { flags.push('addSpace'); }
                const langStr = s.language || '';
                const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
                return {
                    label: `$(symbol-misc) ${s.alignment}`,
                    description: `Key: ${kName}${langStr ? ` (${langStr})` : ''}${flagStr}`,
                    detail: isChained ? `Chain #${chainCount} - Press another key or Esc to finish` : 'Select to align'
                };
            });
        };

        refreshItems('');

        quickPick.onDidChangeValue(value => {
            if (value.length === 0) {
                refreshItems('');
                return;
            }
            if (value.length === 1) {
                refreshItems(value);
            } else {
                refreshItems(value);
            }
        });

        quickPick.onDidAccept(async () => {
            const selected = quickPick.selectedItems;
            if (selected.length === 0 && quickPick.value.length > 0) {
                const val = quickPick.value;
                const charCode = val.charCodeAt(0);
                const key = keyFromVSCodeKeyCode(charCode);
                if (key !== null) {
                    const shortcut = options.getShortcut(key, doc.fileType);
                    if (shortcut && shortcut.alignment) {
                        await performKeyAlignment(key, shortcut);
                    }
                }
                return;
            }

            if (selected.length > 0) {
                const item = selected[0];
                const alignmentStr = item.label.replace('$(symbol-misc) ', '');
                const matchingShortcut = shortcuts.find(s => s.alignment === alignmentStr);
                if (matchingShortcut) {
                    await performKeyAlignment(matchingShortcut.value, matchingShortcut);
                }
            }
        });

        async function performKeyAlignment(keyPressed: Key, shortcut: any) {
            if (!shortcut || !shortcut.alignment) { return; }

            await editor.edit(editBuilder => {
                const currentDoc = new VSCodeDocument(editor);
                currentDoc.refresh();

                const alignment = new Alignment();
                alignment.view = currentDoc;
                alignment.useIdeTabSettings = options.useIdeTabSettings;
                alignment.finder = shortcut.useRegex ? new RegexDelimiterFinder() : new NormalDelimiterFinder();

                if (options.isVerilogFile(currentDoc.fileType)) {
                    alignment.selector = new VerilogScopeSelector(
                        options.getScopeSelectorRegex(),
                        currentDoc.startSelectionLineNumber,
                        currentDoc.endSelectionLineNumber
                    );
                } else if (options.isXmlFile(currentDoc.fileType)) {
                    alignment.selector = new XmlScopeSelector(
                        options.getScopeSelectorRegex(),
                        currentDoc.startSelectionLineNumber,
                        currentDoc.endSelectionLineNumber
                    );
                } else {
                    alignment.selector = new GeneralScopeSelector(
                        options.getScopeSelectorRegex(),
                        currentDoc.startSelectionLineNumber,
                        currentDoc.endSelectionLineNumber
                    );
                }

                const minIndex = (lastAlignment !== -1)
                    ? lastAlignment + 1
                    : shortcut.alignFromCaret ? currentDoc.caretColumn : 0;

                lastAlignment = alignment.performAlignment(shortcut.alignment, minIndex, shortcut.addSpace);
            });

            isChained = true;
            chainCount++;
            quickPick.title = `Align by Key - Chained (${chainCount}) - Type next key or Esc to finish`;
            refreshItems(quickPick.value);
        }

        quickPick.buttons = [
            {
                iconPath: new vscode.ThemeIcon('debug-stackframe'),
                tooltip: 'Align from Caret'
            },
            {
                iconPath: new vscode.ThemeIcon('close'),
                tooltip: 'Exit Key Grab Mode'
            }
        ];

        quickPick.onDidTriggerButton(button => {
            if (button.tooltip === 'Align from Caret') {
                quickPick.hide();
                this.alignByDialog(true);
            } else if (button.tooltip === 'Exit Key Grab Mode') {
                quickPick.hide();
            }
        });

        quickPick.onDidHide(() => {
            quickPick.dispose();
        });

        quickPick.show();
    }
}
