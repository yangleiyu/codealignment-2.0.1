import { IScopeSelector } from '../interfaces/IScopeSelector';
import { ILine, IDocument } from '../interfaces/IDocument';

export class GeneralScopeSelector implements IScopeSelector {
    constructor(
        public scopeSelectorRegex: string,
        public start?: number,
        public end?: number
    ) {}

    getLinesToAlign(view: IDocument): ILine[] {
        let start = this.start !== undefined ? this.start : view.startSelectionLineNumber;
        let end = this.end !== undefined ? this.end : view.endSelectionLineNumber;

        if (start === end) {
            const blanksAbove = this.findBlanks(view, start, false);
            const blanksBelow = this.findBlanks(view, end, true);

            if (blanksAbove.length > 0) {
                start = blanksAbove[blanksAbove.length - 1] + 1;
            } else {
                start = 0;
            }

            if (blanksBelow.length > 0) {
                end = blanksBelow[0] - 1;
            } else {
                end = view.lineCount - 1;
            }
        }

        const lines: ILine[] = [];
        for (let i = start; i <= end; i++) {
            lines.push(view.getLineFromLineNumber(i));
        }
        return lines;
    }

    private isLineBlank(view: IDocument, lineNo: number): boolean {
        const text = view.getLineFromLineNumber(lineNo).text;
        if (!this.scopeSelectorRegex) {
            return /^\s*$/.test(text);
        }
        try {
            return new RegExp(this.scopeSelectorRegex).test(text);
        } catch {
            return /^\s*$/.test(text);
        }
    }

    private findBlanks(view: IDocument, fromLine: number, goingUp: boolean): number[] {
        const blankLines: number[] = [];

        if (goingUp) {
            for (let i = fromLine; i <= view.lineCount - 1; i++) {
                if (this.isLineBlank(view, i)) {
                    blankLines.push(i);
                } else {
                    break;
                }
            }
        } else {
            for (let i = fromLine; i >= 0; i--) {
                if (this.isLineBlank(view, i)) {
                    blankLines.push(i);
                } else {
                    break;
                }
            }
        }

        return blankLines;
    }
}
