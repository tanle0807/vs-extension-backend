import { FSProvider } from "./FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "./util";

enum Confirmation {
    Yes = 'YES',
    No = 'NO'
}

enum TypeRequest {
    Insert = 'Insert',
    Update = 'Update'
}

export default class Handler {

    static async initProject() {
        const pass = await vscode.window.showInputBox({ placeHolder: "Enter password: " })
        if (pass != "bmd1234567890") return
        const projectName = await vscode.window.showInputBox({ placeHolder: "Enter project name: " })
        if (!projectName) return
        const projectNameTypes = getFullTextType(projectName)

        const projectCode = await vscode.window.showInputBox({ placeHolder: "Enter project code: " })
        if (!projectCode) return

        let projectPort = await vscode.window.showInputBox({ placeHolder: "Use port: " })
        if (!projectPort) projectPort = "4000"

        FSProvider.copyFile('init/tsconfig.json.txt', 'tsconfig.json')
        FSProvider.copyFile('init/deploy.sh.txt', 'deploy.sh')
        FSProvider.copyFile('init/config.ts.txt', 'config.ts')
        FSProvider.copyFile('init/.gitignore.txt', '.gitignore')

        FSProvider.copyFile('init/src/controllers/admin/CustomerController.ts.txt', 'src/controllers/admin/CustomerController.ts')
        FSProvider.copyFile('init/src/controllers/admin/RoleController.ts.txt', 'src/controllers/admin/RoleController.ts')
        FSProvider.copyFile('init/src/controllers/admin/StaffController.ts.txt', 'src/controllers/admin/StaffController.ts')
        FSProvider.copyFile('init/src/controllers/customer/CustomerController.ts.txt', 'src/controllers/customer/CustomerController.ts')

        FSProvider.copyFile('init/src/core/entity/CoreEntity.ts.txt', 'src/core/entity/CoreEntity.ts')
        FSProvider.copyFile('init/src/core/services/CoreService.ts.txt', 'src/core/services/CoreService.ts')

        FSProvider.copyFile('init/src/entity/Customer.ts.txt', 'src/entity/Customer.ts')
        FSProvider.copyFile('init/src/entity/Permission.ts.txt', 'src/entity/Permission.ts')
        FSProvider.copyFile('init/src/entity/Role.ts.txt', 'src/entity/Role.ts')
        FSProvider.copyFile('init/src/entity/Staff.ts.txt', 'src/entity/Staff.ts')

        FSProvider.copyFile('init/src/entity-request/CustomerInsert.ts.txt', 'src/entity-request/CustomerInsert.ts')
        FSProvider.copyFile('init/src/entity-request/CustomerUpdate.ts.txt', 'src/entity-request/CustomerUpdate.ts')
        FSProvider.copyFile('init/src/entity-request/StaffUpdate.ts.txt', 'src/entity-request/StaffUpdate.ts')
        FSProvider.copyFile('init/src/entity-request/PermissionImport.ts.txt', 'src/entity-request/PermissionImport.ts')

        FSProvider.copyFile('init/src/middleware/auth/Verification.ts.txt', 'src/middleware/auth/Verification.ts')
        FSProvider.copyFile('init/src/middleware/auth/VerificationJWT.ts.txt', 'src/middleware/auth/VerificationJWT.ts')
        FSProvider.copyFile('init/src/middleware/auth/strategy/AuthStrategy.ts.txt', 'src/middleware/auth/strategy/AuthStrategy.ts')
        FSProvider.copyFile('init/src/middleware/auth/strategy/JWT.ts.txt', 'src/middleware/auth/strategy/JWT.ts')
        FSProvider.copyFile('init/src/middleware/error/handleError.ts.txt', 'src/middleware/error/handleError.ts')
        FSProvider.copyFile('init/src/middleware/error/handleNotFound.ts.txt', 'src/middleware/error/handleNotFound.ts')
        FSProvider.copyFile('init/src/middleware/response/CustomSendResponse.ts.txt', 'src/middleware/response/CustomSendResponse.ts')
        FSProvider.copyFile('init/src/middleware/response/responseAPI.ts.txt', 'src/middleware/response/responseAPI.ts')
        FSProvider.copyFile('init/src/middleware/validator/Validator.ts.txt', 'src/middleware/validator/Validator.ts')

        FSProvider.copyFile('init/src/services/CustomerService.ts.txt', 'src/services/CustomerService.ts')
        FSProvider.copyFile('init/src/services/MailService.ts.txt', 'src/services/MailService.ts')
        FSProvider.copyFile('init/src/services/StaffService.ts.txt', 'src/services/StaffService.ts')
        FSProvider.copyFile('init/src/services/RoleService.ts.txt', 'src/services/RoleService.ts')
        FSProvider.copyFile('init/src/services/InitService.ts.txt', 'src/services/InitService.ts')

        FSProvider.copyFile('init/src/ssl/certificate-ca.crt', 'src/ssl/certificate-ca.crt')
        FSProvider.copyFile('init/src/ssl/certificate.crt', 'src/ssl/certificate.crt')
        FSProvider.copyFile('init/src/ssl/private.key', 'src/ssl/private.key')

        FSProvider.copyFile('init/src/types/express.d.ts.txt', 'src/types/express.d.ts')

        FSProvider.copyFile('init/src/util/helper.ts.txt', 'src/util/helper.ts')
        FSProvider.copyFile('init/src/util/mailer.ts.txt', 'src/util/mailer.ts')
        FSProvider.copyFile('init/src/util/language.ts.txt', 'src/util/language.ts')
        FSProvider.copyFile('init/src/util/logger.ts.txt', 'src/util/logger.ts')
        FSProvider.copyFile('init/src/util/expo.ts.txt', 'src/util/expo.ts')
        FSProvider.copyFile('init/src/util/password.ts.txt', 'src/util/password.ts')

        FSProvider.copyFile('init/src/index.ts.txt', 'src/index.ts')
        FSProvider.copyFile('init/src/Server.ts.txt', 'src/Server.ts')

        FSProvider.makeFolder('uploads')
        FSProvider.makeFolder('log/info')
        FSProvider.makeFolder('log/error')
        FSProvider.makeFolder('src')

        FSProvider.copyAndReplaceFile(
            'init/package.json.txt',
            'package.json',
            [{ regex: /{{snake}}/g, value: projectNameTypes.snakeCase }])

        initEnv('init/.env.production.txt', '.env.production')
        initEnv('init/.env.example.txt', '.env.example')
        initEnv('init/.env.example.txt', '.env')

        function initEnv(from: string, to: string) {
            FSProvider.copyAndReplaceFile(
                from,
                to,
                [
                    { regex: /{{snake}}/g, value: projectNameTypes.snakeCase },
                    { regex: /{{snake_upper}}/g, value: projectNameTypes.snakeUpperCase },
                    { regex: /{{upper}}/g, value: projectNameTypes.upperCase },
                    { regex: /{{code}}/g, value: projectCode },
                    { regex: /{{code_upper}}/g, value: (projectCode as string).toUpperCase() },
                    { regex: /{{port}}/g, value: projectPort }
                ])
        }
    }

