const path = require('path');

module.exports = {
  entry: './src/handler.ts',
  target: 'node',
  mode: 'production',
  externals: [/node_modules/],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: 'handler.js'
  }
};
