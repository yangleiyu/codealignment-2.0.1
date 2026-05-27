import * as vscode from 'vscode';
import { Alignment } from './business/Alignment';
import { Options } from './business/Options';
import { RegexDelimiterFinder } from './business/delimiterFinders/RegexDelimiterFinder';
import { GeneralScopeSelector } from './business/selectors/GeneralScopeSelector';
import { XmlScopeSelector } from './business/selectors/XmlScopeSelector';
import { VerilogScopeSelector } from './business/selectors/VerilogScopeSelector';
import { VSCodeDocument } from './VSCodeDocument';
import { readAlignments } from './alignments';

export class AlignFunctions {
    private options = new Options();

    constructor(private editor: vscode.TextEditor) {}

    alignByIndex(index: number): void {
        const alignments = readAlignments();
        if (index < 0 || index >= alignments.length) {
            return;
        }

        const delimiter = alignments[index].delimiter;
        this.doAlign(delimiter);

        if (delimiter === '(') {
            this.doAlign(')');
        }
    }

    async customAlign(): Promise<void> {
        const result = await vscode.window.showInputBox({
            prompt: 'Enter delimiter string to align by',
            placeHolder: 'e.g., =, <=, //, (, input',
            value: '',
        });

        if (result) {
            this.doAlign(result);

            if (result === '(') {
                this.doAlign(')');
            }
        }
    }

    getDocument(): VSCodeDocument {
        return new VSCodeDocument(this.editor);
    }

    private doAlign(delimiter: string, useRegex: boolean = false): void {
        const alignment = this.createAlignment(useRegex);
        alignment.performAlignment(delimiter, 0, false);
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
}
