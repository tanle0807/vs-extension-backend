export enum EntityAction {
    AddProperty = 'BMD: Add property entity',
    OneToMany = 'BMD: OneToMany with ',
    ManyToOne = 'BMD: ManyToOne with ',
    ManyToMany = 'BMD: ManyToMany with ',
    OneToOne = 'BMD: OneToOne with ',
    ExportInterface = 'BMD: Export interface',
    AddRelation = 'BMD: Add relation',
    FindOneOrThrowID = 'BMD: Find one or throw ID',
    CreateQueryBuilder = 'BMD: Create query builder',
    AddBuilderRelation = 'BMD: Add relation builder',
}

export enum PropertyType {
    String = 'STRING',
    Number = 'NUMBER',
    Boolean = 'BOOLEAN',
    Text = 'TEXT',
    Double = 'DOUBLE',
    BalanceColumn = 'BALANCE COLUMN',
    IsBlockColumn = 'IS BLOCK COLUMN',
    IsDeleteColumn = 'IS DELETE COLUMN'
}