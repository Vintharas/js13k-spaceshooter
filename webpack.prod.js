const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const ZopfliPlugin = require("zopfli-webpack-plugin");

// # Closure compiler
// This is the official plugin for webpack but it doesn't work with webpack 4
//const ClosurePlugin = require("closure-webpack-plugin");

// This is another package by Google
// const fs = require("fs");
// const ClosureCompiler = require("google-closure-compiler-js").webpack;
// const externs = fs.readFileSync("./externs.js", "utf8");

module.exports = merge(common, {
  // Using the production setting
  // enables UglifyJS with tree shaking
  mode: "production",
  module: {
    rules: []
  },
  plugins: [
    /* this doesn't work with webpack 4 haha
    new ClosurePlugin(
      { mode: "STANDARD" },
      {
        // compiler flags here
        //
        // for debuging help, try these:
        //
        // formatting: 'PRETTY_PRINT'
        // debug: true
      }
    ),
    */
    /*
    new ClosureCompiler({
      options: {
        languageIn: "ECMASCRIPT6",
        languageOut: "ECMASCRIPT5",
        //compilationLevel: "ADVANCED",
        compilationLevel: "SIMPLE",
        warningLevel: "VERBOSE",
        //externs: ["./externs.js"]
        externs: [{ src: externs }]
      }
    }),
    */
    new ZopfliPlugin({
      asset: "[path].gz[query]",
      algorithm: "zopfli",
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});
