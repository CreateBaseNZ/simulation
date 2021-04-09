const path = require("path");
const fs = require("fs");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const appDirectory = fs.realpathSync(process.cwd());
module.exports = {
    entry: {
        main: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
        worker: path.resolve(appDirectory, "src/worker.ts"),
    },
    output: {
        filename: "js/[name].bundle.js", //name for the js file that is created/compiled in memory
        path: path.join(appDirectory, '/dist'),
    },
    resolve: {
        fallback: {
            fs: false,
        },
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        host: "0.0.0.0",
        port: 8000, //port that we're using for local host (localhost:8000)
        contentBase: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            }
        ],
    },
    plugins: [
        new MonacoWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
    ],
    context: __dirname,
    mode: "development",
};