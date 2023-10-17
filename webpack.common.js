const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "./src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              experimentalWatchApi: true,
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "How A Perceptron Works",
      template: "src/index.html",
    }),
  ],
  ignoreWarnings: [
    {
      module:
        /.\/node_modules\/css-loader\/dist\/cjs.js!.\/node_modules\/postcss-loader\/dist\/cjs.js!.\/src\/index.css/,
    },
  ],
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
};
