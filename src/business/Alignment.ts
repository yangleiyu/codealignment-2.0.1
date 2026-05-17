import { IDocument } from './interfaces/IDocument';
import { IScopeSelector } from './interfaces/IScopeSelector';
import { IDelimiterFinder } from './interfaces/IDelimiterFinder';
import { NormalDelimiterFinder } from './delimiterFinders/NormalDelimiterFinder';
import { LineDetails } from './LineDetails';

export class Alignment {
    public view!: IDocument;
    public selector!: IScopeSelector;
    public finder: IDelimiterFinder;
    public useIdeTabSettings: boolean;

    constructor() {
        this.finder = new NormalDelimiterFinder();
        this.useIdeTabSettings = true;
    }

    performAlignment(delimiter: string, minIndex: number = 0, addSpace: boolean = false): number {
        const lines = this.selector.getLinesToAlign(this.view);
        const lineDetailsArr = lines
            .map(x => new LineDetails(x, this.finder, delimiter, minIndex, this.view.tabSize))
            .filter(y => y.index >= 0);

        if (lineDetailsArr.length === 0) {
            return -1;
        }

        const maxPosition = Math.max(...lineDetailsArr.map(y => y.position));
        const targetItems = lineDetailsArr.filter(y => y.position === maxPosition);
        const targetPosition = Math.max(...targetItems.map(x => x.getPositionToAlignTo(addSpace, this.view.tabSize)));

        this.commitChanges(lineDetailsArr, targetPosition);
        return targetPosition;
    }

    private commitChanges(data: LineDetails[], targetPosition: number): void {
        const edit = this.view.startEdit();
        try {
            for (const change of data) {
                const spaces = this.getSpacesToInsert(change.position, targetPosition);
                if (!edit.insert(change.line, change.index, spaces)) {
                    return;
                }
            }
            edit.commit();
        } finally {
            edit.dispose?.();
        }
    }

    private getSpacesToInsert(startIndex: number, endIndex: number): string {
        const useSpaces = this.view.convertTabsToSpaces;
        if (useSpaces || !this.useIdeTabSettings) {
            return ' '.repeat(endIndex - startIndex);
        }

        const spaces = endIndex % this.view.tabSize;
        const tabs = Math.ceil((endIndex - spaces - startIndex) / this.view.tabSize);

        if (tabs <= 0) {
            return ' '.repeat(endIndex - startIndex);
        }

        return '\t'.repeat(tabs) + ' '.repeat(spaces);
    }
}
