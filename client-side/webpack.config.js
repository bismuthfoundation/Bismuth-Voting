const path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
  'mode' : 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};

/*
  plugins: [
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
*/
