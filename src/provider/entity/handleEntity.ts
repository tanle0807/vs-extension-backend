import * as vscode from 'vscode';
import { getEntityFromFunction, getPropertiesEntity, getRelationsEntityDeeper } from './helper';
import { EntityAction } from './constant';
import { FSProvider } from '../../FsProvider';

export function createEntityActions(
    document: vscode.TextDocument, range: vscode.Range
) {
    const entity = getEntityFromFunction(document, range)
    const properties = getPropertiesEntity(entity)
    const entities = getRelationsEntityDeeper(entity).relations
    let propertyActions: vscode.CodeAction[] = []
    let entityActions: vscode.CodeAction[] = []
    const exportInterface = createExportInterface(document, range, entity)

    if (properties) {
        propertyActions = properties.map(p => {
            const entity = new vscode.CodeAction(p, vscode.CodeActionKind.QuickFix);
            return entity
        })
    }

    if (entities) {
        entityActions = entities.map(e => {
            const entity = new vscode.CodeAction(e, vscode.CodeActionKind.QuickFix);
            return entity
        })
    }

    return { exportInterface, propertyActions, entityActions }
}


export function createExportInterface(
    document: vscode.TextDocument, range: vscode.Range, entity: string
): vscode.CodeAction {
    const action = new vscode.CodeAction(
        EntityAction.ExportInterface,
        vscode.CodeActionKind.QuickFix
    )

    action.command = {
        command: EntityAction.ExportInterface,
        title: EntityAction.ExportInterface,
        tooltip: EntityAction.ExportInterface,
        arguments: [document, range, entity]
    };

    return action
}


export async function createInterface(document: vscode.TextDocument, range: vscode.Range, entity: string) {
    const edit = new vscode.WorkspaceEdit();

    const linesProperty = getPropertyLinesEntity(entity)
    let line = ``
    linesProperty.map((l, i) => {
        i == linesProperty.length - 1 ? line += `${l}` : line += `${l} \n`
    })

    const linesEntity = getLineRelationsEntityDeeper(entity)
    linesEntity.map((l, i) => {
        i == linesEntity.length - 1 ? line += `${l}` : line += `${l} \n`
    })


    let template = `
export interface ${entity} {
${line}
}
    `

    edit.insert(document.uri, new vscode.Position(0, 0), template);
    vscode.workspace.applyEdit(edit)
}

function getPropertyLinesEntity(name: string): any[] {
    const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
    if (!lines.length) return []
    const properties = []
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('@Column')) {
            let lineProperty = lines[index + 2]
            lineProperty = lineProperty.replace(';', '')
            properties.push(`${lineProperty}`)
        }
    }
    return properties
}

function getLineRelationsEntityDeeper(name: string, nameExcept: string = ''): string[] {
    const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
    if (!lines.length) return []
    const relations = []
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('@ManyToMany') || line.includes('@OneToMany') || line.includes('@ManyToOne') || line.includes('@OneToOne')) {
            let lineProperty = lines[index + 1]
            if (lineProperty.includes('@')) {
                lineProperty = lines[index + 2]
            }
            if (lineProperty.includes('@')) {
                lineProperty = lines[index + 3]
            }
            relations.push(lineProperty)
        }
    }

    return relations
}