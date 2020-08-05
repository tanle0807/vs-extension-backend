import { FSProvider } from "../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../util";
import { Confirmation, TypeRequest } from "../constant";
import { Uri, commands } from "vscode";

export async function createEntityRequest(fsPath: string) {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    if (fsPath != undefined && !fsPath.includes('entity-request')) {
        return vscode.window.showInformationMessage("Please select 'entity' folder")
    }

    const entities = FSProvider.getAllFileInFolder('/src/entity')

    const entity = await vscode.window.showQuickPick([...entities])
    if (!entity) {
        return vscode.window.showInformationMessage('Cancel! Do not select entity')
    }

    const type = await vscode.window.showQuickPick([TypeRequest.Insert, TypeRequest.Update])
    if (!type) {
        return vscode.window.showInformationMessage('Cancel! Do not select type entity request')
    }

    const entityRequestTextTypes = getFullTextType(entity + type)
    const entityTextTypes = getFullTextType(entity)

    const distPath = `src/entity-request/${entityRequestTextTypes.classifyCase}.ts`
    if (FSProvider.checkExist(distPath)) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.Yes, Confirmation.No],
            { placeHolder: "This file already exist in this folder. Do you want to replace it." }
        )
        if (confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel: add ENTITY REQUEST.");
        }
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

    let uri = Uri.file(FSProvider.getFullPath(distPath))
    await commands.executeCommand('vscode.openFolder', uri)

    return vscode.window.showInformationMessage("Create ENTITY REQUEST successfully!");
}