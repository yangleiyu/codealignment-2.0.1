import * as vscode from 'vscode';

export class Options {
    private static readonly DEFAULT_XML_TYPES = [
        '.xml', '.xaml', '.cshtml', '.aspx', '.ascx', '.master',
        '.html', '.htm', '.svg', '.xslt', '.config', '.resx',
        '.targets', '.xul', '.vcproj', '.csproj', '.vbproj'
    ];

    private static readonly DEFAULT_VL_TYPES = [
        '.v', '.sv', '.vh', '.svh', '.vhd', '.svp'
    ];

    get xmlTypes(): string[] {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<string[]>('xmlTypes') || Options.DEFAULT_XML_TYPES;
    }

    get vlTypes(): string[] {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<string[]>('vlTypes') || Options.DEFAULT_VL_TYPES;
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

    get scopeSelectorLineEnds(): string {
        return vscode.workspace.getConfiguration('codealignment').get<string>('scopeSelectorLineEnds') || '';
    }

    get useIdeTabSettings(): boolean {
        const config = vscode.workspace.getConfiguration('codealignment');
        return config.get<boolean>('useIdeTabSettings') ?? true;
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
}
