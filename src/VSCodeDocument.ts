import * as vscode from 'vscode';
import { IDocument, ILine, IEdit } from './business/interfaces/IDocument';
import { LineDetails } from './business/LineDetails';

export class VSCodeLine implements ILine {
    constructor(
        public position: number,
        public text: string
    ) {}
}

interface PendingEdit {
    position: number;
    text: string;
}

export class VSCodeDocument implements IDocument {
    private editor: vscode.TextEditor;
    document: vscode.TextDocument;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
        this.document = editor.document;
    }

    get lineCount(): number {
        return this.document.lineCount;
    }

    get startSelectionLineNumber(): number {
        if (this.editor.selections.length > 0) {
            const selections = [...this.editor.selections].sort((a, b) => a.start.compareTo(b.start));
            return selections[0].start.line;
        }
        return 0;
    }

    get endSelectionLineNumber(): number {
        if (this.editor.selections.length > 0) {
            const selections = [...this.editor.selections].sort((a, b) => b.end.compareTo(a.end));
            return selections[selections.length - 1].end.line;
        }
        return this.document.lineCount - 1;
    }

    get caretColumn(): number {
        const caret = this.editor.selection.active;
        const lineText = this.document.lineAt(caret.line).text;
        const caretCol = caret.character;
        const beforeCaret = lineText.substring(0, caretCol);
        return LineDetails.replaceTabs(beforeCaret, this.tabSize).length;
    }

    get convertTabsToSpaces(): boolean {
        return (this.editor.options.insertSpaces as boolean) ?? true;
    }

    get tabSize(): number {
        return (this.editor.options.tabSize as number) ?? 4;
    }

    get fileType(): string {
        const fileName = this.document.fileName;
        const dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 ? fileName.substring(dotIndex).toLowerCase() : '';
    }

    getLineFromLineNumber(lineNo: number): ILine {
        const line = this.document.lineAt(lineNo);
        return new VSCodeLine(this.document.offsetAt(line.range.start), line.text);
    }

    startEdit(): IEdit {
        return new VSCodeTextEdit(this.editor, this.document);
    }

    refresh(): void {
    }
}

class VSCodeTextEdit implements IEdit {
    private editor: vscode.TextEditor;
    private doc: vscode.TextDocument;
    private pendingEdits: PendingEdit[] = [];

    constructor(editor: vscode.TextEditor, doc: vscode.TextDocument) {
        this.editor = editor;
        this.doc = doc;
    }

    insert(line: ILine, position: number, text: string): boolean {
        const insertOffset = line.position + position;
        this.pendingEdits.push({ position: insertOffset, text });
        return true;
    }

    commit(): void {
        if (this.pendingEdits.length === 0) {
            return;
        }

        this.editor.edit(editBuilder => {
            for (const edit of this.pendingEdits) {
                const pos = this.doc.positionAt(edit.position);
                editBuilder.insert(pos, edit.text);
            }
        });
    }

    dispose(): void {
    }

    [Symbol.dispose](): void {
    }
}
