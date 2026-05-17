export interface ILine {
    position: number;
    text: string;
}

export interface IEdit {
    insert(line: ILine, position: number, text: string): boolean;
    commit(): void;
    dispose?(): void;
    [Symbol.dispose]?(): void;
}

export interface IDocument {
    readonly lineCount: number;
    readonly startSelectionLineNumber: number;
    readonly endSelectionLineNumber: number;
    readonly caretColumn: number;
    readonly convertTabsToSpaces: boolean;
    readonly tabSize: number;
    readonly fileType: string;

    getLineFromLineNumber(lineNo: number): ILine;
    startEdit(): IEdit;
    refresh(): void;
}
