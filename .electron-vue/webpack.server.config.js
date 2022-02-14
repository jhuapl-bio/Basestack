'use strict'

process.env.BABEL_ENV = 'server'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const NodemonPlugin = require('nodemon-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin')


/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['express']
let serverConfig = {
  target: 'node',
   entry: {
     server: path.join(__dirname, '../src/server/index.server.js')
   },
   devtool: 'source-map',
   mode: 'development',
  //  output: {
  //    filename: '[name].js',
  //    path: path.join(__dirname, '../dist/electron'),
  //    libraryTarget: 'commonjs2',
  //    publicPath: '/',
  //  },
   externals: [
     nodeExternals(),
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
   node: {
    __dirname: false,
    __filename: false
    },
  resolve: {
    // modules: [path.resolve(__dirname, '../node_modules')],
    extensions: [ 
        '.jsx', '.js',
        '.yaml',
        '.json',
        '.html',
        '.css', '.styl', '.scss', '.sass' ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.ya?ml$/,
        type: 'json', // Required by Webpack v4
        use: 'yaml-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ESLintPlugin(),
  ],
};

if (process.env.NODE_ENV !== 'production'){
  serverConfig.devtool = 'eval-cheap-source-map'
  serverConfig.plugins.push(
    new NodemonPlugin(
      {
         verbose: true,
        "PORT_SERVER": process.env.PORT_SERVER
      }
    ) 
  )
}

/**
 * Adjust serverConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  serverConfig.devtool = 'source-map'
  serverConfig.mode = 'production'
  serverConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    // new CopyWebpackPlugin([
    //   {
    //     from: path.join(__dirname, '../static'),
    //     to: path.join(__dirname, '../dist/electron/static'),
    //     ignore: ['.*']
    //   }
    // ]),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = serverConfig
