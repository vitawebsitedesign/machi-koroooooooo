// const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.devServer = function (options) {
  return {
    // configuation for the webpack-dev-server plugin
    devServer: {
      // defaults to localhost
      host: options.host,
      // defaults to 8080
      port: options.port,
      // remove browser status bar when running in production
      inline: true,
      // display erros only in console to limit webpack output size
      stats: 'errors-only'
    }
  }
}

exports.lintJS = function ({ paths, options }) {
  return {
    // this module is merged with the babel-loader module in the commons object via
    // `webpack-merge`
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: paths,
          exclude: /node_modules/,
          // enables ESLint to run before anything else
          enforce: 'pre',
          use: [
            // eslint runs before babel
            {
              loader: 'eslint-loader',
              options: options
            }
          ]
        }
      ]
    }
  }
}

exports.CSS = function (env) {
  // In production, extract CSS into a separate file depending and inject
  // into the head of the document
  if (env === 'production') {
    return {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              use: {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  modules: true,
                  localIdentName: '[path][name]__[local]--[hash:base64:5]'
                }
              }
            })
          }
        ]
      },
      plugins: [
        new ExtractTextPlugin({
          filename: '[name].css',
          allChunks: true
        })
      ]
    }
  }

  return {
    module: {
      rules: [
        {
          // regex pattern that matches any CSS files
          test: /\.css$/,
          use: [
            // injects styles into the Document as a <link>
            'style-loader',
            {
              // applies necessary transformations to CSS files
              loader: 'css-loader',
              options: {
                sourceMap: true,
                // enables CSS modules
                modules: true,
                // generates a unique css rule for component styles. This property is what allows
                // CSS modules to contain rules locally. You can name a CSS rule something generic
                // such as `.normal` or `.red`, and `localIdentName` will generate a unique CSS rule
                // to avoid namespace clashing
                localIdentName: '[path][name]__[local]--[hash:base64:5]'
              }
            }
          ]
        }
      ]
    }
  }
}
