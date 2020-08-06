import * as vscode from 'vscode';
import { EntityAction, PropertyType } from '../../constant';
import { getFullTextType } from '../../util';

export function createPropertyAction(document: vscode.TextDocument, range: vscode.Range) {
    if (isEntityProperties(document, range)) {
        const addProperty = createAddPropertyAction(document, range)

        return [addProperty];
    }

    return []
}

function createAddPropertyAction(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
    const entity = new vscode.CodeAction(EntityAction.AddProperty, vscode.CodeActionKind.QuickFix);

    entity.command = {
        command: EntityAction.AddProperty,
        title: 'Add property: ',
        tooltip: 'Add property: ',
        arguments: [document]
    };

    return entity;
}

function isEntityProperties(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('PROPERTIES') && document.fileName.includes('entity/')
}


export async function addProperty(document: vscode.TextDocument) {
    let template = ''

    const type = await vscode.window.showQuickPick([
        PropertyType.String,
        PropertyType.Number,
        PropertyType.Boolean,
        PropertyType.Text,
        PropertyType.Double,
        PropertyType.IsBlockColumn,
        PropertyType.IsDeleteColumn,
        PropertyType.BalanceColumn,
    ])

    const edit = new vscode.WorkspaceEdit();

    for (let index = 0; index < document.lineCount; index++) {
        const line = document.lineAt(index)

        if (line.text.includes('PROPERTIES')) {
            switch (type) {
                case PropertyType.String:
                case PropertyType.Number:
                case PropertyType.Boolean:
                case PropertyType.Double:
                case PropertyType.Text:
                    template = await generateProperty(type)
                    if (!template) return
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                    break

                case PropertyType.BalanceColumn:
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), `
                    @Column({ default: 0, width: 20 })
                    @JsonProperty()
                    balance: number;
                    `);
                    break

                case PropertyType.IsBlockColumn:
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), `
                    @Column({ default: false })
                    @JsonProperty()
                    isBlock: boolean
                    `);
                    break

                case PropertyType.IsDeleteColumn:
                    edit.insert(document.uri, new vscode.Position(index + 1, 0), `
                    @Column({ default: false, select: false })
                    @JsonProperty()
                    isDeleted: boolean
                    `);
                    break

                default:
                    break;
            }
        }
    }

    vscode.workspace.applyEdit(edit)
}

async function generateProperty(propertyType: PropertyType) {
    const inputName = await vscode.window.showInputBox({
        placeHolder: 'Enter property name: ',
        ignoreFocusOut: true
    })
    if (!inputName) return ''

    const fullTextType = getFullTextType(inputName)

    switch (propertyType) {
        case PropertyType.String:
            return `
            @Column({ default: '' })
            @JsonProperty()
            ${fullTextType.camelCase}: string
            `

        case PropertyType.Number:
            return `
            @Column({ default: 0 })
            @JsonProperty()
            ${fullTextType.camelCase}: number
            `

        case PropertyType.Boolean:
            return `
            @Column({ default: false })
            @JsonProperty()
            ${fullTextType.camelCase}: boolean
            `

        case PropertyType.Double:
            return `
            @Column("double", { default: 0 })
            @JsonProperty()
            ${fullTextType.camelCase}: number
            `

        case PropertyType.Text:
            return `
            @Column('text', { nullable: true })
            @JsonProperty()
            ${fullTextType.camelCase}: string;
            `

        default:
            return ''
    }
}