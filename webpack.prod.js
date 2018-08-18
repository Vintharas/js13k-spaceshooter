const merge = require("webpack-merge");
const common = require("./webpack.common.js");
var ZopfliPlugin = require("zopfli-webpack-plugin");

module.exports = merge(common, {
  // Using the production setting
  // enables UglifyJS with tree shaking
  mode: "production",
  module: {
    rules: []
  },
  plugins: [
    new ZopfliPlugin({
      asset: "[path].gz[query]",
      algorithm: "zopfli",
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});
