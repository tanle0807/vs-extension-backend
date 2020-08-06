import { FSProvider } from "../../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../../util";
import { Confirmation, OTHER } from "../../constant";
import { Uri, commands } from "vscode";

async function createController(fsPath: string, assetPath: string) {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    if (fsPath == undefined) {
        fsPath = 'src/controllers/'
    }

    if (!fsPath.includes('controllers/')) {
        return vscode.window.showErrorMessage("Please select subfolder in 'controllers'")
    }

    let lastFolder = ''
    if (fsPath.endsWith('controllers/')) {
        const folders = FSProvider.getAllFolderInFolder('src/controllers/')
        const subfolder = await vscode.window.showQuickPick(
            [...folders],
            { placeHolder: "Please select subfolder!" }
        )
        if (!subfolder) return vscode.window.showErrorMessage("Please select subfolder in 'controllers'")
        lastFolder = subfolder
    } else {
        lastFolder = getLastFolderFromPath(fsPath)
    }

    const entities = FSProvider.getAllFileInFolder('/src/entity')
    const entitySelected = await vscode.window.showQuickPick([...entities, OTHER])
    let controller = ''
    if (entitySelected && entitySelected != OTHER) {
        controller = entitySelected
    } else {
        let input = await vscode.window.showInputBox({
            placeHolder: "Enter controller name: ",
            ignoreFocusOut: true
        })
        if (!input)
            return vscode.window.showInformationMessage("Cancel!. Do not input service name.");

        controller = input.replace('service', '').replace('Service', '')
    }

    controller = controller.replace('controller', '').replace('Controller', '')
    const controllerTextTypes = getFullTextType(controller)
    const lastFolderTextTypes = getFullTextType(lastFolder)

    const distPath = `src/controllers/${lastFolder}/${controllerTextTypes.classifyCase}Controller.ts`
    if (FSProvider.checkExist(distPath)) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.Yes, Confirmation.No],
            { placeHolder: "This file already exist in this folder. Do you want to replace it." }
        )

        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel: add CONTROLLER.");
        }
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

    let uri = Uri.file(FSProvider.getFullPath(distPath))
    await commands.executeCommand('vscode.openFolder', uri)
}

export async function createControllerNormal(fsPath: string) {
    await createController(fsPath, 'controller/controller.txt')
    return vscode.window.showInformationMessage("Create CONTROLLER successfully!");
}

export async function createControllerResource(fsPath: string) {
    await createController(fsPath, 'controller/controllerResource.txt')
    return vscode.window.showInformationMessage("Create CONTROLLER RESOURCE successfully!");
}
