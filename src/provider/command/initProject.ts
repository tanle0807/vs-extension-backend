import { FSProvider } from "../../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../../util";
import { Confirmation } from "../../constant";


export async function initProject() {
    if (FSProvider.checkExist('src')) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.No, Confirmation.Yes],
            { placeHolder: 'Already exist project. You want to replace it??? ' }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel! Init project.");
        }
    }

    const pass = await vscode.window.showInputBox({
        placeHolder: "Enter password: ",
        ignoreFocusOut: true
    })
    if (pass != "bmd1234567890") {
        return vscode.window.showInformationMessage("Cancel! Wrong password.");
    }

    const projectName = await vscode.window.showInputBox({
        placeHolder: "Enter project name: ",
        ignoreFocusOut: true
    })
    if (!projectName) {
        return vscode.window.showInformationMessage("Cancel! Do not input project name.");
    }

    const projectCode = await vscode.window.showInputBox({
        placeHolder: "Enter project code: ",
        ignoreFocusOut: true
    })
    if (!projectCode) {
        return vscode.window.showInformationMessage("Cancel! Do not input project code.");
    }

    const projectNameTypes = getFullTextType(projectName)

    let projectPort = await vscode.window.showInputBox({
        placeHolder: "Use port: (default port 4000)",
        ignoreFocusOut: true
    })
    if (!projectPort) projectPort = "4000"

    FSProvider.copyFile('init/tsconfig.json.txt', 'tsconfig.json')
    FSProvider.copyFile('init/config.ts.txt', 'config.ts')
    FSProvider.copyFile('init/.gitignore.txt', '.gitignore')

    FSProvider.copyFile('init/src/controllers/admin/CustomerController.ts.txt', 'src/controllers/admin/CustomerController.ts')
    FSProvider.copyFile('init/src/controllers/admin/RoleController.ts.txt', 'src/controllers/admin/RoleController.ts')
    FSProvider.copyFile('init/src/controllers/admin/StaffController.ts.txt', 'src/controllers/admin/StaffController.ts')
    FSProvider.copyFile('init/src/controllers/admin/AuthController.ts.txt', 'src/controllers/admin/AuthController.ts')
    FSProvider.copyFile('init/src/controllers/customer/CustomerController.ts.txt', 'src/controllers/customer/CustomerController.ts')
    FSProvider.copyFile('init/src/controllers/customer/AuthController.ts.txt', 'src/controllers/customer/AuthController.ts')

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

    FSProvider.copyFile('init/package.json.txt', 'package.json')
    FSProvider.copyFile('init/package-lock.json.txt', 'package-lock.json')

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

    initDeploy('init/deploy.sh.txt', 'deploy.production.sh', { env: 'PRODUCTION' })
    initDeploy('init/deploy.sh.txt', 'deploy.staging.sh', { env: 'STAGING' })

    function initDeploy(from: string, to: string, params: any) {
        FSProvider.copyAndReplaceFile(
            from,
            to,
            [
                { regex: /{{env}}/g, value: params.env },
            ])
    }

    vscode.window.showInformationMessage("Init project successfully!");
}