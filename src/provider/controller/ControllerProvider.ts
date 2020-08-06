import * as vscode from 'vscode';
import { getFullTextType } from '../../util';
import { FSProvider } from '../../FsProvider';
import { createFunctionControllerAction } from './handleFunction';
import { insertConstructorAction } from './handleConstructor';





export class ControllerActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any,
    ): vscode.CodeAction[] | undefined {
        const functionActions = createFunctionControllerAction(document, range)
        if (functionActions && functionActions.length) {
            return functionActions
        }

        const constructorActions = insertConstructorAction(document, range)
        if (constructorActions && constructorActions.length) {
            return constructorActions
        }

    }

}