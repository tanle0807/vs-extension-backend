import * as vscode from 'vscode';
import { FSProvider } from '../../lib/FsProvider';
import { getWordBetweenSpace, getFullTextType } from '../../lib/util';

export function getEntityFromFunction(document: vscode.TextDocument, range: vscode.Range, isQuery: boolean = false) {
    const start = range.start;
    const line = document.lineAt(start.line);

    if (!isQuery) {
        const entities = line.text.match(/\s[A-Z][A-z]+/)
        if (entities && entities.length) {
            const entity = entities[0].replace(' ', '').replace('.', '')
            return { text: entity, lastIndex: 0 }
        }
        return { text: "", lastIndex: 0 }
    } else {
        const { text, lastIndex } = getWordBetweenSpace(line.text, range.start.character)
        if (!text) return { text: "", lastIndex: 0 }

        const entityFullText = getFullTextType(text)
        return { text: entityFullText.classifyCase, lastIndex }
    }
}


export function getPropertiesEntity(name: string): any[] {
    const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
    if (!lines.length) return []
    const properties = []
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('@Column')) {
            let lineProperty = lines[index + 2]
            lineProperty = lineProperty.replace(':', '').replace(';', '')
            const words = lineProperty.split(' ').filter(Boolean)
            if (words.length > 1) properties.push(words[0])
            else continue
        }
    }
    return properties
}


export function getRelationsEntityDeeper(name: string, nameExcept: string = ''): { relations: any[], entities: any[] } {
    const lines = FSProvider.getLinesDocumentInFile(`src/entity/${name}.ts`)
    if (!lines.length) return { relations: [], entities: [] }
    const relations = []
    const nextEntity = []
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.includes('@ManyToMany') ||
            line.includes('@OneToMany') ||
            line.includes('@ManyToOne') ||
            line.includes('@OneToOne')) {
            let lineProperty = lines[index + 1]
            if (lineProperty.includes('@')) {
                lineProperty = lines[index + 2]
            }
            if (lineProperty.includes('@')) {
                lineProperty = lines[index + 3]
            }
            lineProperty = lineProperty.replace(':', '').replace(';', '').replace('[]', '')

            if (nameExcept && lineProperty == nameExcept) continue

            const words = lineProperty.split(' ').filter(Boolean)
            if (words.length > 1) {
                relations.push(words[0])
                nextEntity.push(words[1])
            }
        }
    }

    return { relations, entities: nextEntity }
}

export function getRelationsEntity(name: string): any[] {
    const finalRelation: any[] = []
    const { relations, entities } = getRelationsEntityDeeper(name)
    if (!relations || !relations.length) return []

    relations.map((r: any, i: number) => {
        finalRelation.push(r)
        const nextRelations = getRelationsEntityDeeper(entities[i], name)

        if (relations && relations.length) {
            finalRelation.push(...nextRelations.relations.map((n: any) => `${r}.${n}`))
        }
    })
    return finalRelation
}
