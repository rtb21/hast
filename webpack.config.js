const path = require('path');

module.exports = () => {
    return {
        entry: './src/index.ts',
        module: {
            rules: [{
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }]
        },
        target: 'node',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist')
        },
        resolve: {
            extensions: [ '.ts', '.js' ]
        },
    }
}