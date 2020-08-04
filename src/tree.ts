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

export class DepNodeProvider implements vscode.TreeDataProvider<any> {

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
            BMDCommand.Init,
            BMDCommand.AddModuleConfiguration,
            BMDCommand.AddModuleContentDefine,
            BMDCommand.CreateController,
            BMDCommand.CreateControllerResource,
            BMDCommand.CreateEntity,
            BMDCommand.CreateEntityRequest,
            BMDCommand.CreateService,
        ]

        const toDep = (command: string): Dependency => {
            return new Dependency(command, '', vscode.TreeItemCollapsibleState.None, {
                command,
                title: command,
                tooltip: command,
            }, command);
        };

        const commandTree = commands.map(c => toDep(c))

        return Promise.resolve(commandTree);
    }

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
    private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            const toDep = (moduleName: string, version: string): Dependency => {
                if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
                } else {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
                        command: 'extension.openPackageOnNpm',
                        title: '',
                        arguments: [moduleName]
                    });
                }
            };

            const deps = packageJson.dependencies
                ? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
                : [];
            const devDeps = packageJson.devDependencies
                ? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
                : [];
            return deps.concat(devDeps);
        } else {
            return [];
        }
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }

        return true;
    }
}

export class Dependency extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly context?: string
    ) {
        super(label, collapsibleState)
    }

    get tooltip(): string {
        return `${this.label}-${this.version}`;
    }

    get description(): string {
        return this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'media', 'test.svg'),
        dark: path.join(__filename, '..', '..', 'media', 'test.svg')
    };

    contextValue = this.context;

}