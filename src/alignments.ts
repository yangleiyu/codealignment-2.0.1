import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IAlignmentItem {
    delimiter: string;
    submenu?: boolean;
}

export const DEFAULT_ALIGNMENTS: IAlignmentItem[] = [
    { delimiter: '(' },
    { delimiter: ';' },
    { delimiter: ',' },
    { delimiter: '.' },
    { delimiter: '=' },
    { delimiter: '<=', submenu: true },
    { delimiter: '//', submenu: true },
    { delimiter: '[', submenu: true },
    { delimiter: ']', submenu: true },
    { delimiter: 'reg', submenu: true },
    { delimiter: 'wire', submenu: true },
    { delimiter: 'input', submenu: true },
    { delimiter: 'output', submenu: true },
];

function applyDefaultSubmenu(items: IAlignmentItem[]): IAlignmentItem[] {
    return items.map((item, i) => ({
        ...item,
        submenu: item.submenu !== undefined ? item.submenu
            : (DEFAULT_ALIGNMENTS[i]?.submenu === true ? true : undefined)
    }));
}

function tryReadFromFile(): IAlignmentItem[] | null {
    const candidates = [
        path.join(process.env.APPDATA || '', 'Code', 'User', 'settings.json'),
        path.join(process.env.APPDATA || '', 'Code - Insiders', 'User', 'settings.json'),
    ];
    for (const filePath of candidates) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);
            const raw = json['codealignment.alignments'];
            if (Array.isArray(raw) && raw.length > 0) {
                return raw;
            }
        } catch {
            continue;
        }
    }
    return null;
}

export function readAlignments(): IAlignmentItem[] {
    const fileResult = tryReadFromFile();
    if (fileResult) {
        return applyDefaultSubmenu(fileResult);
    }
    const config = vscode.workspace.getConfiguration('codealignment');
    const result = config.get<IAlignmentItem[]>('alignments');
    if (result && result.length > 0) {
        return applyDefaultSubmenu(result);
    }
    return DEFAULT_ALIGNMENTS.map(a => ({ ...a }));
}
