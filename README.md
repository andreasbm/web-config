# @appnest/web-config

## 🤔 What is this?

This is an opinionated simple configuration I sometimes use when getting started with new web applications (usually using the lit-html/lit-element library). I wanted to share it, maybe it can give you some inspiration. It contains the following:

- An extensible `create-webpack-config.js` (webpack 4+) for using webpack with postcss, SCSS, single-page webapp, chunking, typescript, production minifying and image compression
- A `tsconfig.json` file
- A `tslint.json` file
- A `postcss.config.js` file

## 🎉 Step 1 - Install the dependency

```javascript
npm i @appnest/web-config --save-dev
```

## 💪 Step 2 - Setup `webpack.config.js`

Here's an example on what your webpack configuration file could look like:

```javascript
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const {CreateWebpackConfig, defaultDevServerConfig} = require("../lib/create-webpack-config");

const folderPath = {
  SRC: __dirname,
  DIST: path.resolve(__dirname, "../../dist"),
  SRC_ASSETS: path.resolve(__dirname, "assets"),
  DIST_ASSETS: path.resolve(__dirname, "../../dist/assets")
};

const fileName = {
  MAIN: "./main.ts",
  POLYFILLS: "./polyfills.js",
  INDEX_HTML: "./index.html"
};

const devServer = defaultDevServerConfig(folderPath.DIST);
devServer.port = "2345";

module.exports = CreateWebpackConfig({
  context: folderPath.SRC,
  indexTemplate: fileName.INDEX_HTML,
  outputFolder: folderPath.DIST,
  devServer,
  entry: {
    "polyfills": fileName.POLYFILLS,
    "main": fileName.MAIN
  },
  output: {
    path: folderPath.DIST,
    filename: "[name].[hash].js"
  },
  plugins: [],
  prodPlugins: [
    new BundleAnalyzerPlugin()
  ]
});

```

## 👌 Step 3 - Setup `tslint.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tslint.json"
}
```

## 🤘 Step 4 - Setup `tsconfig.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tsconfig.json"
}
```

## 👍 Step 5 - Setup `postcss.config.js`

```javascript
const defaultConfig = require("./node_modules/@appnest/web-config/postcss.config");
module.exports = defaultConfig;
```

## 🖌 How to load stylesheets

### Load a global stylesheet (will be added to the index file)

```
import "./styles/theme.scss?global";
```

### Load a stylesheet as a string

```
const styles = require("./demo.scss").toString();
```

## Future work

Future work involves making the configuration more customizable.

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).