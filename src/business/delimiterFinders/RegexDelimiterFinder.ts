import { DelimiterResult } from '../interfaces/IDelimiterFinder';
import { NormalDelimiterFinder } from './NormalDelimiterFinder';

export class RegexDelimiterFinder extends NormalDelimiterFinder {
    getIndex(source: string, delimiter: string, minIndex: number, tabSize: number): DelimiterResult {
        minIndex = this.tabbifyIndex(source, minIndex, tabSize);

        if (source.length < minIndex) {
            return DelimiterResult.create(-1);
        }

        let regex: RegExp;
        try {
            regex = new RegExp(delimiter);
        } catch {
            return DelimiterResult.create(-1);
        }

        const substring = source.substring(minIndex);
        const match = regex.exec(substring);

        if (!match) {
            return DelimiterResult.create(-1);
        }

        const matchIndex = match.index;
        return new DelimiterResult(
            minIndex + this.getGroupIndex(match, ['compare', 'x']),
            minIndex + this.getGroupIndex(match, ['insert', 'compare', 'x'])
        );
    }

    private getGroupIndex(match: RegExpExecArray, keys: string[]): number {
        for (const key of keys) {
            if (match.groups && match.groups[key] !== undefined) {
                const groupIndex = match.index + match[0].indexOf(match.groups[key]);
                if (groupIndex >= match.index) {
                    return groupIndex;
                }
            }
        }
        return match.index;
    }
}
