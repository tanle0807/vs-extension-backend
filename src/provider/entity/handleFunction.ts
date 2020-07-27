import * as vscode from 'vscode';
import { EntityAction } from './constant';
import { FSProvider } from '../../FsProvider';
import { createEntityActions } from './handleEntity';
import { getEntityFromFunction, getRelationsEntity } from './helper';
import { getFullTextType } from '../../util';

export function createAddRelationFunctionAction(
    document: vscode.TextDocument, range: vscode.Range
) {
    if (isEntityFunction(document, range)) {
        const {
            entityActions,
            exportInterface,
            propertyActions
        } = createEntityActions(document, range)

        const insertRelation = insertRelations(document, range)

        return [
            insertRelation,
            exportInterface,
            ...propertyActions,
            ...entityActions
        ];
    }
    return []
}

function isEntityFunction(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('find')
}

function insertRelations(
    document: vscode.TextDocument,
    range: vscode.Range
): vscode.CodeAction {
    const entity = new vscode.CodeAction(EntityAction.AddRelation, vscode.CodeActionKind.QuickFix);

    entity.command = {
        command: EntityAction.AddRelation,
        title: 'Add relation: ',
        tooltip: 'Add relation: ',
        arguments: [document, range]
    };

    return entity;
}

export async function insertEntityFunction(typeFunc: EntityAction, document: vscode.TextDocument, range: vscode.Range) {
    const edit = new vscode.WorkspaceEdit();

    const entity = getEntityFromFunction(document, range)
    if (!entity) return vscode.window.showInformationMessage('Can not get entity')

    const relations = getRelationsEntity(entity)
    if (!relations.length) return vscode.window.showInformationMessage('Not exist any relation')

    const { allLine, mapLines } = getAllFunctionLine(document, range)

    if (allLine.includes('relations')) {
        const relationSelected = getRelationSelected(mapLines)
        const relationNotSelected = relations.filter((item: string) => {
            if (!relationSelected.includes(item)) return item
        })

        if (!relationNotSelected.length) return vscode.window.showInformationMessage('All relation was selected')

        const relation = await vscode.window.showQuickPick(relationNotSelected)
        if (!relation) return

        const { template, position } = handleExistRelation(relation, mapLines)
        if (!position) return vscode.window.showInformationMessage('Can not find position to insert')

        edit.insert(document.uri, position, template)
    } else {
        const relation = await vscode.window.showQuickPick(relations)
        if (!relation) return vscode.window.showInformationMessage('Please select relation')

        const { template, position } = handleNotExistRelation(relation, mapLines)
        if (!position) return vscode.window.showInformationMessage('Can not find position to insert')

        edit.insert(document.uri, position, template);
    }

    vscode.workspace.applyEdit(edit)
}

function getAllFunctionLine(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line).text
    let allLine = line
    let mapLines = new Map()

    mapLines.set(start.line, line)
    if (line.match(/(\(\W*[a-zA-z]+\))|(\(\))|(\))/g) || line.includes('})')) {
        return { allLine, mapLines }
    }

    const isContinue = true
    let currentLine = start.line
    while (isContinue) {
        const nextLine = document.lineAt(currentLine + 1).text
        allLine += nextLine
        mapLines.set(currentLine + 1, nextLine)
        if (nextLine.includes('})')) {
            return { allLine, mapLines }
        }
        currentLine += 1
    }

    return { allLine, mapLines }
}

