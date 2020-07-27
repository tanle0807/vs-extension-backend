import * as vscode from 'vscode';
import Handler from './Handler';
import { ControllerActionProvider, ControllerAction, ConstructorFunction } from './provider/ControllerProvider';
import { ServiceActionProvider, ServiceAction } from './provider/ServiceProvider';
import { EntityActionProvider } from './provider/entity/EntityProvider';
import { EntityRequestActionProvider, EntityRequestAction } from './provider/EntityRequestProvider';
import { EntityAction } from './provider/entity/constant';
import { addProperty } from './provider/entity/handleProperty';
import { insertEntityAction } from './provider/entity/handleRelation';
import { insertBuilderRelation } from './provider/entity/handleBuilder';
import { createInterface } from './provider/entity/handleEntity';
import { insertEntityFunction, insertQueryBuilder, insertFindOneOrThrow } from './provider/entity/handleFunction';


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
const entityRequestProvider = new EntityRequestActionProvider()

export function activate(context: vscode.ExtensionContext) {

	// INIT
	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.Init,
		async () => {
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
		}
	));


	// MODULE
	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateControllerResource,
		async (e) => {
			const fsPath = e.fsPath
			await Handler.createControllerResource(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateController,
		async (e) => {
			const fsPath = e.fsPath
			await Handler.createControllerNormal(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateService,
		async (e) => {
			const fsPath = e.fsPath
			await Handler.createService(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateEntity, async (e) => {
			const fsPath = e.fsPath
			await Handler.createEntity(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateEntityRequest,
		async (e) => {
			const fsPath = e.fsPath
			await Handler.createEntityRequest(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.AddModuleContentDefine,
		async () => await Handler.addContentDefine()
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.AddModuleConfiguration,
		async () => await Handler.addConfiguration()
	));


	// CONTROLLER
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
		'typescript',
		new ControllerActionProvider(),
		{ providedCodeActionKinds: ControllerActionProvider.providedCodeActionKinds }
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.GetListPagination,
		async (e) => controllerProvider.insertControllerFunc(
			ControllerAction.GetListPagination, e
		)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.GetListAll,
		async (e) => controllerProvider.insertControllerFunc(ControllerAction.GetListAll, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.CreateItem,
		async (e) => controllerProvider.insertControllerFunc(ControllerAction.CreateItem, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.UpdateItem,
		async (e) => controllerProvider.insertControllerFunc(ControllerAction.UpdateItem, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.CreateItemEntityRequest,
		async (e) => controllerProvider.insertControllerFunc(
			ControllerAction.CreateItemEntityRequest, e
		)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.DeleteItemByRemove,
		async (e) => controllerProvider.insertControllerFunc(
			ControllerAction.DeleteItemByRemove, e
		)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.DeleteItemByBlock,
		async (e) => controllerProvider.insertControllerFunc(ControllerAction.DeleteItemByBlock, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.Upload,
		async (e) => controllerProvider.insertControllerFunc(ControllerAction.Upload, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ConstructorFunction.PrivateService,
		async (e) => await controllerProvider.insertPrivateService(
			ConstructorFunction.PrivateService, e
		)
	));


	// SERVICE
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			'typescript',
			new ServiceActionProvider(),
			{ providedCodeActionKinds: ServiceActionProvider.providedCodeActionKinds }
		));

	context.subscriptions.push(vscode.commands.registerCommand(
		ServiceAction.GetLast30,
		async (e) => serviceProvider.insertServiceFunc(ServiceAction.GetLast30, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ServiceAction.GetSum,
		async (e) => await serviceProvider.insertServiceFunc(ServiceAction.GetSum, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ServiceAction.GetManyAndCount,
		async (e) => serviceProvider.insertServiceFunc(ServiceAction.GetManyAndCount, e)
	));


	// ENTITY
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			'typescript',
			new EntityActionProvider(),
			{ providedCodeActionKinds: EntityActionProvider.providedCodeActionKinds }
		));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.ExportInterface,
		async (d, r, e) => createInterface(d, r, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.AddProperty,
		async (e) => addProperty(e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.OneToMany,
		async (e) => insertEntityAction(EntityAction.OneToMany, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.ManyToOne,
		async (e) => insertEntityAction(EntityAction.ManyToOne, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.ManyToMany,
		async (e) => insertEntityAction(EntityAction.ManyToMany, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.OneToOne,
		async (e) => insertEntityAction(EntityAction.OneToOne, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.AddRelation,
		async (e, r) => insertEntityFunction(EntityAction.AddRelation, e, r)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.CreateQueryBuilder,
		async (e, r) => insertQueryBuilder(EntityAction.CreateQueryBuilder, e, r)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.FindOneOrThrowID,
		async (e, r) => insertFindOneOrThrow(EntityAction.FindOneOrThrowID, e, r)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityAction.AddBuilderRelation,
		async (e, r) => insertBuilderRelation(EntityAction.AddBuilderRelation, e, r)
	));


	// ENTITY REQUEST
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
		'typescript',
		new EntityRequestActionProvider(),
		{ providedCodeActionKinds: EntityRequestActionProvider.providedCodeActionKinds }
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		EntityRequestAction.AddProperty,
		async (e) => entityRequestProvider.addProperty(e)
	));

}

export function deactivate() { }
