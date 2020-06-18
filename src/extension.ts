import * as vscode from 'vscode';
import { FSProvider } from './FsProvider';
import Handler from './Handler';
import { ControllerActionProvider, ControllerAction, ConstructorFunction } from './provider/ControllerProvider';
import { ServiceActionProvider, ServiceAction } from './provider/ServiceProvider';
import { EntityActionProvider, EntityAction, EntityFunctionAction, EXPORT_INTERFACE } from './provider/EntityProvider';
import { EntityRequestActionProvider, EntityRequestAction } from './provider/EntityRequestProvider';


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
	AddModuleContentDefine = 'bmdextension.contentDefine',
	AddModuleConfiguration = 'bmdextension.configuration',
}

const controllerProvider = new ControllerActionProvider()
const serviceProvider = new ServiceActionProvider()
const entityProvider = new EntityActionProvider()
const entityRequestProvider = new EntityRequestActionProvider()

export function activate(context: vscode.ExtensionContext) {

	// Init project
	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.Init, async () => {
		// if (FSProvider.checkExistProject()) {
		// 	vscode.window.showWarningMessage('Project is already exist.')

		// 	const confirm = await vscode.window.showQuickPick([ConfirmationExistProject.Keep, ConfirmationExistProject.Replace])
		// 	if (confirm != ConfirmationExistProject.Replace) return

		// 	await Handler.initProject()
		// 	vscode.window.showInformationMessage("Init project success");
		// } else {
		await Handler.initProject()
		vscode.window.showInformationMessage("Init project success");
		// }
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

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.AddModuleContentDefine, async () => {
		await Handler.addContentDefine()
	}));

	context.subscriptions.push(vscode.commands.registerCommand(BMDCommand.AddModuleConfiguration, async () => {
		await Handler.addConfiguration()
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

	context.subscriptions.push(vscode.commands.registerCommand(ControllerAction.UpdateItem, async (e) => {
		controllerProvider.insertControllerFunc(ControllerAction.UpdateItem, e)
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

	context.subscriptions.push(vscode.commands.registerCommand(ConstructorFunction.PrivateService, async (e) => {
		await controllerProvider.insertPrivateService(ConstructorFunction.PrivateService, e)
	}));

	// Use for service action

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new ServiceActionProvider(), {
			providedCodeActionKinds: ServiceActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(ServiceAction.GetLast30, async (e) => {
		serviceProvider.insertServiceFunc(ServiceAction.GetLast30, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ServiceAction.GetSum, async (e) => {
		await serviceProvider.insertServiceFunc(ServiceAction.GetSum, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(ServiceAction.GetManyAndCount, async (e) => {
		serviceProvider.insertServiceFunc(ServiceAction.GetManyAndCount, e)
	}));

	// Use for entity action

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new EntityActionProvider(), {
			providedCodeActionKinds: EntityActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(EXPORT_INTERFACE, async (d, r, e) => {
		entityProvider.createInterface(d, r, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.AddProperty, async (e) => {
		entityProvider.addProperty(e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.OneToMany, async (e) => {
		entityProvider.insertEntityAction(EntityAction.OneToMany, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.ManyToOne, async (e) => {
		entityProvider.insertEntityAction(EntityAction.ManyToOne, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.ManyToMany, async (e) => {
		entityProvider.insertEntityAction(EntityAction.ManyToMany, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityAction.OneToOne, async (e) => {
		entityProvider.insertEntityAction(EntityAction.OneToOne, e)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityFunctionAction.AddRelation, async (e, r) => {
		entityProvider.insertEntityFunction(EntityFunctionAction.AddRelation, e, r)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityFunctionAction.CreateQueryBuilder, async (e, r) => {
		entityProvider.insertQueryBuilder(EntityFunctionAction.CreateQueryBuilder, e, r)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityFunctionAction.FindOneOrThrowID, async (e, r) => {
		entityProvider.insertFindOneOrThrow(EntityFunctionAction.FindOneOrThrowID, e, r)
	}));

	context.subscriptions.push(vscode.commands.registerCommand(EntityFunctionAction.AddBuilderRelation, async (e, r) => {
		entityProvider.insertBuilderRelation(EntityFunctionAction.AddBuilderRelation, e, r)
	}));

	// Use for entity request action

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('typescript', new EntityRequestActionProvider(), {
			providedCodeActionKinds: EntityRequestActionProvider.providedCodeActionKinds
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand(EntityRequestAction.AddProperty, async (e) => {
		entityRequestProvider.addProperty(e)
	}));


}

export function deactivate() { }
