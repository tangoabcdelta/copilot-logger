//@ts-check

'use strict';

const path = require('path');

// Check the environment variable NODE_ENV to determine the build mode
const isDevMode = process.env.NODE_ENV === "development";

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: isDevMode ? 'development' : 'production', // set mode based on NODE_ENV
  optimization: {
    minimize: !isDevMode, // Disable minification in development mode
  },
  // set this to leave the source code as close as possible to the original (when packaging we set this to 'production')
  // 	mode: 'none',
  

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'media/[name][ext]'
        }
      }
    ]
  },
  cache: {
    type: "filesystem", // Enable caching for faster rebuilds
  },
  watchOptions: {
    ignored: /node_modules/, // Ignore node_modules for faster rebuilds
    aggregateTimeout: 300, // Delay rebuild after changes
    poll: 1000, // Check for changes every second
  },
  devtool: isDevMode ? 'eval-source-map' : 'source-map', // Use faster source maps in dev mode
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};
module.exports = [ extensionConfig ];