    static async addContentDefine() {
        FSProvider.copyFile('contentDefine/AdminContentDefineController.ts.txt', 'src/controllers/admin/ContentDefineController.ts')
        FSProvider.copyFile('contentDefine/CustomerContentDefineController.ts.txt', 'src/controllers/customer/ContentDefineController.ts')
        FSProvider.copyFile('contentDefine/ContentDefine.ts.txt', 'src/entity/ContentDefine.ts')
        FSProvider.copyFile('contentDefine/ContentDefineService.ts.txt', 'src/services/ContentDefineService.ts')
    }

    static async addConfiguration() {
        FSProvider.copyFile('configuration/AdminConfigurationController.ts.txt', 'src/controllers/admin/ConfigurationController.ts')
        FSProvider.copyFile('configuration/Configuration.ts.txt', 'src/entity/Configuration.ts')
        FSProvider.copyFile('configuration/ConfigurationService.ts.txt', 'src/services/ConfigurationService.ts')
    }

    static async createController(fsPath: string, assetPath: string) {
        if (!fsPath.includes('controllers/'))
            return vscode.window.showErrorMessage("Please select subfolder in 'controllers'")

        const lastFolder = getLastFolderFromPath(fsPath)
        let controller = await vscode.window.showInputBox({ placeHolder: "Enter controller name: " })
        if (!controller) return
        controller = controller.replace('controller', '').replace('Controller', '')
        const controllerTextTypes = getFullTextType(controller)
        const lastFolderTextTypes = getFullTextType(lastFolder)

        const distPath = `src/controllers/${lastFolder}/${controllerTextTypes.classifyCase}Controller.ts`
        if (FSProvider.checkExist(distPath)) {
            const confirm = await vscode.window.showQuickPick(
                [Confirmation.Yes, Confirmation.No],
                { placeHolder: "This file already exist in this folder. Do you want to replace it." }
            )
            if (confirm != Confirmation.Yes) return
        }

        const controllerPath = `/${lastFolderTextTypes.snakeCase}/${controllerTextTypes.camelCase}`

        FSProvider.copyAndReplaceFile(
            assetPath,
            distPath,
            [
                { regex: /{{snake}}/g, value: controllerTextTypes.snakeCase },
                { regex: /{{classify}}/g, value: controllerTextTypes.classifyCase },
                { regex: /{{controller}}/g, value: controllerPath },
                { regex: /{{docs}}/g, value: lastFolderTextTypes.snakeCase },
                { regex: /{{camel}}/g, value: controllerTextTypes.camelCase }
            ])
    }

