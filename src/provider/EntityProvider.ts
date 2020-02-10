import { FSProvider } from './../FsProvider';
import * as vscode from 'vscode';
import { getFullTextType } from '../util';

export enum EntityAction {
    OneToMany = 'BMD: OneToMany with ',
    ManyToOne = 'BMD: ManyToOne with ',
    ManyToMany = 'BMD: ManyToMany with ',
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

        vscode.commands.executeCommand('editor.action.formatDocument')

        return [
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
            case EntityAction.OneToMany:
                entity.command = {
                    command: typeFunc,
                    title: 'OneToMany with:',
                    tooltip: 'OneToMany with:'
                };
                break

            case EntityAction.ManyToOne:
                entity.command = {
                    command: typeFunc,
                    title: 'ManyToOne with:',
                    tooltip: 'ManyToOne with:'
                };
                break

            case EntityAction.ManyToMany:
                entity.command = {
                    command: typeFunc,
                    title: 'ManyToMany with:',
                    tooltip: 'ManyToMany with:'
                };
                break

            default:
                break;

        }

        return entity;
    }

    public async insertEntityFunc(typeFunc: EntityAction): Promise<void> {
        const documents = vscode.workspace.textDocuments
        const document = documents[0]
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
        console.log('name1:', name1)
        const entities = FSProvider.getAllFileInFolder('/src/entity')
        const name2 = await vscode.window.showQuickPick(entities, { placeHolder: 'Select entity' })
        console.log('name2:', name2)
        if (!name2) return ''

        const nameTextTypes1 = getFullTextType(name1)
        const nameTextTypes2 = getFullTextType(name2)
        let injectString1 = ''
        let injectString2 = ''
        switch (relation) {
            case EntityAction.OneToMany:
                injectString1 = `
                @OneToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}})
                {{camel2}}s: {{cap2}}[];
                `
                // injectString2 = `
                // @ManyToOne(type => {{cap1}}, {{camel1}} => {{camel1}}.{{camel2}}s)
                // {{camel1}}: {{cap1}};
                // `
                break;

            case EntityAction.ManyToOne:
                // injectString2 = `
                // @OneToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}})
                // {{camel2}}s: {{cap2}}[];
                // `
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

    private generateGetSum = async (name: string): Promise<any> => {
        const properties = this.getPropertiesEntity(name)
        const nameTextTypes = getFullTextType(name)
        const result = await vscode.window.showQuickPick(properties, { placeHolder: 'Sum by: ' })
        if (!result) return

        let template = `
                // =====================GET SUM {{upper}}=====================
                async getTotal{{cap}}(): Promise<number> {
                    const { sum } = await {{cap}}
                        .createQueryBuilder('{{camel}}')
                        .select("sum({{camel}}.${result})", 'sum')
                        .getRawOne()
                    return sum
                }
                `
        template = template.replace(/{{upper}}/g, nameTextTypes.upperCase);
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        return template
    }


}
