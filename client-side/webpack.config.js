const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/index.js",
  target: "web",
  plugins: [
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
    new BundleAnalyzerPlugin({"analyzerPort":9000, "analyzerMode": "static", "openAnalyzer": false, "generateStatsFile": true, "statsFilename": "BundleAnalyser.stats.json"})
  ],

  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  }
};

/*
  plugins: [
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
*/
