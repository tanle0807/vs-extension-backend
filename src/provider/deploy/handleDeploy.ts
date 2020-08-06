import * as vscode from 'vscode';
import { FSProvider } from '../../FsProvider';
import { Confirmation } from '../../constant';

const SOURCE_FILE_DEPLOY = 'init/deploy.sh.txt'
let NEXT_TERM_ID = 1

async function handleDeploy(file: string, env: string) {
    let link: any = '{{link}}'

    function initDeploy(from: string, to: string) {
        FSProvider.copyAndReplaceFile(
            from,
            to,
            [
                { regex: /{{env}}/g, value: env },
                { regex: /{{link}}/g, value: link },
            ])
    }

    const isExist = FSProvider.checkExist(file)
    if (!isExist) {
        const confirm = await vscode.window.showQuickPick(
            [Confirmation.Yes, Confirmation.No],
            { placeHolder: `Deploy Production file (${file}) doesn't not exist. You want to create it?` }
        )
        if (!confirm || confirm == Confirmation.No) {
            return vscode.window.showInformationMessage(`Cancel: deploy ${env}.`);
        }

        initDeploy('init/deploy.sh.txt', file)
    }

    if (isNotReplaceLink(file)) {
        link = await vscode.window.showInputBox({
            placeHolder: "Not found repository's link. Enter link: ",
            ignoreFocusOut: true
        })
        if (!link) {
            return vscode.window.showInformationMessage("Cancel deploy!. Do not input repository's link..");
        } else {
            initDeploy('init/deploy.sh.txt', file)
        }
    }

    const terminal = vscode.window.createTerminal(`Deploy ${env}#${NEXT_TERM_ID++}`);
    terminal.show()
    terminal.sendText(`sh ${file}`, true);
}

export async function deployStaging() {
    const DEPLOY_FILE = 'deploy.staging.sh'

    await handleDeploy(DEPLOY_FILE, "STAGING")
}

export async function deployProduct() {
    const DEPLOY_FILE = 'deploy.production.sh'

    await handleDeploy(DEPLOY_FILE, "PRODUCTION")
}

function isNotReplaceLink(file: string) {
    const fileContent = FSProvider.getContentInFile(file)
    return fileContent.includes('{{link}}')
}