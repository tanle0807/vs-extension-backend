export function replaceSymbolTemplate(content: string) {
    content = content.replace(/{{backtick}}/g, '`');
    content = content.replace(/{{dollar}}/g, '$');
    return content
}

export function toLowerCaseFirstLetter(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1)
}

export function toUpperCaseFirstLetter(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1)
}

interface TextType {
    lowerCase: string,
    upperCase: string,
    camelCase: string,
    kebabCase: string,
    titleCase: string,
    snakeCase: string,
    snakeUpperCase: string,
    classifyCase: string
}

export function getFullTextType(text: string): TextType {
    return {
        lowerCase: text.toLowerCase(),
        upperCase: text.toUpperCase(),
        camelCase: toCamelCase(text),
        kebabCase: toKebabCase(text),
        titleCase: toTitleCase(text),
        snakeCase: toSnakeCase(text),
        snakeUpperCase: toSnakeUpperCase(text),
        classifyCase: capitalize(text)
    }
}

export const words = (str: any, pattern = /[^a-zA-Z-]+/): string[] => str.split(pattern).filter(Boolean);

export const toCamelCase = (str: any) => {
    let s =
        str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x: any) => {
                return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
            })
            .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
};

export const toKebabCase = (str: any) =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((x: any) => x.toLowerCase())
        .join('-');

export const toTitleCase = (str: any) =>
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((x: any) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' ');

export const capitalize = ([first, ...rest]: string, lowerRest = false) => {
    return first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));
};

export const toSnakeCase = (str: any) => {
    return str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x: any) => x.toLowerCase())
            .join('_');
}

export const toSnakeUpperCase = (str: any) => {
    return str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x: any) => x.toUpperCase())
            .join('_');
}

export function getLastFolderFromPath(path: string): string {
    if (!path) return ''
    const folders = path.split('/')
    return folders[folders.length - 1]
}

export function getWordBetweenSpace(line: string, indexSelected: number) {
    console.log('indexSelected:', indexSelected)
    console.log('line:', line)
    let text = ''
    let lastIndex = indexSelected - 1
    console.log('lastIndex:', lastIndex)
    for (let index = indexSelected - 1; index > 0; index--) {
        const char = line[index];
        console.log('char truoc:', char)
        if (char != " ") {
            text = char + text
        } else {
            break
        }
    }

    for (let index = indexSelected; index < line.length; index++) {
        const char = line[index]
        console.log('char: sau', char)
        if (char != " " && char != "." && char != "`") {
            text += char
            lastIndex = index
            console.log('lastIndex:', lastIndex)
        } else {
            break
        }
    }

    return { text, lastIndex }
}