/**
 * Requires
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
// const webpack = require('webpack')
const merge = require('webpack-merge')

/**
 * Variables
 */
const Parts = require('./webpack.parts')
const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist')
}

/**
 * Common Configuration
 */
const Common = merge([
  {
    context: PATHS.src,
    entry: {
      // The context property references the source directory and tells
      // webpack to begin there. `main` is just the key that references
      // the starting point of the application, `index.js`
      main: './index.js'
    },
    output: {
      // `[name]` will be replaced with the key that references our
      // entry point inside the `entry` object. In this case it will
      // be `main`
      filename: '[name].bundle.js',
      path: PATHS.dist
    },
    module: {
      rules: [
        {
          // Regex pattern that matches any files with a .js or .jsx
          // file extension
          test: /\.jsx?$/,
          include: [path.join(__dirname, 'src')],
          // Exclude the node_modules folder from being transpiled
          exclude: /node_modules/,
          // Transform all .js and .jsx files to standard ES5 syntax
          // using the Babel loader
          use: 'babel-loader'
        }
      ]
    },
    plugins: [
      // Generates an index.html file template with
      // our bundled JavaScript injected into the bottom of the body
      new HtmlWebpackPlugin({ template: path.join(PATHS.src, 'index.html') })
    ]
  }
])

module.exports = function (env) {
  /**
   * Production Configuration
   */
  if (env === 'production') {
    return merge([
      Common,
      Parts.lintJS({ paths: PATHS.src }),
      Parts.CSS(env)
    ])
  }
  /**
   * Develpment Configuration
   */
  return merge([
    Common,
    Parts.devServer({
      host: process.env.HOST,
      port: process.env.PORT
    }),
    Parts.lintJS({
      paths: PATHS.src,
      options: {
        emitWarning: true
      }
    }),
    Parts.CSS(env)
  ])
}
