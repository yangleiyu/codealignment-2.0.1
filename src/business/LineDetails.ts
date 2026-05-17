import { ILine } from './interfaces/IDocument';
import { IDelimiterFinder } from './interfaces/IDelimiterFinder';

export class LineDetails {
    public readonly line: ILine;
    public readonly index: number;
    public readonly position: number;

    constructor(line: ILine, finder: IDelimiterFinder, delimiter: string, minIndex: number, tabSize: number) {
        const withoutTabs = LineDetails.replaceTabs(line.text, tabSize);
        this.line = line;
        this.index = finder.getIndex(line.text, delimiter, minIndex, tabSize).insertIndex;
        this.position = finder.getIndex(withoutTabs, delimiter, minIndex, tabSize).compareIndex;
    }

    getPositionToAlignTo(addSpace: boolean, tabSize: number): number {
        if (addSpace && this.position > 0) {
            const replacedText = LineDetails.replaceTabs(this.line.text, tabSize);
            if (replacedText[this.position - 1] !== ' ') {
                return this.position + 1;
            }
        }
        return this.position;
    }

    static replaceTabs(value: string, tabSize: number): string {
        let index = value.indexOf('\t');
        while (index >= 0) {
            const padding = tabSize - (index % tabSize);
            value = value.substring(0, index) + ' '.repeat(padding) + value.substring(index + 1);
            index = value.indexOf('\t');
        }
        return value;
    }
}
