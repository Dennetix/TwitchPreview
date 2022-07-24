const path = require('path');

module.exports = () => {
    return {
        entry: {
            app: './src/TwitchPreview'
        },
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
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
        }
    };
};
