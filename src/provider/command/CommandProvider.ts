import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export enum BMDCommand {
    Init = 'bmdextension.init',
    CreateControllerResource = 'bmdextension.createControllerResource',
    CreateController = 'bmdextension.createController',
    CreateService = 'bmdextension.createService',
    CreateEntity = 'bmdextension.createEntity',
    CreateEntityRequest = 'bmdextension.createEntityRequest',
    AddModuleContentDefine = 'bmdextension.contentDefine',
    AddModuleConfiguration = 'bmdextension.configuration',
}

export class CommandProvider implements vscode.TreeDataProvider<any> {

    private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

    // vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));

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
                id: BMDCommand.Init,
                title: 'BMD: Init Project',
            },
            {
                id: BMDCommand.AddModuleConfiguration,
                title: 'BMD: Add Module Configuration'
            },
            {
                id: BMDCommand.AddModuleContentDefine,
                title: 'BMD: Add Module Content Define'
            },
            {
                id: BMDCommand.CreateController,
                title: 'BMD: New Controller'
            },
            {
                id: BMDCommand.CreateControllerResource,
                title: 'BMD: New Controller Resource'
            },
            {
                id: BMDCommand.CreateEntity,
                title: 'BMD: New Entity'
            },
            {
                id: BMDCommand.CreateEntityRequest,
                title: 'BMD: New Entity Request'
            },
            {
                id: BMDCommand.CreateService,
                title: 'BMD: New Service'
            },
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
        light: path.join(__filename, '..', '..', '..', '..', 'media', 'light', 'infinite.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', 'media', 'dark', 'infinite.svg')
    };

    contextValue = this.context;

}