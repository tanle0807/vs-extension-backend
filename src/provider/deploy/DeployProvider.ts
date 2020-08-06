import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export enum Deploy {
    Staging = 'bmdextension.deployStaging',
    Production = 'bmdextension.deployProduct'
}

export class DeployProvider implements vscode.TreeDataProvider<any> {

    private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: any) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Dependency): Thenable<Dependency[]> {
        const commands = [
            {
                id: Deploy.Staging,
                title: 'BMD: Deploy STAGING'
            },
            {
                id: Deploy.Production,
                title: 'BMD: Deploy PRODUCTION'
            }
        ]

        const toDep = (command: any): Dependency => {
            let cmd = undefined

            return new Dependency(
                command.title,
                vscode.TreeItemCollapsibleState.None,
                cmd,
                command.id);
        };

        const commandTree = commands.map(c => toDep(c))

        return Promise.resolve(commandTree);
    }
}

export class Dependency extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly context?: string
    ) {
        super(label, collapsibleState)
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'media', 'light', 'rocket.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', 'media', 'dark', 'rocket.svg')
    };

    contextValue = this.context;

}