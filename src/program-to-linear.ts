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
        case 'BinaryExpression':
            return [
                { type: 'binary expression' },
                ...nodeToLinear(input.left),
                { type: `binary operator ${input.operator}` },
                ...nodeToLinear(input.right),
            ];
        case 'BlockStatement':
            return [{ type: 'block statement' }, ...nodesToLinear(input.body), { type: 'end' }];
        case 'CallExpression':
            return [
                { type: 'call expression' },
                ...nodesToLinear(input.arguments),
                { type: 'callee' },
                ...nodeToLinear(input.callee),
            ];
        case 'ConditionalExpression':
            return [
                { type: 'conditional expression' },
                ...nodeToLinear(input.test),
                ...nodeToLinear(input.consequent),
                ...nodeToLinear(input.alternate),
            ];
        case 'ExpressionStatement':
            return [{ type: 'expression statement' }, ...nodeToLinear(input.expression)];
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
        case 'ReturnStatement':
            return input.argument ? [
                { type: 'return statement' }, ...nodeToLinear(input.argument)
            ] : [
                { type: 'return statement' }, { type: 'end' }
            ];
        case 'ThisExpression':
            return [{ type: 'this expression' }];
        case 'UnaryExpression':
            return [{ type: `unary ${input.prefix ? 'prefix' : 'postfix'} expression `}, ...nodeToLinear(input.argument)];
        case 'VariableDeclaration':
            return [{ type: `variable declaration ${input.kind}` }, ...nodesToLinear(input.declarations), { type: 'end' }];
        case 'VariableDeclarator':
            return input.init ? [
                { type: 'variable declarator with init'}, ...nodeToLinear(input.init), ...nodeToLinear(input.id),
            ] : [
                { type: 'variable declarator' }, ...nodeToLinear(input.id),
            ];
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