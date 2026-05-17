import { IDelimiterFinder, DelimiterResult } from '../interfaces/IDelimiterFinder';

export class NormalDelimiterFinder implements IDelimiterFinder {
    getIndex(source: string, delimiter: string, minIndex: number, tabSize: number): DelimiterResult {
        minIndex = this.tabbifyIndex(source, minIndex, tabSize);

        if (source.length < minIndex) {
            return DelimiterResult.create(-1);
        }

        const result = source.indexOf(delimiter, minIndex);
        return DelimiterResult.create(result);
    }

    protected tabbifyIndex(source: string, minIndex: number, tabSize: number): number {
        let adjustment = 0;
        let index = source.indexOf('\t');

        while (index >= 0 && index < minIndex) {
            const padding = tabSize - (index % tabSize);
            if (index + padding - 1 <= minIndex) {
                adjustment += padding - 1;
            }
            source = source.slice(0, index) + ' '.repeat(padding) + source.slice(index + 1);
            index = source.indexOf('\t');
        }

        return minIndex - adjustment;
    }
}
