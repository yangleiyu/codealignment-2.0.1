import * as vscode from 'vscode';
import { AlignFunctions } from './AlignFunctions';
import { IAlignmentItem, readAlignments, DEFAULT_ALIGNMENTS } from './alignments';

const MAX_ALIGN_ITEMS = 15;

export function activate(context: vscode.ExtensionContext) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBar);

    function updateContextKeys(alignments: IAlignmentItem[]): void {
        const count = alignments.length;
        let hasSubmenuItems = false;

        for (let i = 0; i < MAX_ALIGN_ITEMS; i++) {
            const exists = i < count;
            const isSubmenu = exists && alignments[i].submenu === true;

            vscode.commands.executeCommand(
                'setContext',
                `codealignment.hasAlignItem${i}`,
                exists
            );
            vscode.commands.executeCommand(
                'setContext',
                `codealignment.hasTopItem${i}`,
                exists && !isSubmenu
            );
            vscode.commands.executeCommand(
                'setContext',
                `codealignment.hasSubItem${i}`,
                exists && isSubmenu
            );

            if (isSubmenu) hasSubmenuItems = true;
        }

        vscode.commands.executeCommand(
            'setContext',
            'codealignment.hasAlignmentSubmenu',
            hasSubmenuItems
        );

        const topItems = alignments.filter(a => a.submenu !== true);
        const subItems = alignments.filter(a => a.submenu === true);
        const topLines: string[] = [];
        const subLines: string[] = [];
        alignments.forEach((a, idx) => {
            const num = idx + 1;
            if (a.submenu === true) {
                subLines.push(`#${num}: ${a.delimiter} (submenu)`);
            } else {
                topLines.push(`#${num}: ${a.delimiter}`);
            }
        });
        statusBar.tooltip = [
            `Top: ${topItems.length} / Sub: ${subItems.length} items`,
            '─────────────────',
            ...topLines,
            ...(subLines.length > 0 ? ['', 'More Alignments ▶'] : []),
            ...subLines,
        ].join('\n');
        statusBar.text = `$(symbol-misc) ${topItems.length}/${count}`;
        statusBar.show();
    }

    function refresh(): void {
        updateContextKeys(readAlignments());
    }

    refresh();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('codealignment.alignments')) {
                refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.fileName.replace(/\\/g, '/').includes('User/settings.json')) {
                refresh();
            }
        })
    );

    for (let i = 0; i < MAX_ALIGN_ITEMS; i++) {
        const idx = i;
        context.subscriptions.push(
            vscode.commands.registerCommand(`codealignment.alignItem${i}`, () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Code Alignment: No active editor.');
                    return;
                }
                const functions = new AlignFunctions(editor);
                functions.alignByIndex(idx);
            })
        );
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('codealignment.customAlign', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('Code Alignment: No active editor.');
                return;
            }
            const functions = new AlignFunctions(editor);
            await functions.customAlign();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codealignment.configureAlignments', () => {
            vscode.commands.executeCommand('workbench.action.openSettingsJson');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codealignment.restoreDefaultAlignments', async () => {
            const answer = await vscode.window.showWarningMessage(
                'Restore default alignments? This will overwrite your current configuration.',
                { modal: true },
                'Restore'
            );
            if (answer === 'Restore') {
                try {
                    const config = vscode.workspace.getConfiguration('codealignment');
                    await config.update('alignments', DEFAULT_ALIGNMENTS, vscode.ConfigurationTarget.Global);
                    refresh();
                    vscode.window.showInformationMessage('Code Alignment: Default alignments restored.');
                } catch (err) {
                    vscode.window.showErrorMessage(`Failed to restore defaults: ${err}`);
                }
            }
        })
    );
}

export function deactivate() {}
