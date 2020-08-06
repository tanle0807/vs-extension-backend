import * as vscode from 'vscode';
import { getFullTextType } from '../../util';
import { FSProvider } from '../../FsProvider';

export enum ConstructorFunction {
    PrivateService = 'BMD: Private service'
}

export function insertConstructorAction(
    document: vscode.TextDocument,
    range: any,
) {
    if (isConstructorFunction(document, range)) {
        const insertPrivateService = createConstructorFunc(document, range, ConstructorFunction.PrivateService);

        return [
            insertPrivateService
        ]
    } else {
        return []
    }
}

function isConstructorFunction(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('constructor')
}


function createConstructorFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: ConstructorFunction): vscode.CodeAction {
    const controller = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
    switch (typeFunc) {
        case ConstructorFunction.PrivateService:
            controller.command = {
                command: typeFunc,
                title: 'Insert private service.',
                tooltip: 'Insert private service.',
                arguments: [document]
            };
            break


        default:
            break;

    }

    return controller;
}


export async function insertPrivateService(typeFunc: ConstructorFunction, document: any) {
    const edit = new vscode.WorkspaceEdit();
    const services = FSProvider.getAllFileInFolder('/src/services')
    const service = await vscode.window.showQuickPick([...services])
    if (!service) return vscode.window.showInformationMessage('Please select service to complete action')
    const fullTextService = getFullTextType(service)
    const content = `\nprivate ${fullTextService.camelCase}: ${service},`

    for (let index = 0; index < document.lineCount; index++) {
        const line = document.lineAt(index).text
        if (line.includes('constructor')) {
            const matched = 'constructor('
            const indexOf = line.indexOf(matched) != -1 ? line.indexOf(matched) + matched.length : 0
            edit.insert(document.uri, new vscode.Position(index, indexOf), content);
        }
    }

    vscode.workspace.applyEdit(edit)
}