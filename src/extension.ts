import * as vscode from 'vscode';
import { FSProvider } from './FsProvider';
import Handler from './Handler';
import { ControllerActionProvider, ControllerAction } from './provider/ControllerProvider';
import { ServiceActionProvider, ServiceAction } from './provider/ServiceProvider';
import { EntityActionProvider, EntityAction } from './provider/EntityProvider';


enum ConfirmationExistProject {
	Keep = 'Cancel',
	Replace = 'Replace by new project'
}

export enum BMDCommand {
	Init = 'bmdextension.init',
	CreateControllerResource = 'bmdextension.createControllerResource',
	CreateController = 'bmdextension.createController',
	CreateService = 'bmdextension.createService',
	CreateEntity = 'bmdextension.createEntity',
	CreateEntityRequest = 'bmdextension.createEntityRequest',
}

const controllerProvider = new ControllerActionProvider()
const serviceProvider = new ServiceActionProvider()
const entityProvider = new EntityActionProvider()

export function activate(context: vscode.ExtensionContext) {

	// Init project
	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.Init, async (e) => {
		if (FSProvider.checkExistProject()) {
			vscode.window.showWarningMessage('Project is already exist.')

			const confirm = await vscode.window.showQuickPick([ConfirmationExistProject.Keep, ConfirmationExistProject.Replace])
			if (confirm != ConfirmationExistProject.Replace) return

			await Handler.initProject()
			vscode.window.showInformationMessage("Init project success");
		} else {
			await Handler.initProject()
			vscode.window.showInformationMessage("Init project success");
		}
	}));


	// Create module
	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.CreateControllerResource, async (e) => {
		const fsPath = e.fsPath
		await Handler.createControllerResource(fsPath)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.CreateController, async (e) => {
		const fsPath = e.fsPath
		await Handler.createControllerNormal(fsPath)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.CreateService, async (e) => {
		const fsPath = e.fsPath
		await Handler.createService(fsPath)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.CreateEntity, async (e) => {
		const fsPath = e.fsPath
		await Handler.createEntity(fsPath)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.CreateEntityRequest, async (e) => {
		const fsPath = e.fsPath
		await Handler.createEntityRequest(fsPath)
	}));




	// Use for controller action
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new ControllerActionProvider(), {
			providedCodeActionKinds: ControllerActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.GetListPagination, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.GetListPagination, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.GetListAll, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.GetListAll, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.CreateItem, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.CreateItem, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.CreateItemEntityRequest, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.CreateItemEntityRequest, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.DeleteItemByRemove, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.DeleteItemByRemove, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.DeleteItemByBlock, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.DeleteItemByBlock, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.Upload, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.Upload, e)
	}));


	// Use for service action

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new ServiceActionProvider(), {
			providedCodeActionKinds: ServiceActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(ServiceAction.GetLast30, async (e) => {
		serviceProvider.insertServiceFunc(ServiceAction.GetLast30)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ServiceAction.GetSum, async (e) => {
		await serviceProvider.insertServiceFunc(ServiceAction.GetSum)
	}));

	// Use for entity action

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new EntityActionProvider(), {
			providedCodeActionKinds: EntityActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.OneToMany, async (e) => {
		entityProvider.insertEntityFunc(EntityAction.OneToMany)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.ManyToOne, async (e) => {
		entityProvider.insertEntityFunc(EntityAction.ManyToOne)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.ManyToMany, async (e) => {
		entityProvider.insertEntityFunc(EntityAction.ManyToMany)
	}));


}

export function deactivate() { }
