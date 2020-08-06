import { FSProvider } from "../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../util";
import { Confirmation } from "../constant";
import { Uri, commands } from "vscode";

export async function createEntity(fsPath: string) {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    if (fsPath != undefined && !fsPath.includes('entity')) {
        return vscode.window.showInformationMessage("Please select 'entity' folder")
    }

    let entity = await vscode.window.showInputBox({ placeHolder: "Enter entity name: " })
    if (!entity) {
        return vscode.window.showInformationMessage("Cancel!. Do not input entity name.");
    }

    const entityTextTypes = getFullTextType(entity)

    const distPath = `src/entity/${entityTextTypes.classifyCase}.ts`
    if (FSProvider.checkExist(distPath)) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.Yes, Confirmation.No],
            { placeHolder: "This file already exist in this folder. Do you want to replace it." }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel: add ENTITY.");
        }
    }

    FSProvider.copyAndReplaceFile(
        'entity/entity.txt',
        distPath,
        [
            { regex: /{{snake}}/g, value: entityTextTypes.snakeCase },
            { regex: /{{classify}}/g, value: entityTextTypes.classifyCase },
            { regex: /{{camel}}/g, value: entityTextTypes.camelCase }
        ])

    let uri = Uri.file(FSProvider.getFullPath(distPath))
    await commands.executeCommand('vscode.openFolder', uri)

    return vscode.window.showInformationMessage("Create ENTITY successfully!");
}