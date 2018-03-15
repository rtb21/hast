import { parseScript } from 'esprima';
import { programToLinear } from './program-to-linear';
import { encode, decode } from './huffmann';
import * as fs from 'fs';

const code = [
    "function add(a, b) {",
    "  return a +",
    "    // Weird formatting, huh?",
    "    b;",
    "}"
].join("\n");

var file = fs.readFileSync("./jquery.min.js", "utf8");

const ast = parseScript(file);
const linearItems = programToLinear(ast);
const huffmann = encode(linearItems);
console.log(`Encoded data is ${huffmann.encoded.length} bytes long`);
const decodedItems = decode(huffmann.table, huffmann.encoded);


 