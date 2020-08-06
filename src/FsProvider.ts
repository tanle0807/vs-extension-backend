import * as vscode from 'vscode';
import * as path from 'path'
import fsExtra = require('fs-extra');
import { replaceSymbolTemplate } from './util';
export const ROOT_PATH = vscode.workspace.rootPath as string

interface KeywordPair {
    regex: RegExp,
    value: any
}

export class FSProvider {

    static checkExistProject(): boolean {
        vscode.window.showInformationMessage('check project')
        const packageJson = path.join(ROOT_PATH, 'package.json');
        const env = path.join(ROOT_PATH, '.env');
        const srcFolder = path.join(ROOT_PATH, 'src');
        vscode.window.showInformationMessage('check project xong')
        return fsExtra.existsSync(packageJson) ||
            fsExtra.existsSync(env) ||
            fsExtra.existsSync(srcFolder)
    }

    static checkExist(distPath: string): boolean {
        const file = path.join(ROOT_PATH, distPath);
        return fsExtra.existsSync(file)
    }

    static copyFile(assetPathFrom: string, pathTo: string) {
        try {
            const fullPath = path.join(ROOT_PATH, pathTo);
            fsExtra.copy(__dirname + '/assets/' + assetPathFrom, fullPath)
        } catch (error) {
            console.log('Error write file:', error)
        }
    }

    static copyAndReplaceFile(assetPathFrom: string, pathTo: string, keywords: KeywordPair[]) {
        const fullPath = path.join(ROOT_PATH, pathTo);

        const buffer = fsExtra.readFileSync(__dirname + '/assets/' + assetPathFrom)
        let content = buffer.toString()

        content = replaceSymbolTemplate(content)
        keywords.forEach(pair => {
            content = content.replace(pair.regex, pair.value)
        });
        fsExtra.ensureFileSync(fullPath)
        fsExtra.writeFileSync(fullPath, content)
    }

    static makeFolder(folderPath: string) {
        const fullPath = path.join(ROOT_PATH, folderPath);
        fsExtra.ensureDirSync(fullPath)
    }

    static getAllFileInFolder(folderPath: string) {
        const fullPath = path.join(ROOT_PATH, folderPath);
        const files = fsExtra.readdirSync(fullPath)
        return files.map(file => file = file.replace('.ts', ''))
    }

    static getAllFolderInFolder(folderPath: string) {
        const fullPath = path.join(ROOT_PATH, folderPath);
        const files = fsExtra.readdirSync(fullPath)
        return files.map(file => file = file.replace('.ts', ''))
    }

    static getLinesDocumentInFile(folderPath: string) {
        const fullPath = path.join(ROOT_PATH, folderPath);
        const files = fsExtra.readFileSync(fullPath)
        return files.toString().split('\n') || []
    }

    static getContentInFile(folderPath: string) {
        const fullPath = path.join(ROOT_PATH, folderPath);
        const files = fsExtra.readFileSync(fullPath)
        return files.toString()
    }

    static isValidStructure() {
        return FSProvider.checkExist('src/Server.ts')
    }

    static getFullPath(pathStr: string) {
        return path.join(ROOT_PATH, pathStr);
    }
}