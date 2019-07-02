const path = require('path');

module.exports = {
    entry: ['./src/public/wiki-template-parser.js'],
    mode: 'development',
    output: {
        filename: 'wiki-template-parser.js',
        path: path.resolve(__dirname, '../'),
        libraryTarget: 'umd'
    }
};