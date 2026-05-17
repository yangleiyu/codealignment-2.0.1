import { Key } from './Key';

export interface IKeyShortcut {
    value: Key;
    alignment: string;
    language: string | null;
    alignFromCaret: boolean;
    useRegex: boolean;
    addSpace: boolean;
}

export class KeyShortcut implements IKeyShortcut {
    constructor(
        public value: Key,
        public alignment: string,
        public language: string | null = null,
        public alignFromCaret: boolean = false,
        public useRegex: boolean = false,
        public addSpace: boolean = false
    ) {}
}
