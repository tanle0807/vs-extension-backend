import * as vscode from 'vscode';
import { getFullTextType } from '../../util';

export enum ControllerAction {
    GetListPagination = 'BMD: Get list pagination',
    GetListAll = 'BMD: Get list all',
    CreateItem = 'BMD: Create item',
    UpdateItem = 'BMD: Update item',
    CreateItemEntityRequest = 'BMD: Create item by entity-request',
    DeleteItemByRemove = 'BMD: Delete item by remove',
    DeleteItemByBlock = 'BMD: Delete item by hide',
    Upload = 'BMD: Upload',
}

export function createFunctionControllerAction(
    document: vscode.TextDocument,
    range: any,
) {
    if (!isControllerClass(document, range)) return []

    const insertGetListPagination = createControllerFunc(document, range, ControllerAction.GetListPagination);

    const insertGetListAll = createControllerFunc(document, range, ControllerAction.GetListAll);
    insertGetListAll.isPreferred = true

    const insertCreateItem = createControllerFunc(document, range, ControllerAction.CreateItem);
    insertCreateItem.isPreferred = true

    const insertCreateItemEntityRequest = createControllerFunc(document, range, ControllerAction.CreateItemEntityRequest);
    insertCreateItemEntityRequest.isPreferred = true

    const insertDeleteItemByRemove = createControllerFunc(document, range, ControllerAction.DeleteItemByRemove);
    const insertDeleteItemByBlock = createControllerFunc(document, range, ControllerAction.DeleteItemByBlock);
    const insertUpload = createControllerFunc(document, range, ControllerAction.Upload);
    const insertUpdateItem = createControllerFunc(document, range, ControllerAction.UpdateItem);

    return [
        insertGetListPagination,
        insertGetListAll,
        insertCreateItem,
        insertUpdateItem,
        insertCreateItemEntityRequest,
        insertDeleteItemByRemove,
        insertDeleteItemByBlock,
        insertUpload
    ]
}

function isControllerClass(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    return line.text.includes('Controller') && line.text.includes('class')
}

function createControllerFunc(document: vscode.TextDocument, range: vscode.Range, typeFunc: ControllerAction): vscode.CodeAction {
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

        case ControllerAction.UpdateItem:
            controller.command = {
                command: typeFunc,
                title: 'Update item.',
                tooltip: 'Update item.',
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

export function insertControllerFunc(typeFunc: ControllerAction, document: any): void {
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
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generatePagination(entity));
                    break

                case ControllerAction.GetListAll:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateFindAll(entity));
                    break;

                case ControllerAction.CreateItem:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateCreateItem(entity));
                    break;

                case ControllerAction.UpdateItem:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateUpdateItem(entity));
                    break;

                case ControllerAction.CreateItemEntityRequest:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateCreateItemRequest(entity));
                    break;

                case ControllerAction.DeleteItemByRemove:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateDeleteByRemove(entity));
                    break;

                case ControllerAction.DeleteItemByBlock:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateDeleteByHide(entity));
                    break;

                case ControllerAction.Upload:
                    edit.insert(document.uri, new vscode.Position(index - 1, 0), generateUpload(entity));
                    break;

                default:
                    break;
            }
        }
    }

    vscode.workspace.applyEdit(edit)
}

const generatePagination = (name: string) => {
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
        @QueryParams('limit') limit: number = 0,
        @QueryParams('search') search: string = '',
    ) {
        const [{{camel}}s, total] = await {{cap}}.createQueryBuilder('{{camel}}')
        .where({{backtick}}{{camel}}.name LIKE "%{{dollar}}{search}%" AND {{camel}}.isDeleted = false {{backtick}})
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('{{camel}}.id', 'DESC')
        .getManyAndCount()

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

const generateFindAll = (name: string) => {
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

const generateCreateItem = (name: string) => {
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

const generateCreateItemRequest = (name: string): any => {
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

const generateDeleteByRemove = (name: string) => {
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

const generateDeleteByHide = (name: string) => {
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

const generateUpload = (name: string) => {
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

const generateUpdateItem = (name: string) => {
    const nameTextTypes = getFullTextType(name)
    let template = `

    // =====================UPDATE ITEM=====================
    @Post('/:{{camel}}Id/update')
    @UseAuth(VerificationJWT)
    @Validator({
        {{camel}}: Joi.required(),
        {{camel}}Id: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("{{camel}}") {{camel}}: {{classify}},
        @PathParams("{{camel}}Id") {{camel}}Id: number,
    ) {
        await {{classify}}.findOneOrThrowId({{camel}}Id)
        {{camel}}.id = +{{camel}}Id
        await {{camel}}.save()
        
        return res.sendOK({{camel}})
    }
    `
    template = template.replace(/{{camel}}/g, nameTextTypes.camelCase);
    template = template.replace(/{{classify}}/g, nameTextTypes.classifyCase);
    return template
}