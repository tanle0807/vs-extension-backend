import { FSProvider } from "../FsProvider"
import * as vscode from 'vscode';
import { getFullTextType, getLastFolderFromPath, words, toSnakeCase, toUpperCaseFirstLetter } from "../util";
import { Confirmation } from "../constant";

export async function addConfiguration() {
    if (!FSProvider.isValidStructure()) {
        return vscode.window.showInformationMessage("Cancel!. Wrong project's structure.");
    }

    const initFiles = () => {
        FSProvider.copyFile('configuration/AdminConfigurationController.ts.txt', 'src/controllers/admin/ConfigurationController.ts')
        FSProvider.copyFile('configuration/Configuration.ts.txt', 'src/entity/Configuration.ts')
        FSProvider.copyFile('configuration/ConfigurationService.ts.txt', 'src/services/ConfigurationService.ts')

        vscode.window.showInformationMessage("Add module CONFIGURATION successfully!");
    }

    if (FSProvider.checkExist('src/entity/ContentDefine.ts')) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.No, Confirmation.Yes],
            { placeHolder: 'Module CONFIGURATION is already exist. You want to REPLACE?' }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage("Cancel: Add module CONFIGURATION.");
        } else {
            initFiles()
        }
    } else {
        initFiles()
    }
}