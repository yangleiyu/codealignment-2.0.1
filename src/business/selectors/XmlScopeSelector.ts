import { IScopeSelector } from '../interfaces/IScopeSelector';
import { ILine, IDocument } from '../interfaces/IDocument';
import { GeneralScopeSelector } from './GeneralScopeSelector';

export class XmlScopeSelector extends GeneralScopeSelector implements IScopeSelector {
    private readonly xmlScopeRegex = /^\s*<\/?[^\s>]+/;

    getLinesToAlign(view: IDocument): ILine[] {
        let start = this.start !== undefined ? this.start : view.startSelectionLineNumber;
        let end = this.end !== undefined ? this.end : view.endSelectionLineNumber;

        if (start === end) {
            start = this.findXmlScopeStart(view, start);
            end = this.findXmlScopeEnd(view, end);
        }

        const lines: ILine[] = [];
        for (let i = start; i <= end; i++) {
            lines.push(view.getLineFromLineNumber(i));
        }
        return lines;
    }

    private findXmlScopeStart(view: IDocument, line: number): number {
        for (let i = line; i >= 0; i--) {
            const text = view.getLineFromLineNumber(i).text;
            if (/^\s*$/.test(text)) {
                return i + 1;
            }
            if (this.xmlScopeRegex.test(text)) {
                return i;
            }
        }
        return 0;
    }

    private findXmlScopeEnd(view: IDocument, line: number): number {
        for (let i = line; i < view.lineCount; i++) {
            const text = view.getLineFromLineNumber(i).text;
            if (/^\s*$/.test(text)) {
                return i - 1;
            }
        }
        return view.lineCount - 1;
    }
}
