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



/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = []

// let serverConfig = {
//   devtool: '#cheap-module-eval-source-map',
//   entry:path.join(__dirname, '../src/modules/server/server.js'),
//   externals: [
//     ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
//   ],
//   module: {
//     rules: [
//       {
//         test: /\.(js|vue)$/,
//         enforce: 'pre',
//         exclude: /node_modules/,
//         use: {
//           loader: 'eslint-loader',
//           options: {
//             formatter: require('eslint-friendly-formatter')
//           }
//         }
//       },
//       {
//         test: /\.scss$/,
//         use: ['vue-style-loader', 'css-loader', 'sass-loader']
//       },
//       {
//         test: /\.sass$/,
//         use: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
//       },
//       {
//         test: /\.less$/,
//         use: ['vue-style-loader', 'css-loader', 'less-loader']
//       },
//       {
//         test: /\.css$/,
//         use: ['vue-style-loader', 'css-loader']
//       },
//       {
//         test: /\.html$/,
//         use: 'vue-html-loader'
//       },
//       {
//         test: /\.js$/,
//         use: 'babel-loader',
//         exclude: /node_modules/
//       },
//       {
//         test: /\.node$/,
//         use: 'node-loader'
//       },
//       {
//         test: /\.vue$/,
//         use: {
//           loader: 'vue-loader',
//           options: {
//             extractCSS: process.env.NODE_ENV === 'production',
//             loaders: {
//               sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
//               scss: 'vue-style-loader!css-loader!sass-loader',
//               less: 'vue-style-loader!css-loader!less-loader'
//             }
//           }
//         }
//       },
//       {
//         test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
//         use: {
//           loader: 'url-loader',
//           query: {
//             limit: 10000,
//             name: 'imgs/[name]--[folder].[ext]'
//           }
//         }
//       },
//       {
//         test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
//         loader: 'url-loader',
//         options: {
//           limit: 10000,
//           name: 'media/[name]--[folder].[ext]'
//         }
//       },
//       {
//         test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
//         use: {
//           loader: 'url-loader',
//           query: {
//             limit: 10000,
//             name: 'fonts/[name]--[folder].[ext]'
//           }
//         }
//       }
//     ]
//   },
//   node: {
//     __dirname: process.env.NODE_ENV !== 'production',
//     __filename: process.env.NODE_ENV !== 'production'
//   },
//   plugins: [
//     new NodemonPlugin(),
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoEmitOnErrorsPlugin()
//   ],
//   output: {
//     filename: '[name].js',
//     libraryTarget: 'commonjs2',
//     path: path.join(__dirname, '../dist/electron')
//   },
//   resolve: {
//     alias: {
//       '@': path.join(__dirname, '../src/modules/server/api'),
//       '@controllers': '../src/modules/server/api/controllers'
//     },
//     extensions: ['.js', '.vue', '.json', '.css', '.node']
//   },
//   target: 'async-node'
// }

// /**
//  * Adjust serverConfig for development settings
//  */
// if (process.env.NODE_ENV !== 'production') {
//   serverConfig.plugins.push(
//     new webpack.DefinePlugin({
//       '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
//     })
//   )
// }
let serverConfig = {
  mode: 'development',
   entry: {
     app: path.join(__dirname, '../src/modules/server/server.js')
   },
   devtool: 'inline-source-map',
   devServer: {
     contentBase: './dist',
   },
   plugins: [
     // new webpack.CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
     new HtmlWebpackPlugin({
       title: 'Development',
     }),
   ],
   output: {
     filename: '[name].js',
     path: path.resolve(__dirname, 'dist'),
    // publicPath: '/',
   },
  // target: 'node',
  // entry:{
  //   app: path.join(__dirname, '../src/modules/server/server.js')
  // },
  // output: {
  //   filename: '[name].js',
  //   path: path.join(__dirname, '../dist/electron')
  //   // path: path.join(__dirname, './dist/')    
  // },
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
    // new NodemonPlugin()
  ],
};


/**
 * Adjust serverConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  serverConfig.devtool = ''

  serverConfig.plugins.push(
    new MinifyPlugin(),
    new NodemonPlugin(),
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
