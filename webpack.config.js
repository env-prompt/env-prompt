const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (env, options) => {
    let isProduction = options.mode === 'production';

    let devtool = '';
    if (!isProduction) {
        devtool = 'inline-source-map';
    }

    return {
        devtool,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.ts'],
            plugins: [new TsconfigPathsPlugin()]
        },
        target: 'node',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js'
        },
        plugins: [
            // Adds a shebang to the top of output files.  This is necessary since we're developing a cli application.
            new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
        ]
    };
};
