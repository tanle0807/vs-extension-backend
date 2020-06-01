import * as vscode from 'vscode';
import { getFullTextType } from '../util';
import { FSProvider } from '../FsProvider';

export enum ControllerAction {
    GetListPagination = 'BMD: Get list pagination',
    GetListAll = 'BMD: Get list all',
    CreateItem = 'BMD: Create item',
    CreateItemEntityRequest = 'BMD: Create item by entity-request',
    DeleteItemByRemove = 'BMD: Delete item by remove',
    DeleteItemByBlock = 'BMD: Delete item by hide',
    Upload = 'BMD: Upload',
}

export enum ConstructorFunction {
    PrivateService = 'BMD: Private service'
}

export class ControllerActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] | undefined {
        if (this.isControllerClass(document, range)) {

            const insertGetListPagination = this.createControllerFunc(document, range, ControllerAction.GetListPagination);

            const insertGetListAll = this.createControllerFunc(document, range, ControllerAction.GetListAll);
            insertGetListAll.isPreferred = true
            // insertGetListAll.

            const insertCreateItem = this.createControllerFunc(document, range, ControllerAction.CreateItem);
            insertCreateItem.isPreferred = true

            const insertCreateItemEntityRequest = this.createControllerFunc(document, range, ControllerAction.CreateItemEntityRequest);
            insertCreateItemEntityRequest.isPreferred = true

            const insertDeleteItemByRemove = this.createControllerFunc(document, range, ControllerAction.DeleteItemByRemove);
            const insertDeleteItemByBlock = this.createControllerFunc(document, range, ControllerAction.DeleteItemByBlock);
            const insertUpload = this.createControllerFunc(document, range, ControllerAction.Upload);

            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                insertGetListPagination,
                insertGetListAll,
                insertCreateItem,
                insertCreateItemEntityRequest,
                insertDeleteItemByRemove,
                insertDeleteItemByBlock,
                insertUpload
            ]
        }
        if (this.isConstructorFunction(document, range)) {
            const insertPrivateService = this.createConstructorFunc(document, range, ConstructorFunction.PrivateService);

            vscode.commands.executeCommand('editor.action.formatDocument')

            return [
                insertPrivateService
            ]
        }
    }

    private isControllerClass(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('Controller') && line.text.includes('class')
    }

    private isConstructorFunction(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes('constructor')
    }


    private createControllerFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: ControllerAction): vscode.CodeAction {
        const controller = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        switch (typeFunc) {
            case ControllerAction.GetListPagination:
                controller.command = {
                    command: typeFunc,
                    title: 'Get list with pagination.',
                    tooltip: 'Get list with pagination.',
                    arguments: [document]
                };
                break

            case ControllerAction.GetListAll:
                controller.command = {
                    command: typeFunc,
                    title: 'Get list all.',
                    tooltip: 'Get list all.',
                    arguments: [document]
                };
                break;

            case ControllerAction.CreateItem:
                controller.command = {
                    command: typeFunc,
                    title: 'Create new item by entity.',
                    tooltip: 'Create new item by entity.',
                    arguments: [document]
                };
                break;

            case ControllerAction.CreateItemEntityRequest:
                controller.command = {
                    command: typeFunc,
                    title: 'Create new item by entity request.',
                    tooltip: 'Create new item by entity request.',
                    arguments: [document]
                };
                break;

            case ControllerAction.DeleteItemByRemove:
                controller.command = {
                    command: typeFunc,
                    title: 'Delete item by remove.',
                    tooltip: 'Delete item by remove.',
                    arguments: [document]
                };
                break;

            case ControllerAction.DeleteItemByBlock:
                controller.command = {
                    command: typeFunc,
                    title: 'Delete item by block.',
                    tooltip: 'Delete item by block.',
                    arguments: [document]
                };
                break;

            case ControllerAction.Upload:
                controller.command = {
                    command: typeFunc,
                    title: 'Upload.',
                    tooltip: 'Upload.',
                    arguments: [document]
                };
                break;

            default:
                break;

        }

        return controller;
    }

    private createConstructorFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: ConstructorFunction): vscode.CodeAction {
        const controller = new vscode.CodeAction(typeFunc, vscode.CodeActionKind.QuickFix);
        switch (typeFunc) {
            case ConstructorFunction.PrivateService:
                controller.command = {
                    command: typeFunc,
                    title: 'Insert private service.',
                    tooltip: 'Insert private service.',
                    arguments: [document]
                };
                break


            default:
                break;

        }

        return controller;
    }

    public async insertPrivateService(typeFunc: ConstructorFunction, document: any) {
        const edit = new vscode.WorkspaceEdit();
        const services = FSProvider.getAllFileInFolder('/src/services')
        const service = await vscode.window.showQuickPick([...services])
        if (!service) return vscode.window.showInformationMessage('Please select service to complete action')
        const fullTextService = getFullTextType(service)
        const content = `\nprivate ${fullTextService.camelCase}: ${service},`

        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index).text
            if (line.includes('constructor')) {
                const matched = 'constructor('
                const indexOf = line.indexOf(matched) != -1 ? line.indexOf(matched) + matched.length : 0
                edit.insert(document.uri, new vscode.Position(index, indexOf), content);
            }
        }

        vscode.workspace.applyEdit(edit)
    }


    public insertControllerFunc(typeFunc: ControllerAction, document: any): void {
        const edit = new vscode.WorkspaceEdit();
        let entity = 'Entity'
        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index)
            if (line.text.includes('Controller')) {
                let words = line.text.split(' ')
                words = words.filter((word: string) => word.includes('Controller'))
                words = words.map((word: string) => word = word.replace('Controller', ''))
                entity = words[0] || 'Entity'
            }
            if (line.text.includes('END FILE')) {
                switch (typeFunc) {
                    case ControllerAction.GetListPagination:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generatePagination(entity));
                        break

                    case ControllerAction.GetListAll:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateFindAll(entity));
                        break;

                    case ControllerAction.CreateItem:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateCreateItem(entity));
                        break;

                    case ControllerAction.CreateItemEntityRequest:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateCreateItemRequest(entity));
                        break;

                    case ControllerAction.DeleteItemByRemove:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateDeleteByRemove(entity));
                        break;

                    case ControllerAction.DeleteItemByBlock:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateDeleteByHide(entity));
                        break;

                    case ControllerAction.Upload:
                        edit.insert(document.uri, new vscode.Position(index - 1, 0), this.generateUpload(entity));
                        break;

                    default:
                        break;
                }
            }
        }

        vscode.workspace.applyEdit(edit)
    }

    private generatePagination = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `

        // =====================GET LIST=====================
        @Get('')
        @UseAuth(VerificationJWT)
        @Validator({
            page: Joi.number().min(0),
            limit: Joi.number().min(0)
        })
        async findAll(
            @HeaderParams('token') token: string,
            @Req() req: Request,
            @Res() res: Response,
            @QueryParams('page') page: number = 1,
            @QueryParams('limit') limit: number = 10,
            @QueryParams('search') search: string = '',
        ) {
            const [{{camel}}s, total] = await {{cap}}.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                where: {
                    name: Raw( alias => {{backtick}}concat({{dollar}}{ alias}, " ", phone) LIKE "%{{dollar}}{search}%"{{backtick}} ),
                    // name: Like({{backtick}}% {{dollar}}{ search }%{{backtick}})
                },
                order: { id: 'DESC' }
            });
    
            return res.sendOK({ {{camel}}s, total });
        }
        `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        template = template.replace(/{{dollar}}/g, '$');
        template = template.replace(/{{backtick}}/g, '`');
        template = template.replace(/ys/g, 'ies');
        return template
    }

    private generateFindAll = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `

        // =====================GET LIST=====================
        @Get('')
        @UseAuth(VerificationJWT)
        @Validator({})
        async findAll(
            @HeaderParams('token') token: string,
            @Req() req: Request,
            @Res() res: Response
        ) {
            const {{camel}}s = await {{cap}}.find()
            return res.sendOK({{camel}}s)
        }
        `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        template = template.replace(/ys/g, 'ies');
        return template
    }

    private generateCreateItem = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `

        // =====================CREATE ITEM=====================
        @Post('')
        @UseAuth(VerificationJWT)
        @Validator({
            {{camel}}: Joi.required()
        })
        async create(
            @HeaderParams('token') token: string,
            @Req() req: Request,
            @Res() res: Response,
            @BodyParams('{{camel}}') {{camel}}: {{cap}}
        ) {
            await {{camel}}.save();
            return res.sendOK({{camel}})
        }
        `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        template = template.replace(/ys/g, 'ies');
        return template
    }

    private generateCreateItemRequest = (name: string): any => {
        const nameTextTypes = getFullTextType(name)

        let template = `
            // =====================CREATE ITEM=====================
            @Post('')
            @UseAuth(VerificationJWT)
            @Validator({
                {{camel}}: Joi.required()
            })
            async create(
                @HeaderParams('token') token: string,
                @Req() req: Request,
                @Res() res: Response,
                @BodyParams('{{camel}}') {{camel}}: {{cap}}Insert
            ) {
                const new{{cap}} = {{camel}}.to{{cap}}();
                await new{{cap}}.save();
                return new{{cap}};
            }
            `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        return template
    }

    private generateDeleteByRemove = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `

        // =====================DELETE=====================
        @Post('/:{{camel}}Id/delete')
        @UseAuth(VerificationJWT)
        @Validator({
        })
        async delete(
            @HeaderParams("token") token: string,
            @Req() req: Request,
            @Res() res: Response,
            @PathParams("{{camel}}Id") {{camel}}Id: number,
        ) {
            let {{camel}} = await {{cap}}.findOneOrThrowId({{camel}}Id)
            await {{camel}}.remove()
            return res.sendOK({{camel}})
        }
        `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        return template
    }

    private generateDeleteByHide = (name: string) => {
        const nameTextTypes = getFullTextType(name)
        let template = `

        // =====================DELETE=====================
        @Post('/:{{camel}}Id/delete')
        @UseAuth(VerificationJWT)
        @Validator({
        })
        async delete(
            @HeaderParams("token") token: string,
            @Req() req: Request,
            @Res() res: Response,
            @PathParams("{{camel}}Id") {{camel}}Id: number,
        ) {
            let {{camel}} = await {{cap}}.findOneOrThrowId({{camel}}Id)
            {{camel}}.isDeleted = true
            await {{camel}}.save()
            return res.sendOK({{camel}})
        }
        `
        template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
        template = template.replace(/{{cap}}/g, nameTextTypes.classifyCase);
        return template
    }

    private generateUpload = (name: string) => {
        let template = `

        // =====================UPLOAD IMAGE=====================
        @Post('/upload')
        @UseAuth(VerificationJWT)
        uploadFile(
            @HeaderParams("token") token: string,
            @Req() req: Request,
            @Res() res: Response,
            @MultipartFile('file') file: Express.Multer.File,
        ) {
            file.path = file.path.replace(CONFIG.UPLOAD_DIR, '');
            return res.sendOK(file)
        }
        `
        return template
    }
}