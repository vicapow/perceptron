const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "./src/index.ts"),
  output: {
    path: path.resolve(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
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
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
};
