import { IScopeSelector } from '../interfaces/IScopeSelector';
import { ILine, IDocument } from '../interfaces/IDocument';
import { GeneralScopeSelector } from './GeneralScopeSelector';

export class VerilogScopeSelector extends GeneralScopeSelector implements IScopeSelector {

    private readonly blockStartRegex = /^\s*(module|interface|package|program|primitive)\s+\w+/i;
    private readonly blockEndRegex   = /^\s*(endmodule|endinterface|endpackage|endprogram|endprimitive)\s*$/i;
    private readonly procStartRegex  = /^\s*(always|always_comb|always_ff|always_latch|initial|final)\b/i;
    private readonly procBlockRegex  = /^\s*(begin|fork)\b/i;
    private readonly genStartRegex   = /^\s*(generate|for\s*\(|if\s*\(|case\s*\()/i;
    private readonly genEndRegex     = /^\s*endgenerate\s*$/i;
    private readonly endBeginRegex   = /^\s*(end|join|join_any|join_none)\b/i;
    private readonly labelRegex      = /^\s*(begin|end)\s*:/;

    getLinesToAlign(view: IDocument): ILine[] {
        let start = this.start !== undefined ? this.start : view.startSelectionLineNumber;
        let end   = this.end   !== undefined ? this.end   : view.endSelectionLineNumber;

        if (start === end) {
            start = this.findVlScopeStart(view, start);
            end   = this.findVlScopeEnd(view, end);
        }

        const lines: ILine[] = [];
        for (let i = start; i <= end; i++) {
            lines.push(view.getLineFromLineNumber(i));
        }
        return lines;
    }

    private isVlBoundary(text: string): boolean {
        return this.blockStartRegex.test(text) ||
               this.blockEndRegex.test(text)   ||
               this.procStartRegex.test(text)   ||
               this.genEndRegex.test(text)      ||
               this.labelRegex.test(text)       ||
               /^\s*$/.test(text);
    }

    private isProcOrGenEnd(text: string): boolean {
        return this.endBeginRegex.test(text) ||
               this.genEndRegex.test(text);
    }

    private findVlScopeStart(view: IDocument, fromLine: number): number {
        for (let i = fromLine; i >= 0; i--) {
            const text = view.getLineFromLineNumber(i).text;
            if (this.blockStartRegex.test(text)) {
                return (i + 1 < view.lineCount) ? i + 1 : i;
            }
            if (/^\s*$/.test(text)) {
                return (i + 1 < view.lineCount) ? i + 1 : i;
            }
            if (this.procStartRegex.test(text) ||
                this.genStartRegex.test(text)) {
                return i;
            }
            if (this.isProcOrGenEnd(text)) {
                return (i + 1 < view.lineCount) ? i + 1 : i;
            }
        }
        return 0;
    }

    private findVlScopeEnd(view: IDocument, fromLine: number): number {
        for (let i = fromLine; i < view.lineCount; i++) {
            const text = view.getLineFromLineNumber(i).text;
            if (this.blockEndRegex.test(text) ||
                this.genEndRegex.test(text)) {
                return (i - 1 >= 0) ? i - 1 : i;
            }
            if (/^\s*$/.test(text)) {
                return (i - 1 >= 0) ? i - 1 : i;
            }
            if (this.endBeginRegex.test(text)) {
                return (i - 1 >= 0) ? i - 1 : i;
            }
            if (this.blockStartRegex.test(text) ||
                this.procStartRegex.test(text)) {
                return (i - 1 >= 0) ? i - 1 : i;
            }
        }
        return view.lineCount - 1;
    }
}
