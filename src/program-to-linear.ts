import { Program } from "../node_modules/@types/esprima/index";
import { Node } from "../node_modules/@types/estree/index";

export interface item {
    type: string;
}

function nodeToLinear(input: Node): item[] {
    switch (input.type) {
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
                { type: `function declaration ${input.id}` },
                input.async ? { type: 'async' } : { type: 'sync' },
                input.generator ? { type: 'generator' } : { type: 'not generator' },
                ...nodesToLinear(input.params),
                { type: 'body' },
                ...nodeToLinear(input.body),
            ];
        case 'FunctionExpression':
            return [
                { type: `function expression ${input.id}` },
                input.async ? { type: 'async' } : { type: 'sync' },
                input.generator ? { type: 'generator' } : { type: 'not generator' },
                ...nodesToLinear(input.params), 
                { type: 'body' },
                ...nodeToLinear(input.body),
            ];
        case 'Identifier':
            return [{type: `identifier ${input.name}`}];
        case 'Literal':
            return input.
        case 'ReturnStatement':
            return input.argument ? [
                { type: 'return statement' }, ...nodeToLinear(input.argument)
            ] : [
                { type: 'return statement' }, { type: 'end' }
            ];
        case 'UnaryExpression':
            return [{ type: `unary ${input.prefix ? 'prefix' : 'postfix'} expression `}, ...nodeToLinear(input.argument)];
        default:
            console.error(`${input.type} not yet implemented.`);
            return [];
    }
}

function nodesToLinear(input: Node[]): item[] {
    return [].concat(...input.map(node => nodeToLinear(node)));
}

export function programToLinear(input: Program): item[] {
    return [
        ...nodesToLinear(input.body),
        { type: "program end"}
    ];
}