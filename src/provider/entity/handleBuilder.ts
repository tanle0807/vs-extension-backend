import * as vscode from 'vscode';
import { EntityAction } from './constant';
import { createEntityActions } from './handleEntity';
import { getEntityFromFunction, getRelationsEntity } from './helper';
import { getFullTextType } from '../../lib/util';

export function createBuilderAction(
    document: vscode.TextDocument, range: vscode.Range
) {
    if (isQueryBuilder(document, range)) {
        const insertBuilderRelation = createInsertBuilderRelation(document, range);

        const {
            entityActions,
            exportInterface,
            propertyActions
        } = createEntityActions(document, range)

        return [
            insertBuilderRelation,
            exportInterface,
            ...propertyActions,
            ...entityActions
        ];
    }

    return []
}

function isQueryBuilder(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('createQueryBuilder')
}


function createInsertBuilderRelation(
    document: vscode.TextDocument, range: vscode.Range
): vscode.CodeAction {
    const entity = new vscode.CodeAction(EntityAction.AddBuilderRelation, vscode.CodeActionKind.QuickFix);

    entity.command = {
        command: EntityAction.AddBuilderRelation,
        title: 'Add builder relation: ',
        tooltip: 'Add builder relation: ',
        arguments: [document, range]
    };

    return entity;
}


export async function insertBuilderRelation(typeFunc: EntityAction, document: vscode.TextDocument, range: vscode.Range) {
    const edit = new vscode.WorkspaceEdit();

    const entityObj = getEntityFromFunction(document, range)
    const entity = entityObj.text

    if (!entity) return vscode.window.showInformationMessage('Can not get entity')

    const relations = getRelationsEntity(entity)
    if (!relations.length) return vscode.window.showInformationMessage('Not exist any relation')

    const relation = await vscode.window.showQuickPick(relations)
    if (!relation) return

    let first = ''
    let second = ''

    if (!relation.includes('.')) {
        first = `${getFullTextType(entity).camelCase}.${relation}`
        second = `${relation}`
    } else {
        first = `${relation}`
        const words = first.split('.')
        second = `${words[1]}`
    }

    const fullText = getFullTextType(entity)

    let template = `.leftJoinAndSelect('{{first}}', '{{second}}')
    `
    template = template.replace(/{{first}}/g, first);
    template = template.replace(/{{second}}/g, second);

    const start = range.start;
    const line = document.lineAt(start.line)

    edit.insert(document.uri, new vscode.Position(line.lineNumber + 1, 12), template);

    vscode.workspace.applyEdit(edit)
}