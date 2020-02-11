import { FSProvider } from './../FsProvider';
import * as vscode from 'vscode';
import { getFullTextType } from '../util';

export enum EntityAction {
    AddProperty = 'BMD: Add property',
    OneToMany = 'BMD: OneToMany with ',
    ManyToOne = 'BMD: ManyToOne with ',
    ManyToMany = 'BMD: ManyToMany with ',
}

enum PropertyType {
    String = 'STRING',
    Number = 'NUMBER',
    Boolean = 'BOOLEAN',
    Text = 'TEXT',
    Double = 'DOUBLE',
    BalanceColumn = 'BALANCE COLUMN',
    IsBlockColumn = 'IS BLOCK COLUMN',
    IsShowColumn = 'IS SHOW COLUMN'
}

export class EntityActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] | undefined {

        if (!this.isEntityClass(document, range)) return

        const insertOneToMany = this.createEntityFunc(document, range, EntityAction.OneToMany);
        const insertManyToOne = this.createEntityFunc(document, range, EntityAction.ManyToOne);
        const insertManyToMany = this.createEntityFunc(document, range, EntityAction.ManyToMany);
        const addProperty = this.createEntityFunc(document, range, EntityAction.AddProperty);

        vscode.commands.executeCommand('editor.action.formatDocument')

        return [
            addProperty,
            insertOneToMany,
            insertManyToOne,
            insertManyToMany
        ];
    }

    private isEntityClass(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('CoreEntity') && line.text.includes('class')
    }


    private createEntityFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityAction): vscode.CodeAction {
        const entity = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        switch (typeFunc) {
            case EntityAction.AddProperty:
                entity.command = {
                    command: typeFunc,
                    title: 'Add property: ',
                    tooltip: 'Add property: ',
                    arguments: [document]
                };
                break

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

            default:
                break;

        }

        return entity;
    }

    public async addProperty(document: vscode.TextDocument) {
        let template = ''
        const type = await vscode.window.showQuickPick([
            PropertyType.String,
            PropertyType.Number,
            PropertyType.Boolean,
            PropertyType.Text,
            PropertyType.Double,
            PropertyType.IsBlockColumn,
            PropertyType.IsShowColumn,
            PropertyType.BalanceColumn,
        ])
        const edit = new vscode.WorkspaceEdit();

        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index)

            if (line.text.includes('RELATIONS')) {
                switch (type) {
                    case PropertyType.String:
                    case PropertyType.Number:
                    case PropertyType.Boolean:
                    case PropertyType.Double:
                    case PropertyType.Text:
                        template = await this.generateProperty(type)
                        if (!template) return
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), template);
                        break

                    case PropertyType.BalanceColumn:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), `
                        @Column({ default: 0, width: 20 })
                        @JsonProperty()
                        balance: number;
                        `);
                        break

                    case PropertyType.IsBlockColumn:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), `
                        @Column({ default: false })
                        @JsonProperty()
                        isBlock: boolean
                        `);
                        break

                    case PropertyType.IsShowColumn:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), `
                        @Column({ default: true })
                        @JsonProperty()
                        isShow: boolean
                        `);
                        break

                    default:
                        break;
                }
            }
        }

        vscode.workspace.applyEdit(edit)
    }

    public async generateProperty(propertyType: PropertyType) {
        const inputName = await vscode.window.showInputBox({ placeHolder: 'Enter property name: ' })
        if (!inputName) return ''
        const fullTextType = getFullTextType(inputName)
        switch (propertyType) {
            case PropertyType.String:
                return `
                @Column({ default: "" })
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
                @Column('text', { default: '' })
                @JsonProperty()
                ${fullTextType.camelCase}: string;
                `

            default:
                return ''
        }
    }

    public async insertEntityFunc(typeFunc: EntityAction, document: vscode.TextDocument): Promise<void> {
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
                        template = await this.generateRelations(entity, EntityAction.OneToMany)
                        if (!template) return
                        edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                        break

                    case EntityAction.ManyToOne:
                        template = await this.generateRelations(entity, EntityAction.ManyToOne)
                        if (!template) return
                        edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
                        break

                    case EntityAction.ManyToMany:
                        template = await this.generateRelations(entity, EntityAction.ManyToMany)
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

    private generateRelations = async (name1: string, relation: EntityAction) => {
        const entities = FSProvider.getAllFileInFolder('/src/entity')
        const name2 = await vscode.window.showQuickPick(entities, { placeHolder: 'Select entity' })
        if (!name2) return ''

        const nameTextTypes1 = getFullTextType(name1)
        const nameTextTypes2 = getFullTextType(name2)
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
                @ManyToOne(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}}s)
                {{camel2}}s: {{cap2}}[];
                `
                break;
        }

        injectString1 = injectString1.replace(/{{camel1}}/g, nameTextTypes1.camelCase);
        injectString1 = injectString1.replace(/{{camel2}}/g, nameTextTypes2.camelCase);
        injectString1 = injectString1.replace(/{{cap1}}/g, nameTextTypes1.classifyCase);
        injectString1 = injectString1.replace(/{{cap2}}/g, nameTextTypes2.classifyCase);

        return injectString1
    }

    private getPropertiesEntity(name: string): any {
        const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
        if (!lines.length) return
        const properties = []
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (line.includes('@Column')) {
                let lineProperty = lines[index + 2]
                lineProperty = lineProperty.replace(':', '').replace(';', '')
                const words = lineProperty.split(' ').filter(Boolean)
                if (words.length > 1 && words[1] == 'number') properties.push(words[0])
                else continue
            }
        }
        return properties
    }

}
