import { FSProvider } from './../fsProvider';
import * as vscode from 'vscode';
import { getFullTextType } from '../util';

export enum ServiceAction {
    GetLast30 = 'BMD: Get last 30',
    GetSum = 'BMD: Get sum'
}

export class ServiceActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] | undefined {
        if (!this.isServiceClass(document, range)) return

        const insertGetLast30 = this.createServiceFunc(document, range, ServiceAction.GetLast30);
        const insertGetSum = this.createServiceFunc(document, range, ServiceAction.GetSum);

        vscode.commands.executeCommand('editor.action.formatDocument')

        return [
            insertGetLast30,
            insertGetSum
        ];
    }

    private isServiceClass(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('Service') && line.text.includes('class')
    }



    private createServiceFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: ServiceAction): vscode.CodeAction {
        const service = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        service.command = {
            command: typeFunc,
            title: 'Get list with pagination.',
            tooltip: 'Get list with pagination.'
        };
        switch (typeFunc) {
            case ServiceAction.GetLast30:
                service.command = {
                    command: typeFunc,
                    title: 'Get last 30.',
                    tooltip: 'Get last 30.'
                };
                break

            case ServiceAction.GetSum:
                service.command = {
                    command: typeFunc,
                    title: 'Get sum.',
                    tooltip: 'Get sum.'
                };
                break

            default:
                break;

        }

        return service;
    }

    public async insertServiceFunc(typeFunc: ServiceAction): Promise<void> {
        const documents = vscode.workspace.textDocuments
        const document = documents[0]
        const edit = new vscode.WorkspaceEdit();
        let entity = 'Entity'
        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index)
            if (line.text.includes('Service')) {
                let words = line.text.split(' ')
                words = words.filter(word => word.includes('Service'))
                words = words.map(word => word = word.replace('Service', ''))
                entity = words[0] || 'Entity'
            }
            if (line.text.includes('END FILE')) {
                switch (typeFunc) {
                    case ServiceAction.GetLast30:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateGetLast30(entity));
                        break

                    case ServiceAction.GetSum:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), await this.generateGetSum(entity));
                        break

                    default:
                        break;
                }
            }
        }

        vscode.workspace.applyEdit(edit)
    }

    private generateGetLast30 = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `
        // =====================GET LAST 30 {{upper}}=====================
        async get{{cap}}Last30(from: Date = null, to: Date = null) {
            const { start, end } = getFromToDate(from, to)

            const {{camel}} = await {{cap}}.find({
                where: {
                    dateCreated: Between(start, end),
                },
                order: { dateCreated: "ASC" },
            })

            const {{camel}}GroupByDay = {}
            {{camel}}.map(order => {
                const date = convertIntToDDMMYY(order.dateCreated)
                if (!{{camel}}GroupByDay[date]) {
                    {{camel}}GroupByDay[date] = 0
                }
                {{camel}}GroupByDay[date] += 1
            })

            const reports = []
            for (const date in {{camel}}GroupByDay) {
                reports.push({
                    date,
                    total: {{camel}}GroupByDay[date],
                })
            }

            return reports
        }
        `
        template = template.replace(/{{upper}}/g, nameTextTypes.upperCase);
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        template = template.replace(/{{dollar}}/g, '$');
        template = template.replace(/{{backtick}}/g, '`');
        return template
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
