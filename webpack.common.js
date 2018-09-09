const path = require("path");

// injects bundles in html
const HtmlWebpackPlugin = require("html-webpack-plugin");
// cleans up dist folder
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: {
    kontra: "./src/loadkontra.js",
    game: "./src/index.ts"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      // game engine kontra.js
      /*
      // this is highly inefficient
      // it embeds the script as a string
      // no chance of optimizing it
      {
        test: /kontra\.js/,
        use: ["script-loader"]
      },
      */
      // styles
      // TODO: this is adding 10K to the bundle :O
      // review if I want to have this
      /* This adds non minified 10K in prod
      // I'll inline the css manually in the resulting template
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/
      },
      */
      // typescript
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },

      // loading kontra as a global script
      // it relies on this being window
      {
        test: require.resolve("./src/libs/kontra.min.js"),
        use: "imports-loader?this=>window"
      },
      {
        test: require.resolve("./src/libs/kontra.min.js"),
        use: "exports-loader?kontra=this.kontra"
      },
      // Actual sprites
      // Using Piksel thus far to create sprites manually
      // it saves stuff as PNG, that may not be super optimal
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
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
      template: "src/index.html",
      minify: {
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true
      }
    })
  ]
};
