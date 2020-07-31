import { FSProvider } from '../../FsProvider';
import * as vscode from 'vscode';
import { getFullTextType } from '../../util';
import { EntityAction, PropertyType } from './constant';
import { createPropertyAction } from './handleProperty';
import { createRelationAction } from './handleRelation';
import { getRelationsEntityDeeper, getPropertiesEntity, getEntityFromFunction, getRelationsEntity } from './helper';
import { createExportInterface, createEntityActions } from './handleEntity';
import { createBuilderAction } from './handleBuilder';
import { createAddRelationFunctionAction, createAddFunctionAction } from './handleFunction';


export class EntityActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: any
    ): vscode.CodeAction[] | undefined | any {
        // Add properties to entity file
        const addPropertiesAction = createPropertyAction(document, range)
        if (addPropertiesAction && addPropertiesAction.length)
            return addPropertiesAction

        // Add relation to entity file
        const addRelationAction = createRelationAction(document, range)
        if (addRelationAction && addRelationAction.length)
            return addRelationAction

        // Add relation to entity function like: find, findOne
        const addRelationFunctionAction = createAddRelationFunctionAction(document, range)
        if (addRelationFunctionAction && addRelationFunctionAction.length)
            return addRelationFunctionAction

        // Add relation to entity function like: find, findOne
        const addFunctionAction = createAddFunctionAction(document, range)
        if (addFunctionAction && addFunctionAction.length)
            return addFunctionAction

        // Add relation to query builder
        const addBuilderRelationAction = createBuilderAction(document, range)
        if (addBuilderRelationAction && addBuilderRelationAction.length)
            return addBuilderRelationAction

        // 
        // const getPropertiesEntity = 
        return []
    }

}