    static async createControllerNormal(fsPath: string) {
        this.createController(fsPath, 'controller/controller.txt')
    }

    static async createControllerResource(fsPath: string) {
        this.createController(fsPath, 'controller/controllerResource.txt')
    }

    static async createService(fsPath: string) {
        if (!fsPath.includes('services'))
            return vscode.window.showErrorMessage("Please select 'services' folder")

        let service = await vscode.window.showInputBox({ placeHolder: "Enter service name: " })
        if (!service) return
        service = service.replace('service', '').replace('Service', '')
        const serviceTextTypes = getFullTextType(service)

        const distPath = `src/services/${serviceTextTypes.classifyCase}Service.ts`
        if (FSProvider.checkExist(distPath)) {
            const confirm = await vscode.window.showQuickPick(
                [Confirmation.Yes, Confirmation.No],
                { placeHolder: "This file already exist in this folder. Do you want to replace it." }
            )
            if (confirm != Confirmation.Yes) return
        }

        FSProvider.copyAndReplaceFile(
            'service/service.txt',
            distPath,
            [
                { regex: /{{snake}}/g, value: serviceTextTypes.snakeCase },
                { regex: /{{classify}}/g, value: serviceTextTypes.classifyCase },
                { regex: /{{camel}}/g, value: serviceTextTypes.camelCase }
            ])
    }

    static async createEntity(fsPath: string) {
        if (!fsPath.endsWith('entity'))
            return vscode.window.showErrorMessage("Please select 'entity' folder")

        let entity = await vscode.window.showInputBox({ placeHolder: "Enter entity name: " })
        if (!entity) return
        const entityTextTypes = getFullTextType(entity)

        const distPath = `src/entity/${entityTextTypes.classifyCase}.ts`
        if (FSProvider.checkExist(distPath)) {
            const confirm = await vscode.window.showQuickPick(
                [Confirmation.Yes, Confirmation.No],
                { placeHolder: "This file already exist in this folder. Do you want to replace it." }
            )
            if (confirm != Confirmation.Yes) return
        }

        FSProvider.copyAndReplaceFile(
            'entity/entity.txt',
            distPath,
            [
                { regex: /{{snake}}/g, value: entityTextTypes.snakeCase },
                { regex: /{{classify}}/g, value: entityTextTypes.classifyCase },
                { regex: /{{camel}}/g, value: entityTextTypes.camelCase }
            ])
    }

    static async createEntityRequest(fsPath: string) {
        if (!fsPath.endsWith('entity-request'))
            return vscode.window.showErrorMessage("Please select 'entity-request' folder")

        const entities = FSProvider.getAllFileInFolder('/src/entity')
        const entity = await vscode.window.showQuickPick([...entities])
        if (!entity) return vscode.window.showInformationMessage('Please select entity to complete action')

        const type = await vscode.window.showQuickPick([TypeRequest.Insert, TypeRequest.Update])
        if (!type) return vscode.window.showInformationMessage('Please select type to complete action')

        const entityRequestTextTypes = getFullTextType(entity + type)
        const entityTextTypes = getFullTextType(entity)

        const distPath = `src/entity-request/${entityRequestTextTypes.classifyCase}.ts`
        if (FSProvider.checkExist(distPath)) {
            const confirm = await vscode.window.showQuickPick(
                [Confirmation.Yes, Confirmation.No],
                { placeHolder: "This file already exist in this folder. Do you want to replace it." }
            )
            if (confirm != Confirmation.Yes) return
        }

        FSProvider.copyAndReplaceFile(
            'entity-request/entity-request.txt',
            distPath,
            [
                { regex: /{{snake}}/g, value: entityTextTypes.snakeCase },
                { regex: /{{classify}}/g, value: entityTextTypes.classifyCase },
                { regex: /{{classifyRaw}}/g, value: entityRequestTextTypes.classifyCase },
                { regex: /{{camel}}/g, value: entityTextTypes.camelCase }
            ])
    }
}