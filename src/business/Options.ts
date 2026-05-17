import * as vscode from 'vscode';
import { Key, keyFromVSCodeKeyCode } from './Key';
import { KeyShortcut, IKeyShortcut } from './KeyShortcut';

export class Options {
    private static readonly DEFAULT_XML_TYPES = [
        '.xml', '.xaml', '.cshtml', '.aspx', '.ascx', '.master',
        '.html', '.htm', '.svg', '.xslt', '.config', '.resx',
        '.targets', '.xul', '.vcproj', '.csproj', '.vbproj'
    ];

    private static readonly DEFAULT_VL_TYPES = [
        '.v', '.sv', '.vh', '.svh', '.vhd', '.svp'
    ];

    get shortcuts(): IKeyShortcut[] {
        return vscode.workspace.getConfiguration('codealignment').get<IKeyShortcut[]>('shortcuts') || [];
    }

    set shortcuts(value: IKeyShortcut[]) {
        vscode.workspace.getConfiguration('codealignment').update('shortcuts', value, true);
    }

    get xmlTypes(): string[] {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<string[]>('xmlTypes') || Options.DEFAULT_XML_TYPES;
    }

    set xmlTypes(value: string[]) {
        vscode.workspace.getConfiguration('codealignment').update('xmlTypes', value, true);
    }

    get vlTypes(): string[] {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<string[]>('vlTypes') || Options.DEFAULT_VL_TYPES;
    }

    set vlTypes(value: string[]) {
        vscode.workspace.getConfiguration('codealignment').update('vlTypes', value, true);
    }

    isVerilogFile(fileType: string): boolean {
        return this.vlTypes.includes(fileType);
    }

    isXmlFile(fileType: string): boolean {
        return this.xmlTypes.includes(fileType);
    }

    get scopeSelectorLineValues(): string {
        return vscode.workspace.getConfiguration('codealignment').get<string>('scopeSelectorLineValues') || '';
    }

    set scopeSelectorLineValues(value: string) {
        vscode.workspace.getConfiguration('codealignment').update('scopeSelectorLineValues', value, true);
    }

    get scopeSelectorLineEnds(): string {
        return vscode.workspace.getConfiguration('codealignment').get<string>('scopeSelectorLineEnds') || '';
    }

    set scopeSelectorLineEnds(value: string) {
        vscode.workspace.getConfiguration('codealignment').update('scopeSelectorLineEnds', value, true);
    }

    get useIdeTabSettings(): boolean {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<boolean>('useIdeTabSettings') ?? true;
    }

    set useIdeTabSettings(value: boolean) {
        vscode.workspace.getConfiguration('codealignment').update('useIdeTabSettings', value, true);
    }

    get delimiters(): string[] {
        return vscode.workspace.getConfiguration('codealignment').get<string[]>('delimiters') || [];
    }

    async addDelimiter(delimiter: string): Promise<void> {
        const delimiters = this.delimiters;
        const idx = delimiters.indexOf(delimiter);
        if (idx > -1) {
            delimiters.splice(idx, 1);
        }
        delimiters.unshift(delimiter);
        if (delimiters.length > 20) {
            delimiters.pop();
        }
        await vscode.workspace.getConfiguration('codealignment').update('delimiters', delimiters, true);
    }

    getScopeSelectorRegex(): string {
        const values = this.toOrRegex(this.scopeSelectorLineValues, `^\\s*({0}|)\\s*$`);
        const ends = this.toOrRegex(this.scopeSelectorLineEnds, `({0})\\s*$`);

        if (!ends) {
            return values || '';
        }
        return values ? `(${values}|${ends})` : ends;
    }

    private toOrRegex(input: string, format: string): string | null {
        if (!input || !input.trim()) {
            return null;
        }
        const items = input.split(/[ ]+/).filter(x => x.length > 0).map(x => this.escapeRegex(x));
        if (items.length === 0) {
            return null;
        }

        return format.replace('{0}', items.join('|'));
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getShortcut(key: Key, language?: string): IKeyShortcut | null {
        const matchingShortcuts = this.shortcuts.filter(
            x => x.value === key && (!x.language || x.language === language)
        );

        matchingShortcuts.sort((a, b) => {
            if (a.language === language && b.language !== language) { return -1; }
            if (a.language !== language && b.language === language) { return 1; }
            return 0;
        });

        return matchingShortcuts.length > 0 ? matchingShortcuts[0] : null;
    }

    resetShortcuts(): void {
        this.shortcuts = [
            new KeyShortcut(Key.EqualsPlus, '=', null, false, false, false),
            new KeyShortcut(Key.Space, ' ', null, false, false, false),
            new KeyShortcut(Key.Period, '.', null, false, false, false),
            new KeyShortcut(Key.Quotes, '"', null, false, false, false),
            new KeyShortcut(Key.M, 'm_', null, false, false, false),
        ];
    }

    resetSelectorTypes(): void {
        vscode.workspace.getConfiguration('codealignment').update('scopeSelectorLineValues', '', true);
        vscode.workspace.getConfiguration('codealignment').update('scopeSelectorLineEnds', '', true);
    }
}
