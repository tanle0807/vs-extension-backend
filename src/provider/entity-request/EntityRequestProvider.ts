import { FSProvider } from '../../FsProvider';
import * as vscode from 'vscode';
import { getFullTextType, toLowerCaseFirstLetter } from '../../util';

export enum EntityRequestAction {
    AddProperty = 'BMD: Add property entity-request',
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

export class EntityRequestActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] | undefined {

        if (this.isEntityRequestProperties(document, range)) {
            const addProperty = this.createEntityFunc(document, range, EntityRequestAction.AddProperty);

            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                addProperty
            ];
        }

    }

    private isEntityRequestProperties(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('PROPERTIES') && document.fileName.includes('entity-request/')
    }


    private createEntityFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityRequestAction): vscode.CodeAction {
        const entity = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        switch (typeFunc) {
            case EntityRequestAction.AddProperty:
                entity.command = {
                    command: typeFunc,
                    title: 'Add property: ',
                    tooltip: 'Add property: ',
                    arguments: [document]
                };
                break

            default:
                break;

        }

        return entity;
    }



    public async addProperty(document: vscode.TextDocument) {
        let entity = this.getEntityFromEntityRequest(document)
        if (!entity)
            return vscode.window.showInformationMessage('Find not found entity')

        const propertiesInEntity = this.getPropertiesEntity(entity)
        if (!propertiesInEntity.length)
            return vscode.window.showInformationMessage('Find not found properties in entity')

        const propertiesInEntityRequest = this.getPropertiesEntityRequest(document)

        const propertiesNotInEntityRequest = propertiesInEntity.filter(property => {
            if (propertiesInEntityRequest.indexOf(property) == -1)
                return property
        })

        if (!propertiesNotInEntityRequest.length)
            return vscode.window.showInformationMessage('All property were selected')

        const property = await vscode.window.showQuickPick([...propertiesNotInEntityRequest])
        if (!property)
            return vscode.window.showInformationMessage('No property was selected')

        const edit = new vscode.WorkspaceEdit();

        let template = this.getTemplatePropertyEntity(entity, property)
        if (!template)
            return vscode.window.showInformationMessage('Can not generate template')

        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index)
            if (line.text.includes('PROPERTIES')) {
                edit.insert(document.uri, new vscode.Position(index + 1, 0), template);
            }
        }

        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index)
            if (line.text.includes(`new ${entity}`)) {
                let templateTo = `${toLowerCaseFirstLetter(entity)}.${property} = this.${property} \n`
                edit.insert(document.uri, new vscode.Position(index + 1, 0), templateTo);
            }
        }

        vscode.workspace.applyEdit(edit)
    }

    private getEntityFromEntityRequest(document: vscode.TextDocument) {
        let entity = ''
        for (let index = 0; index < document.lineCount; index++) {
            let lineText = document.lineAt(index).text
            if (lineText.includes('new')) {
                lineText = lineText.replace('()', '')
                const words = lineText.split(' ')
                entity = words[words.length - 1]
                break;
            }
        }
        return entity
    }


    private getPropertiesEntity(name: string): any[] {
        const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
        if (!lines.length) return []
        const properties = []
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (line.includes('@Column')) {
                let lineProperty = lines[index + 2]
                lineProperty = lineProperty.replace(':', '').replace(';', '')
                const words = lineProperty.split(' ').filter(Boolean)
                if (words.length > 1) properties.push(words[0])
                else continue
            }
        }
        return properties
    }

    private getPropertiesEntityRequest(document: vscode.TextDocument): any {
        const properties: any = []
        for (let index = 0; index < document.lineCount; index++) {
            let lineText = document.lineAt(index).text
            if (lineText.includes('@JsonProperty')) {
                let lineProperty = document.lineAt(index + 1).text
                lineProperty = lineProperty.replace(':', '').replace(';', '')
                const words = lineProperty.split(' ').filter(Boolean)
                if (words.length > 1) properties.push(words[0])
                else continue
            }
        }
        return properties
    }

    private getTemplatePropertyEntity(name: string, property: string): any {

        const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
        if (!lines.length) return vscode.window.showInformationMessage('Can not read file or file is empty')

        let template = ''
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            const lineDecorator = lines[index + 1];
            const lineProperty = lines[index + 2]
            if (line.includes('@Column') && lineProperty.includes(property + ':')) {
                return template = `
${lineDecorator}
${lineProperty}
                `
            }
        }

        return template
    }

}
