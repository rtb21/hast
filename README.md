# hast
Huffmann compression of javascript AST

## Oh Well

The idea was that a huffmann encoded AST would be give better compression than a generic compression routine such as gzip etc. Unfortunately it doesn't! Trying this on jquery.min.js gives a huffmann compressed size of 27kB (without huffmann table), whilst a simple zip of the same javascript gives a sizeof 24kB.

Still it was fun to learn about the javascript AST!