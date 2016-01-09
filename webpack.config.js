var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname + "/ui",
  entry: "./main.js",

  devtool: 'source-map',

  output: {
    filename: "ui.js",
    path: __dirname + "/dist",
  },

  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract(
          'css?sourceMap!' +
          'less?sourceMap'
        )
      }
    ],
  },

  plugins: [
    new ExtractTextPlugin('styles.css')
  ],

  devServer: {
    contentBase: "dist",
    proxy: {
      "/files/*": process.env.BOT_URL,
      "/tracks*": process.env.BOT_URL
    },
    noInfo: true
  }
}
