import { item } from "./program-to-linear";

class TableEntry {
    public static createTree(table: TableEntry[]) {
        if (table.length === 1) {
            return new TreeLeaf(table[0].type, 1, 1);
        }
        const tree: TreeNode[] = [new TreeBranch(0, 1, undefined, undefined)];
        table = table.sort((a, b) => {
            const length = Math.min(a.codeLength, b.codeLength);
            for (let i = 0; i < length; i++) {
                if (a.codeString[i] < b.codeString[i]) {
                    return -1;
                }
                if (a.codeString[i] > b.codeString[i]) {
                    return 1;
                }
            }
        });
     }

    constructor(readonly type: string, readonly codeString: string) { }

    public get code(): number { return parseInt(this.codeString, 2); }
    public get codeLength(): number { return this.codeString.length; }
}

abstract class TreeNode {
    constructor(
        readonly type: string,
        readonly count: number,
        readonly depth: number,
    ) { }

    abstract createTable(code: string): TableEntry[];

    abstract toString(): string[];
}

class TreeLeaf extends TreeNode {
    constructor(
        readonly type: string,
        readonly count: number,
        readonly depth: number,
    ) { 
        super(type, count, depth);
    }

    public createTable(code: string): TableEntry[] { return [new TableEntry(this.type, code)]; }

    public toString(): string[] {
        return [`Leaf: ${this.type}`];
    }
}

class TreeBranch extends TreeNode {
    constructor(        
        readonly count: number,
        readonly depth: number,
        readonly left: TreeNode,
        readonly right: TreeNode,
    ) { 
        super("branch", count, depth);
    }

    public createTable(code: string): TableEntry[] {
        return [
            ...this.left.createTable(`${code}0`),
            ...this.right.createTable(`${code}1`),
        ];
    }

    public toString(): string[] {
        return [
            ...this.left.toString().map(str => `Left: ${str}`),
            ...this.right.toString().map(str => `Right: ${str}`),
        ]
    }
}

function sortItems(a: TreeNode, b: TreeNode) {
    if (a.count > b.count) {
        return 1;
    }
    if (b.count > a.count) {
        return -1;
    }
    if (a.type > b.type) {
        return 1;
    }
    if (a.type < b.type) {
        return -1;
    }
    return 0;
}

export function encode(items: item[]): { table: TableEntry[], encoded: Uint8Array } {
    let counts: { type: string, count: number }[] = [];
    items.forEach(item => {
        const entry = counts.find(count => count.type === item.type);
        if (entry) {
            entry.count++;
        } else {
            counts.push({ type: item.type, count: 1});
        }
    });
    let huffmannTree = counts.sort(sortItems).map((count) => new TreeLeaf(count.type, count.count, 1));
    while (huffmannTree.length > 1) {
        const [left, right, ...rest] = huffmannTree;
        const branch: TreeBranch = new TreeBranch(
            left.count + right.count,
            Math.max(left.depth, right.depth) + 1,
            left,
            right,
        );
        huffmannTree = [...rest, branch].sort(sortItems);
    }
    const huffmannTable = huffmannTree[0].createTable('');
    const binaryString = items.reduce((str, item) => str.concat(huffmannTable.find((e) => e.type === item.type).codeString), '');
    const numberArray = [];
    for (let i = 0; i < binaryString.length; i += 8 ) {
        let binarySlice = binaryString.slice(i, i + 8);
        if (binarySlice.length < 8) {
            binarySlice = binarySlice.concat('0'.repeat(8 - binarySlice.length));
        }
        numberArray.push(parseInt(binarySlice, 2));
    }
    return {
        table: huffmannTable,
        encoded: Uint8Array.from(numberArray),
    };
}

export function decode(table: TableEntry[], encoded: Uint8Array): void {
    const numberArray = Array.from(encoded);
    const binaryString = numberArray.map(n => {
        const binary = n.toString(2);
        return "0".repeat(8 - binary.length).concat(binary);
    }).join("");
    const huffmannTree = TableEntry.createTree(table);
}