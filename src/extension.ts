import * as vscode from 'vscode'
import { ControllerActionProvider } from './provider/controller/ControllerProvider';
import { ServiceActionProvider, ServiceAction } from './provider/service/ServiceProvider';
import { EntityActionProvider } from './provider/entity/EntityProvider';
import { EntityRequestActionProvider, EntityRequestAction } from './provider/entity-request/EntityRequestProvider';
import { EntityAction } from './constant';
import { addProperty } from './provider/entity/handleProperty';
import { insertEntityAction } from './provider/entity/handleRelation';
import { insertBuilderRelation } from './provider/entity/handleBuilder';
import { createInterface } from './provider/entity/handleEntity';
import { insertEntityFunction, insertQueryBuilder, insertFindOneOrThrow, insertPropertiesToQuery } from './provider/entity/handleFunction';
import { CommandProvider } from './provider/command/CommandProvider';
import { addConfiguration } from './provider/command/configuration';
import { insertControllerFunc, ControllerAction } from './provider/controller/handleFunction';
import { insertPrivateService, ConstructorFunction } from './provider/controller/handleConstructor';
import { deployStaging, deployProduct } from './provider/deploy/handleDeploy';
import { DeployProvider } from './provider/deploy/DeployProvider';
import { createControllerResource, createControllerNormal } from './provider/command/createController';
import { initProject } from './provider/command/initProject';
import { createService } from './provider/command/createService';
import { createEntity } from './provider/command/createEntity';
import { createEntityRequest } from './provider/command/createEntityRequest';
import { addContentDefine } from './provider/command/contentDefine';


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

export enum Deploy {
	DeployStaging = 'bmdextension.deployStaging',
	DeployProduction = 'bmdextension.deployProduct',
	DeployNormal = 'bmdextension.deployNormal',
}

const controllerProvider = new ControllerActionProvider()
const serviceProvider = new ServiceActionProvider()
const entityRequestProvider = new EntityRequestActionProvider()

export function activate(context: vscode.ExtensionContext) {
	const bmdCommand = new CommandProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('bmdextension1', bmdCommand);
	vscode.window.registerTreeDataProvider('bmdextension2', bmdCommand);

	const deploy = new DeployProvider(vscode.workspace.rootPath)
	vscode.window.registerTreeDataProvider('deploy1', deploy);
	vscode.window.registerTreeDataProvider('deploy2', deploy);

	// INIT
	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.Init,
		async () => await initProject()
	));


	// MODULE
	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateControllerResource,
		async (e) => {
			const fsPath = e.fsPath
			await createControllerResource(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateController,
		async (e) => {
			const fsPath = e.fsPath
			await createControllerNormal(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateService,
		async (e) => {
			const fsPath = e.fsPath
			await createService(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateEntity, async (e) => {
			const fsPath = e.fsPath
			await createEntity(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.CreateEntityRequest,
		async (e) => {
			const fsPath = e.fsPath
			await createEntityRequest(fsPath)
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.AddModuleContentDefine,
		async () => await addContentDefine()
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		BMDCommand.AddModuleConfiguration,
		async () => await addConfiguration()
	));


	// CONTROLLER
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
		'typescript',
		new ControllerActionProvider(),
		{ providedCodeActionKinds: ControllerActionProvider.providedCodeActionKinds }
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.GetListPagination,
		async (e) => insertControllerFunc(ControllerAction.GetListPagination, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.GetListAll,
		async (e) => insertControllerFunc(ControllerAction.GetListAll, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.CreateItem,
		async (e) => insertControllerFunc(ControllerAction.CreateItem, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.UpdateItem,
		async (e) => insertControllerFunc(ControllerAction.UpdateItem, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.CreateItemEntityRequest,
		async (e) => insertControllerFunc(ControllerAction.CreateItemEntityRequest, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.DeleteItemByRemove,
		async (e) => insertControllerFunc(ControllerAction.DeleteItemByRemove, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.DeleteItemByBlock,
		async (e) => insertControllerFunc(ControllerAction.DeleteItemByBlock, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ControllerAction.Upload,
		async (e) => insertControllerFunc(ControllerAction.Upload, e)
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		ConstructorFunction.PrivateService,
		async (e) => await insertPrivateService(ConstructorFunction.PrivateService, e)
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
		EntityAction.AddPropertyToQuery,
		async (e, r, l, p) => insertPropertiesToQuery(e, r, l, p)
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

	// DEPLOY
	context.subscriptions.push(vscode.commands.registerCommand(
		Deploy.DeployStaging,
		() => deployStaging()
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		Deploy.DeployProduction,
		() => deployProduct()
	));

}

export function deactivate() { }
