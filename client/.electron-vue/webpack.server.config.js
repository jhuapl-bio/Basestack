'use strict'

process.env.BABEL_ENV = 'server'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const MinifyPlugin = require("babel-minify-webpack-plugin")
const NodemonPlugin = require('nodemon-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = []

let serverConfig = {
  target: 'node',
  mode:'production',
   entry: {
     server: path.join(__dirname, '../src/modules/index.server.js')
   },
   devtool: 'source-map',
   output: {
     filename: '[name].js',
     path: path.join(__dirname, '../dist/electron'),
     libraryTarget: 'commonjs2',
     publicPath: '/',
   },
   externals: [nodeExternals()], // Need this to avoid error when working with Express
   node: {
    __dirname: false,
    __filename: false
    },
   resolve: {
    // modules: [path.resolve(__dirname, '../node_modules')],
    extensions: ['.js', '.vue', '.json', '.css', '.node']
   },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Production',
    })
  ],
};

if (process.env.NODE_ENV !== 'production'){
  serverConfig.plugins.push(new NodemonPlugin() )
} else {
  serverConfig.plugins.push(new NodemonPlugin() )

}


/**
 * Adjust serverConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  serverConfig.devtool = ''

  serverConfig.plugins.push(
    new MinifyPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/electron/static'),
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = serverConfig
