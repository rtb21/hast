import { Program } from "../node_modules/@types/esprima/index";
import { Node } from "../node_modules/@types/estree/index";

export interface item {
    type: string;
}

let unknownElements: { type: string, count: number }[] = [];

function nodeToLinear(input: Node): item[] {
    switch (input.type) {
        case 'ArrayExpression':
            return [{ type: 'array expression' }, ...nodesToLinear(input.elements), { type: 'end' }];
        case 'AssignmentExpression':
            return [{ type: `assignment expression ${input.operator}`}, ...nodeToLinear(input.left), ...nodeToLinear(input.right)];
        case 'BinaryExpression':
            return [
                { type: 'binary expression' },
                ...nodeToLinear(input.left),
                { type: `binary operator ${input.operator}` },
                ...nodeToLinear(input.right),
            ];
        case 'BlockStatement':
            return [{ type: 'block statement' }, ...nodesToLinear(input.body), { type: 'end' }];
        case 'BreakStatement':
            return [{ type: `break statement ${input.label ? input.label : ''}`}];
        case 'CallExpression':
            return [
                { type: 'call expression' },
                ...nodesToLinear(input.arguments),
                { type: 'callee' },
                ...nodeToLinear(input.callee),
            ];
        case 'CatchClause':
            return [{ type: 'catch clause' }, ...nodeToLinear(input.param), ...nodeToLinear(input.body)];
        case 'ConditionalExpression':
            return [
                { type: 'conditional expression' },
                ...nodeToLinear(input.test),
                ...nodeToLinear(input.consequent),
                ...nodeToLinear(input.alternate),
            ];
        case 'DoWhileStatement':
            return [{ type: 'do while statement'}, ...nodeToLinear(input.test), ...nodeToLinear(input.body)];
        case 'EmptyStatement':
            return [{ type: 'empty statement'}];
        case 'ExpressionStatement':
            return [{ type: 'expression statement' }, ...nodeToLinear(input.expression)];
        case 'ForStatement':
            return [
                { type: 'for statement' },
                ...nodeToLinear(input.body),
            ]
            .concat(input.init ? [{ type: 'for init' }, ...nodeToLinear(input.init)] : [])
            .concat(input.test ? [{ type: 'for test' }, ...nodeToLinear(input.test)] : [])
            .concat(input.update ? [{ type: 'for update' }, ...nodeToLinear(input.update)]: []);
        case 'ForInStatement':
            return [{ type: 'for in statement' }, ...nodeToLinear(input.body), ...nodeToLinear(input.left), ...nodeToLinear(input.right)];
        case 'FunctionDeclaration':
            return [ 
                { type: `function declaration ${input.id.name}` },
                input.async ? { type: 'async' } : { type: 'sync' },
                input.generator ? { type: 'generator' } : { type: 'not generator' },
                ...nodesToLinear(input.params),
                { type: 'body' },
                ...nodeToLinear(input.body),
            ];
        case 'FunctionExpression':
            return [
                input.id ? 
                    { type: `function expression with id ${input.id.name}` } :
                    { type: 'function expression with no id' },
                input.async ? { type: 'async' } : { type: 'sync' },
                input.generator ? { type: 'generator' } : { type: 'not generator' },
                ...nodesToLinear(input.params), 
                { type: 'body' },
                ...nodeToLinear(input.body),
            ];
        case 'Identifier':
            return [{ type: `identifier ${input.name}` }];
        case 'IfStatement':
            return [{ type: 'if statement'}, ...nodeToLinear(input.test), ...nodeToLinear(input.consequent)]
                .concat( input.alternate ? [{type: 'if alternate'}, ...nodeToLinear(input.alternate)] : []);
        case 'Literal':
            return [{ type: `literal ${input.raw}` }, { type: `value ${input.value}`}];
        case 'LogicalExpression':
            return [{ type: `logical expression ${input.operator}` }, ...nodeToLinear(input.left), ...nodeToLinear(input.right)];
        case 'MemberExpression':
            return [
                input.computed ?
                    { type: 'member expression computed' } :
                    { type: 'member expression' },
                ...nodeToLinear(input.object),
                ...nodeToLinear(input.property)
            ];
        case 'NewExpression':
            return [{ type: 'new expression' }, ...nodeToLinear(input.callee), ...nodesToLinear(input.arguments), { type: 'end' }];
        case 'ObjectExpression':
            return [{ type: 'object expression' }, ...nodesToLinear(input.properties), { type: 'end' }];
        case 'Property':
            return [
                { type: `property ${input.computed ? 'computed' : ''} ${input.method ? 'method' : ''} ${input.shorthand ? 'shorthand' : ''} ${input.kind}` },
                ...nodeToLinear(input.key),
                ...nodeToLinear(input.value),
            ];
        case 'ReturnStatement':
            return input.argument ? [
                { type: 'return statement' }, ...nodeToLinear(input.argument)
            ] : [
                { type: 'return statement' }, { type: 'end' }
            ];
        case 'SequenceExpression':
            return [{ type: 'sequence exression' }, ...nodesToLinear(input.expressions), { type: 'end' }];
        case 'ThisExpression':
            return [{ type: 'this expression' }];
        case 'ThrowStatement':
            return [{ type: 'throw statement' }, ...nodeToLinear(input.argument)];
        case 'TryStatement':
            return [{ type: 'try statement' }, ...nodeToLinear(input.block)]
                .concat(input.handler ? [{ type: 'try handler'}, ...nodeToLinear(input.handler)] : [])
                .concat(input.finalizer ? [{ type: 'try finalizer'}, ...nodeToLinear(input.finalizer)] : []);
        case 'UnaryExpression':
            return [{ type: `unary ${input.prefix ? 'prefix' : 'postfix'} expression `}, ...nodeToLinear(input.argument)];
        case 'UpdateExpression':
            return [{ type: `update expression ${input.operator} ${input.prefix ? 'prefix' : 'postfix'}` }, ...nodeToLinear(input.argument)];
        case 'VariableDeclaration':
            return [{ type: `variable declaration ${input.kind}` }, ...nodesToLinear(input.declarations), { type: 'end' }];
        case 'VariableDeclarator':
            return input.init ? [
                { type: 'variable declarator with init'}, ...nodeToLinear(input.init), ...nodeToLinear(input.id),
            ] : [
                { type: 'variable declarator' }, ...nodeToLinear(input.id),
            ];
        case 'WhileStatement':
            return [{ type: 'while statement' }, ...nodeToLinear(input.test), ...nodeToLinear(input.body)];
        default:
            const unknown = unknownElements.find(element => element.type === input.type);
            if (unknown) {
                unknown.count += 1;
            } else {
                unknownElements.push({
                    type: input.type,
                    count: 1
                });
            }
            return [];
    }
}

function nodesToLinear(input: Node[]): item[] {
    return [].concat(...input.map(node => nodeToLinear(node)));
}

export function programToLinear(input: Program): item[] {
    const retVal = [
        ...nodesToLinear(input.body),
        { type: "program end"}
    ];
    unknownElements.forEach(element => {
        console.error(`${element.count} of ${element.type} not yet implemented.`);
    })
    console.log(`${unknownElements.reduce((count, next) => count + next.count, 0)} of ${unknownElements.length} unknown elements types`);
    return retVal;
}