const webpack = require('webpack');
const path = require('path');

module.exports = (env, options) => {
    return {
        entry: {
            app: './src/TwitchPreview'
        },
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'bundle.js'
        },
        resolve: {
            extensions: ['*', '.webpack.js', '.web.js', '.ts', '.js'],
            modules: [
                path.resolve(__dirname, './node_modules')
            ]
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: options.mode,
                PRODUCTION: JSON.stringify(options.mode == 'production' ? true : false)
            })
        ]
    };
};
