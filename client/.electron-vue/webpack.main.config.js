'use strict'

process.env.BABEL_ENV = 'main'

const express = require("express")



const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')

let mainConfig = {
  
  entry: {
    main: path.join(__dirname, '../src/main/index.js'),
  },
  externals: [
    ...Object.keys(dependencies || {})
  ],
  module: {
    rules: [
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

  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new ESLintPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
  watchOptions: {
    ignored: '../src/modules/**'
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.mode = 'development'
  mainConfig.devtool = 'eval-cheap-module-source-map'
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  // mainConfig.entry.main = [path.join(__dirname, '../src/modules/index.server.js')].concat(mainConfig.entry.main)
  mainConfig.mode = 'production'
  mainConfig.devTool = 'source-map'
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig
