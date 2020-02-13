import * as vscode from 'vscode';
import * as path from 'path'
import fsExtra = require('fs-extra');
import { replaceSymbolTemplate } from './util';
const rootPath = vscode.workspace.rootPath as string

interface KeywordPair {
    regex: RegExp,
    value: any
}

export class FSProvider {

    static checkExistProject(): boolean {
        vscode.window.showInformationMessage('check project')
        const packageJson = path.join(rootPath, 'package.json');
        const env = path.join(rootPath, '.env');
        const srcFolder = path.join(rootPath, 'src');
        vscode.window.showInformationMessage('check project xong')
        return fsExtra.existsSync(packageJson) ||
            fsExtra.existsSync(env) ||
            fsExtra.existsSync(srcFolder)
    }

    static checkExist(distPath: string): boolean {
        const file = path.join(rootPath, distPath);
        return fsExtra.existsSync(file)
    }

    static copyFile(assetPathFrom: string, pathTo: string) {
        try {
            const fullPath = path.join(rootPath, pathTo);
            fsExtra.copy(__dirname + '/assets/' + assetPathFrom, fullPath)
        } catch (error) {
            console.log('Error write file:', error)
        }
    }

    static copyAndReplaceFile(assetPathFrom: string, pathTo: string, keywords: KeywordPair[]) {
        const fullPath = path.join(rootPath, pathTo);

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
        const fullPath = path.join(rootPath, folderPath);
        fsExtra.ensureDirSync(fullPath)
    }

    static getAllFileInFolder(folderPath: string) {
        const fullPath = path.join(rootPath, folderPath);
        const files = fsExtra.readdirSync(fullPath)
        return files.map(file => file = file.replace('.ts', ''))
    }

    static getLinesDocumentInFile(folderPath: string) {
        const fullPath = path.join(rootPath, folderPath);
        const files = fsExtra.readFileSync(fullPath)
        return files.toString().split('\n') || []
    }
}