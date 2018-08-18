const path = require("path");

// injects bundles in html
const HtmlWebpackPlugin = require("html-webpack-plugin");
// cleans up dist folder
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      // game engine kontra.js
      {
        test: /kontra\.js/,
        use: ["script-loader"]
      },
      // styles
      // TODO: this is adding 10K to the bundle :O
      // review if I want to have this
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/
      },
      // typescript
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "js13k-spaceshooter",
      template: "src/index.html"
    })
  ]
};
