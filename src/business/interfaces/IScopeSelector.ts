import { ILine, IDocument } from './IDocument';

export interface IScopeSelector {
    getLinesToAlign(view: IDocument): ILine[];
}
