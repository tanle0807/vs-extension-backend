import { FSProvider } from './../FsProvider';
import * as vscode from 'vscode';
import { getFullTextType } from '../util';

export enum EntityAction {
    AddProperty = 'BMD: Add property entity',
    OneToMany = 'BMD: OneToMany with ',
    ManyToOne = 'BMD: ManyToOne with ',
    ManyToMany = 'BMD: ManyToMany with ',
    OneToOne = 'BMD: OneToOne with ',

}

export enum EntityFunctionAction {
    AddRelation = 'BMD: Add relation',
    FindOneOrThrowID = 'BMD: Find one or throw ID',
    CreateQueryBuilder = 'BMD: Create query builder',
    AddBuilderRelation = 'BMD: Add relation builder',
}

enum PropertyType {
    String = 'STRING',
    Number = 'NUMBER',
    Boolean = 'BOOLEAN',
    Text = 'TEXT',
    Double = 'DOUBLE',
    BalanceColumn = 'BALANCE COLUMN',
    IsBlockColumn = 'IS BLOCK COLUMN',
    IsDeleteColumn = 'IS DELETE COLUMN'
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

        if (this.isEntityProperties(document, range)) {
            const addProperty = this.createEntityAction(document, range, EntityAction.AddProperty);

            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                addProperty
            ];
        }

        if (this.isEntityRelations(document, range)) {
            const insertOneToMany = this.createEntityAction(document, range, EntityAction.OneToMany);
            const insertManyToOne = this.createEntityAction(document, range, EntityAction.ManyToOne);
            const insertManyToMany = this.createEntityAction(document, range, EntityAction.ManyToMany);
            const insertOneToOne = this.createEntityAction(document, range, EntityAction.OneToOne);

            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                insertOneToMany,
                insertManyToOne,
                insertManyToMany,
                insertOneToOne
            ];
        }

        if (this.isEntityFunction(document, range)) {
            const insertRelation = this.createEntityFunction(document, range, EntityFunctionAction.AddRelation);
            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                insertRelation
            ];
        }

        if (this.isEntityClass(document, range)) {
            const insertQueryBuilder = this.createEntityFunction(document, range, EntityFunctionAction.CreateQueryBuilder);
            const insertFindOneID = this.createEntityFunction(document, range, EntityFunctionAction.FindOneOrThrowID);
            const insertBuilderRelation = this.createEntityFunction(document, range, EntityFunctionAction.AddBuilderRelation);

            return [
                insertFindOneID,
                insertBuilderRelation,
                insertQueryBuilder,
            ];
        }
    }

    private isEntityProperties(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('PROPERTIES') && document.fileName.includes('entity/')
    }

    private isEntityRelations(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('RELATIONS')
    }

    private isEntityFunction(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('find')
    }

    private isEntityClass(document: vscode.TextDocument, range: vscode.Range) {
        const entities = FSProvider.getAllFileInFolder('/src/entity')

        const start = range.start;
        const line = document.lineAt(start.line);

        let isIncludesEntity = false
        entities.map((entity: string) => {
            if (line.text.includes(entity)) {
                isIncludesEntity = true
            }
        })
        return isIncludesEntity && !line.text.includes('Controller') && !line.text.includes('Service')
    }




    private createEntityAction(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityAction): vscode.CodeAction {
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

            case EntityAction.OneToOne:
                entity.command = {
                    command: typeFunc,
                    title: 'OneToOne with:',
                    tooltip: 'OneToOne with:',
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
                        template = await this.generateProperty(type)
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

    public async generateProperty(propertyType: PropertyType) {
        const inputName = await vscode.window.showInputBox({ placeHolder: 'Enter property name: ' })
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

    public async insertEntityAction(typeFunc: EntityAction, document: vscode.TextDocument): Promise<void> {
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

                    case EntityAction.OneToOne:
                        template = await this.generateRelations(entity, EntityAction.OneToOne)
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
                {{camel2}}: {{cap2}}[];
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

    public async insertEntityFunction(typeFunc: EntityFunctionAction, document: vscode.TextDocument, range: vscode.Range) {
        const edit = new vscode.WorkspaceEdit();

        const entity = this.getEntityFromFunction(document, range)
        if (!entity) return vscode.window.showInformationMessage('Can not get entity')

        const relations = this.getRelationsEntity(entity)
        if (!relations.length) return vscode.window.showInformationMessage('Not exist any relation')

        const { allLine, mapLines } = this.getAllFunctionLine(document, range)

        if (allLine.includes('relations')) {
            const relationSelected = this.getRelationSelected(mapLines)
            const relationNotSelected = relations.filter((item: string) => {
                if (!relationSelected.includes(item)) return item
            })

            if (!relationNotSelected.length) return vscode.window.showInformationMessage('All relation was selected')

            const relation = await vscode.window.showQuickPick(relationNotSelected)
            if (!relation) return

            const { template, position } = this.handleExistRelation(relation, mapLines)
            if (!position) return vscode.window.showInformationMessage('Can not find position to insert')

            edit.insert(document.uri, position, template)
        } else {
            const relation = await vscode.window.showQuickPick(relations)
            if (!relation) return vscode.window.showInformationMessage('Please select relation')

            const { template, position } = this.handleNotExistRelation(relation, mapLines)
            if (!position) return vscode.window.showInformationMessage('Can not find position to insert')

            edit.insert(document.uri, position, template);
        }

        vscode.workspace.applyEdit(edit)
    }

    public async insertQueryBuilder(typeFunc: EntityFunctionAction, document: vscode.TextDocument, range: vscode.Range) {
        const edit = new vscode.WorkspaceEdit();

        const entity = this.getEntityFromFunction(document, range)
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
        console.log('range:', range)
        const line = document.lineAt(start.line)
        console.log('line:', line)

        edit.insert(document.uri, new vscode.Position(line.lineNumber, line.text.length + 1), template);

        vscode.workspace.applyEdit(edit)
    }

    public async insertFindOneOrThrow(typeFunc: EntityFunctionAction, document: vscode.TextDocument, range: vscode.Range) {
        const edit = new vscode.WorkspaceEdit();

        const entity = this.getEntityFromFunction(document, range)
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

    public async insertBuilderRelation(typeFunc: EntityFunctionAction, document: vscode.TextDocument, range: vscode.Range) {
        const edit = new vscode.WorkspaceEdit();

        const entity = this.getEntityFromFunction(document, range)
        console.log('entity:', entity)
        if (!entity) return vscode.window.showInformationMessage('Can not get entity')

        const relations = this.getRelationsEntity(entity)
        console.log('relations:', relations)
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

    private getRelationSelected(mapLines: Map<number, string>) {
        for (const [lineNumber, value] of mapLines.entries()) {
            const matchRelations = value.match(/relations:.*\[/)

            if (matchRelations) {
                const matchRelationsProps = value.match(/('\w*'|'\w*\.\w*')/g)
                console.log('matchRelationsProps:', matchRelationsProps)

                if (!matchRelationsProps) return []
                return matchRelationsProps.map(prop => prop.replace(/'/g, ''))
            }
        }
        return []
    }

    private getEntityFromFunction(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        const entities = line.text.match(/\s[A-Z][A-z]+/)
        if (!entities?.length) return ''

        const entity = entities[0].replace(' ', '').replace('.', '')
        return entity
    }

    private handleNotExistRelation(relation: string, mapLines: Map<number, string>): { template: string, position: vscode.Position | null } {
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

    private handleExistRelation(relation: string, mapLines: Map<number, string>): any {
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

    private getAllFunctionLine(document: vscode.TextDocument, range: vscode.Range) {
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

    private getBuilderRelationsEntity(name: string) {
        const finalRelation: any[] = []
        const { relations, entities } = this.getRelationsEntityDeeper(name)
        if (!relations || !relations.length) return []

        relations.map((r: any, i: number) => {
            finalRelation.push(r)
            const nextRelations = this.getRelationsEntityDeeper(entities[i], name)

            if (relations && relations.length) {
                finalRelation.push(...nextRelations.relations.map((n: any) => `${r}.${n}`))
            }
        })
        return finalRelation
    }

    private getRelationsEntity(name: string): any[] {
        const finalRelation: any[] = []
        const { relations, entities } = this.getRelationsEntityDeeper(name)
        if (!relations || !relations.length) return []

        relations.map((r: any, i: number) => {
            finalRelation.push(r)
            const nextRelations = this.getRelationsEntityDeeper(entities[i], name)

            if (relations && relations.length) {
                finalRelation.push(...nextRelations.relations.map((n: any) => `${r}.${n}`))
            }
        })
        return finalRelation
    }

    private getRelationsEntityDeeper(name: string, nameExcept: string = ''): any {
        const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
        if (!lines.length) return []
        const relations = []
        const nextEntity = []
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
                lineProperty = lineProperty.replace(':', '').replace(';', '').replace('[]', '')

                if (nameExcept && lineProperty.includes(nameExcept)) continue

                const words = lineProperty.split(' ').filter(Boolean)
                if (words.length > 1) {
                    relations.push(words[0])
                    nextEntity.push(words[1])
                }
            }
        }

        return { relations, entities: nextEntity }
    }

    private createEntityFunction(document: vscode.TextDocument, range: vscode.Range, typeFunc: EntityFunctionAction): vscode.CodeAction {
        const entity = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        switch (typeFunc) {
            case EntityFunctionAction.AddRelation:
                entity.command = {
                    command: typeFunc,
                    title: 'Add relation: ',
                    tooltip: 'Add relation: ',
                    arguments: [document, range]
                };
                break

            case EntityFunctionAction.CreateQueryBuilder:
                entity.command = {
                    command: typeFunc,
                    title: 'Create query build: ',
                    tooltip: 'Create query build: ',
                    arguments: [document, range]
                };
                break

            case EntityFunctionAction.FindOneOrThrowID:
                entity.command = {
                    command: typeFunc,
                    title: 'Find one or throw ID: ',
                    tooltip: 'Find one or throw ID: ',
                    arguments: [document, range]
                };
                break

            case EntityFunctionAction.AddBuilderRelation:
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
