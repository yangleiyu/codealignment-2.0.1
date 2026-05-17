export class DelimiterResult {
    constructor(
        public compareIndex: number,
        public insertIndex: number
    ) {}

    static create(index: number): DelimiterResult {
        return new DelimiterResult(index, index);
    }
}

export interface IDelimiterFinder {
    getIndex(source: string, delimiter: string, minIndex: number, tabSize: number): DelimiterResult;
}
