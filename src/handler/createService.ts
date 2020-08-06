import { FSProvider } from "../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../util";
import { Confirmation, OTHER } from "../constant";
import { Uri, commands } from "vscode";

export async function createService(fsPath: string) {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    if (fsPath != undefined && !fsPath.includes('services')) {
        return vscode.window.showInformationMessage("Please select 'services' folder")
    }

    const entities = FSProvider.getAllFileInFolder('/src/entity')
    const entitySelected = await vscode.window.showQuickPick([...entities, OTHER])
    let service = ''
    if (entitySelected && entitySelected != OTHER) {
        service = entitySelected
    } else {
        let input = await vscode.window.showInputBox({ placeHolder: "Enter service name: " })
        if (!input)
            return vscode.window.showInformationMessage("Cancel!. Do not input service name.");

        service = input.replace('service', '').replace('Service', '')
    }

    if (!service) {
        return vscode.window.showInformationMessage("Cancel!. Do not input service name.");
    }

    const serviceTextTypes = getFullTextType(service)

    const distPath = `src/services/${serviceTextTypes.classifyCase}Service.ts`
    if (FSProvider.checkExist(distPath)) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.Yes, Confirmation.No],
            { placeHolder: "This file already exist in this folder. Do you want to replace it?" }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel create service!.");
        }
    }

    FSProvider.copyAndReplaceFile(
        'service/service.txt',
        distPath,
        [
            { regex: /{{snake}}/g, value: serviceTextTypes.snakeCase },
            { regex: /{{classify}}/g, value: serviceTextTypes.classifyCase },
            { regex: /{{camel}}/g, value: serviceTextTypes.camelCase }
        ])


    let uri = Uri.file(FSProvider.getFullPath(distPath))
    await commands.executeCommand('vscode.openFolder', uri)

    return vscode.window.showInformationMessage("Create SERVICE successfully!");
}