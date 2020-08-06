import { FSProvider } from "../../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../../util";
import { Confirmation } from "../../constant";

export async function addContentDefine() {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    const initFiles = () => {
        FSProvider.copyFile('contentDefine/AdminContentDefineController.ts.txt', 'src/controllers/admin/ContentDefineController.ts')
        FSProvider.copyFile('contentDefine/CustomerContentDefineController.ts.txt', 'src/controllers/customer/ContentDefineController.ts')
        FSProvider.copyFile('contentDefine/ContentDefine.ts.txt', 'src/entity/ContentDefine.ts')
        FSProvider.copyFile('contentDefine/ContentDefineService.ts.txt', 'src/services/ContentDefineService.ts')

        vscode.window.showInformationMessage("Add module CONTENT DEFINE successfully!");
    }

    if (FSProvider.checkExist('src/entity/ContentDefine.ts')) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.No, Confirmation.Yes],
            { placeHolder: 'Module CONTENT DEFINE is already exist. You want to REPLACE?' }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel: Add module CONTENT DEFINE.");
        } else {
            initFiles()
        }
    } else {
        initFiles()
    }
}