function getRelationSelected(mapLines: Map<number, string>) {
    for (const [lineNumber, value] of mapLines.entries()) {
        const matchRelations = value.match(/relations:.*\[/)

        if (matchRelations) {
            const matchRelationsProps = value.match(/('\w*'|'\w*\.\w*')/g)

            if (!matchRelationsProps) return []
            return matchRelationsProps.map(prop => prop.replace(/'/g, ''))
        }
    }
    return []
}

function handleExistRelation(relation: string, mapLines: Map<number, string>): any {
    let template = `'${relation}', `
    let indexOf = 0

    for (const [lineNumber, value] of mapLines.entries()) {
        const matchRelations = value.match(/relations:.*\[/)
        if (matchRelations) {
            const matched = matchRelations[0]
            indexOf = value.indexOf(matched) != -1 ? value.indexOf(matched) + matched.length : 0
            return { template, position: new vscode.Position(lineNumber, indexOf) }
        }
    }
}

function handleNotExistRelation(relation: string, mapLines: Map<number, string>): { template: string, position: vscode.Position | null } {
    let template = ``
    let indexOf = 0
    const [firstKey, firstValue] = mapLines.entries().next().value

    const matchBracket = firstValue.match(/(\(\W*[a-zA-Z-_]+,\s{)|(\({)/)
    if (matchBracket?.length) {
        const matched = matchBracket[0]
        template = `\nrelations: ['${relation}'],`
        indexOf = firstValue.indexOf(matched) != -1 ? firstValue.indexOf(matched) + matched.length : 0
        return { template, position: new vscode.Position(firstKey, indexOf) }
    }

    const matchNoBracket = firstValue.match(/\(\W*[a-zA-Z_-\W][^\)]+|(\()/)

    if (matchNoBracket?.length) {
        const matched = matchNoBracket[0]
        template = `{\nrelations: ['${relation}']\n}`
        if (matched.match(/[a-zA-Z]/)) {
            template = `, {\nrelations: ['${relation}']\n}`
        }
        indexOf = firstValue.indexOf(matched) != -1 ? firstValue.indexOf(matched) + matched.length : 0
        return { template, position: new vscode.Position(firstKey, indexOf) }
    }

    return { template, position: null }
}


export function createAddFunctionAction(
    document: vscode.TextDocument, range: vscode.Range
) {
    if (isEntityClassNotBuilder(document, range)) {
        const {
            entityActions,
            exportInterface,
            propertyActions
        } = createEntityActions(document, range)

        const insertQueryBuilder = createEntityFunction(document, range, EntityAction.CreateQueryBuilder);
        const insertFindOneID = createEntityFunction(document, range, EntityAction.FindOneOrThrowID);
        return [
            insertFindOneID,
            insertQueryBuilder,
            exportInterface,
            ...propertyActions,
            ...entityActions
        ];
    }
    return []
}

function isEntityClassNotBuilder(document: vscode.TextDocument, range: vscode.Range) {
    const entities = FSProvider.getAllFileInFolder('/src/entity')

    const start = range.start;
    const line = document.lineAt(start.line);

    let isIncludesEntity = false
    entities.map((entity: string) => {
        if (line.text.includes(entity)) {
            isIncludesEntity = true
        }
    })
    return isIncludesEntity && !line.text.includes('Controller') && !line.text.includes('Service') && !line.text.includes('createQueryBuilder')
}

function createEntityFunction(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityAction): vscode.CodeAction {
    const entity = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
    switch (typeFunc) {

        case EntityAction.CreateQueryBuilder:
            entity.command = {
                command: typeFunc,
                title: 'Create query build: ',
                tooltip: 'Create query build: ',
                arguments: [document, range]
            };
            break

        case EntityAction.FindOneOrThrowID:
            entity.command = {
                command: typeFunc,
                title: 'Find one or throw ID: ',
                tooltip: 'Find one or throw ID: ',
                arguments: [document, range]
            };
            break

        case EntityAction.AddBuilderRelation:
            entity.command = {
                command: typeFunc,
                title: 'Add builder relation: ',
                tooltip: 'Add builder relation: ',
                arguments: [document, range]
            };
            break


        default:
            break;

    }

    return entity;
}

export async function insertQueryBuilder(typeFunc: EntityAction, document: vscode.TextDocument, range: vscode.Range) {
    const edit = new vscode.WorkspaceEdit();

    const entity = getEntityFromFunction(document, range)
    if (!entity) return vscode.window.showInformationMessage('Can not get entity')

    const fullText = getFullTextType(entity)

    let template = `.createQueryBuilder('{{camel}}')
        .where({{backtick}}{{camel}}.name LIKE '%{{dollar}}{search}%' AND {{camel}}.isDeleted = false{{backtick}})
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('{{camel}}.id', 'DESC')
        .getManyAndCount()
    `
    template = template.replace(/{{camel}}/g, fullText.camelCase);
    template = template.replace(/{{cap}}/g, fullText.classifyCase);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');

    const start = range.start;
    const line = document.lineAt(start.line)

    edit.insert(document.uri, new vscode.Position(line.lineNumber, line.text.length + 1), template);

    vscode.workspace.applyEdit(edit)
}


export async function insertFindOneOrThrow(typeFunc: EntityAction, document: vscode.TextDocument, range: vscode.Range) {
    const edit = new vscode.WorkspaceEdit();

    const entity = getEntityFromFunction(document, range)
    if (!entity) return vscode.window.showInformationMessage('Can not get entity')

    const fullText = getFullTextType(entity)

    let template = `.findOneOrThrowId({{camel}}Id, null, '')
    `
    template = template.replace(/{{camel}}/g, fullText.camelCase);
    template = template.replace(/{{cap}}/g, fullText.classifyCase);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');

    const start = range.start;
    const line = document.lineAt(start.line)

    edit.insert(document.uri, new vscode.Position(line.lineNumber, line.text.length + 1), template);

    vscode.workspace.applyEdit(edit)
}