import * as vscode from 'vscode';
import { EntityAction, PropertyType } from './constant';
import { getFullTextType } from '../../lib/util';
import { FSProvider } from '../../lib/FsProvider';

export function createRelationAction(document: vscode.TextDocument, range: vscode.Range) {
    if (isEntityRelations(document, range)) {
        const insertOneToMany = createAddRelationAction(document, range, EntityAction.OneToMany);
        const insertManyToOne = createAddRelationAction(document, range, EntityAction.ManyToOne);
        const insertManyToMany = createAddRelationAction(document, range, EntityAction.ManyToMany);
        const insertOneToOne = createAddRelationAction(document, range, EntityAction.OneToOne);

        return [
            insertOneToMany,
            insertManyToOne,
            insertManyToMany,
            insertOneToOne
        ];
    }

    return []
}

function isEntityRelations(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('RELATIONS')
}

function createAddRelationAction(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityAction): vscode.CodeAction {
    const entity = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
    switch (typeFunc) {
        case EntityAction.OneToMany:
            entity.command = {
                command: typeFunc,
                title: 'OneToMany with:',
                tooltip: 'OneToMany with:',
                arguments: [document]
            };
            break

        case EntityAction.ManyToOne:
            entity.command = {
                command: typeFunc,
                title: 'ManyToOne with:',
                tooltip: 'ManyToOne with:',
                arguments: [document]
            };
            break

        case EntityAction.ManyToMany:
            entity.command = {
                command: typeFunc,
                title: 'ManyToMany with:',
                tooltip: 'ManyToMany with:',
                arguments: [document]
            };
            break

        case EntityAction.OneToOne:
            entity.command = {
                command: typeFunc,
                title: 'OneToOne with:',
                tooltip: 'OneToOne with:',
                arguments: [document]
            };
            break

    }

    return entity;
}


export async function insertEntityAction(
    typeFunc: EntityAction, document: vscode.TextDocument
): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    let entity = 'Entity'
    let template = ''

    for (let index = 0; index < document.lineCount; index++) {
        const line = document.lineAt(index)
        if (line.text.includes('CoreEntity') && line.text.includes('class')) {
            let words = line.text.split(' ')
            for (let index = 0; index < words.length; index++) {
                const word = words[index];
                if (word == 'class') {
                    entity = words[index + 1]
                }
            }
        }

        if (line.text.includes('RELATIONS')) {
            switch (typeFunc) {
                case EntityAction.OneToMany:
                    template = await generateRelations(entity, EntityAction.OneToMany)
                    if (!template) return
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                    break

                case EntityAction.ManyToOne:
                    template = await generateRelations(entity, EntityAction.ManyToOne)
                    if (!template) return
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                    break

                case EntityAction.ManyToMany:
                    template = await generateRelations(entity, EntityAction.ManyToMany)
                    if (!template) return
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                    break

                case EntityAction.OneToOne:
                    template = await generateRelations(entity, EntityAction.OneToOne)
                    if (!template) return
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                    break

                default:
                    break;
            }
        }
    }

    vscode.workspace.applyEdit(edit)
}

async function generateRelations(name1: string, relation: EntityAction) {
    const entities = FSProvider.getAllFileInFolder('/src/entity')
    let name2 = await vscode.window.showQuickPick(entities, { placeHolder: 'Select entity' })
    if (!name2) return ''

    let injectString1 = ''

    switch (relation) {
        case EntityAction.OneToMany:
            injectString1 = `
            @OneToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}})
            {{camel2}}s: {{cap2}}[];
            `
            break;

        case EntityAction.ManyToOne:
            injectString1 = `
            @ManyToOne(type => {{cap2}}, {{camel2}} => {{camel2}}.{{camel1}}s)
            {{camel2}}: {{cap2}};
            `
            break;

        case EntityAction.ManyToMany:
            injectString1 = `
            @ManyToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}}s)
            {{camel2}}s: {{cap2}}[];
            `
            break;

        case EntityAction.OneToOne:
            injectString1 = `
            @OneToOne(type => {{cap2}}, {{camel2}} => {{camel2}}.{{camel1}})
            {{camel2}}: {{cap2}};
            `
            break;
    }

    const nameTextTypes1 = getFullTextType(name1)
    const nameTextTypes2 = getFullTextType(name2)

    injectString1 = injectString1.replace(/{{camel1}}/g, nameTextTypes1.camelCase);
    injectString1 = injectString1.replace(/{{camel2}}/g, nameTextTypes2.camelCase);
    injectString1 = injectString1.replace(/{{cap1}}/g, nameTextTypes1.classifyCase);
    injectString1 = injectString1.replace(/{{cap2}}/g, nameTextTypes2.classifyCase);

    if (injectString1.includes('ys')) {
        injectString1 = injectString1.replace(/ys/g, 'ies');
    }
    if (injectString1.includes('sss')) {
        injectString1 = injectString1.replace(/sss/g, 'sses');
    }
    return injectString1
}