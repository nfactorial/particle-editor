var path = require('path');

module.exports = {
    entry: {
        app: ['./development/main.jsx']
    },
    output: {
        path: path.resolve(__dirname, 'development'),
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
            }
        ]
    }
};
