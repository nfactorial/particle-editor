var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: ['./development/main.jsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, 'development')
                ]
            },
            {
                test: /\.sass?$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
                include: [
                    path.resolve(__dirname, 'development')
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
};
