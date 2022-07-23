const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'public'}
      ]
    })
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 9002,
  },
  mode: 'development',
};