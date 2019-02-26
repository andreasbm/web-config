<h1 align="center">@appnest/web-config</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@appnest/web-config?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/web-config.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@appnest/web-config"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/web-config.svg" height="20"/></a>
<a href="https://david-dm.org/andreasbm/web-config"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/web-config.svg" height="20"/></a>
<a href="https://github.com/andreasbm/web-config/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/web-config.svg" height="20"/></a>
	</p>

<p align="center">
  <b>A Rollup configuration to help you build modern web applications.</b></br>
  <sub>The configuration works extremely well with the libraries lit-html and lit-element. I wanted to share it so you can use it too or build on top of it.<sub>
</p>

<br />

* An extensible `create-rollup-config.js` for using Rollup with sweet features as for example SCSS imports, Service Worker generation with Workbox, live reloading, coping resources, chunking, treeshaking, Typescript, production minifying and compression with brotli and gzip.
* An extensible `create-karma-config.js` to help with your Karma testing setup
* A `tsconfig.json` file to configure your Typescript
* A `tslint.json` file to configure your linting
* A `typings.d.ts` file to configure your typings
* A `.browserslistrc` file to configure how your files are transpiled
* A `.gitignore` file you can use as inspiration for your own `.gitignore` file
* [`rollup-plugin-compress` - A Rollup plugin that compresses the files in the bundle after building](src/lib/rollup-plugins/compress)
* [`rollup-plugin-copy` - A Rollup plugin that copies resources from one location to another](src/lib/rollup-plugins/copy)
* [`rollup-plugin-html-template` - A Rollup plugin that injects the bundle entry points into a HTML file](src/lib/rollup-plugins/html-template)
* [`rollup-plugin-import-styles` - A Rollup plugin that makes it possible to import style files using postcss](src/lib/rollup-plugins/import-styles)
* [`rollup-plugin-live-reload` - A Rollup plugin that live reload files as they changes](src/lib/rollup-plugins/live-reload)
* [`rollup-plugin-minify-lit-html` - A Rollup plugin that minifies lit-html templates](src/lib/rollup-plugins/minify-lit-html)
* [`rollup-plugin-replace` - A Rollup plugin that replaces an import with another import](src/lib/rollup-plugins/replace)
* [`rollup-plugin-workbox` - A Rollup plugin that uses workbox to generate a service worker](src/lib/rollup-plugins/workbox)
* [`rollup-plugin-budget` - A Rollup plugin that compares the sizes of the files to a specified budget](src/lib/rollup-plugins/budget)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#table-of-contents)

## ➤ Table of Contents

* [➤ Step 1 - Installation](#-step-1---installation)
* [➤ Step 2 - Setup `rollup.config.js`](#-step-2---setup-rollupconfigjs)
* [➤ Step 3 - Setup `tslint.json`](#-step-3---setup-tslintjson)
* [➤ Step 4 - Setup `tsconfig.json`](#-step-4---setup-tsconfigjson)
* [➤ Step 5 - Setup `.browserslistrc`](#-step-5---setup-browserslistrc)
* [➤ Step 6 - Setup `karma.conf.js`](#-step-6---setup-karmaconfjs)
* [➤ Step 7 - Add start and build scripts to `package.json`](#-step-7---add-start-and-build-scripts-to-packagejson)
* [➤ How to load stylesheets](#-how-to-load-stylesheets)
	* [Add the following to your `typings.d.ts` file!](#add-the-following-to-your-typingsdts-file)
	* [Load a global stylesheet (it will be added to the template file)](#load-a-global-stylesheet-it-will-be-added-to-the-template-file)
	* [Load a stylesheet as a string](#load-a-stylesheet-as-a-string)
* [➤ Contributors](#-contributors)
* [➤ License](#-license)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-1---installation)

## ➤ Step 1 - Installation

```javascript
npm i @appnest/web-config --D
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-2---setup-rollupconfigjs)

## ➤ Step 2 - Setup `rollup.config.js`

Here's an example on what your Rollup configuration file could look like:

```javascript
import path from "path";
import pkg from "./package.json";
import {
  defaultExternals,
  defaultOutputConfig,
  defaultPlugins,
  defaultProdPlugins,
  defaultServePlugins,
  isLibrary,
  isProd,
  isServe
} from "@appnest/web-config";

const folders = {
  dist: path.resolve(__dirname, "dist"),
  src: path.resolve(__dirname, "src/demo"),
  src_assets: path.resolve(__dirname, "src/demo/assets"),
  dist_assets: path.resolve(__dirname, "dist/assets")
};

const files = {
  main: path.join(folders.src, "main.ts"),
  src_index: path.join(folders.src, "index.html"),
  dist_index: path.join(folders.dist, "index.html")
};

export default {
  input: {
    main: files.main
  },
  output: [
    defaultOutputConfig({
      dir: folders.dist,
      format: "esm"
    })
  ],
  plugins: [
    ...defaultPlugins({
      copyConfig: {
        resources: [[folders.src_assets, folders.dist_assets]],
      },
      cleanerConfig: {
        targets: [
          folders.dist
        ]
      },
      htmlTemplateConfig: {
        template: files.src_index,
        target: files.dist_index,
        include: /main(-.*)?\.js$/
      },
      importStylesConfig: {
        globals: ["main.scss"]
      }
    }),

    // Serve
    ...(isServe ? [
        ...defaultServePlugins({
            dist: folders.dist
        })
    ] : []),

    // Production
    ...(isProd ? [
        ...defaultProdPlugins({
            dist: folders.dist
        })
    ] : [])
  ],
  treeshake: isProd,
  context: "window"
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-3---setup-tslintjson)

## ➤ Step 3 - Setup `tslint.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tslint.json"
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-4---setup-tsconfigjson)

## ➤ Step 4 - Setup `tsconfig.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tsconfig.json"
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-5---setup-browserslistrc)

## ➤ Step 5 - Setup `.browserslistrc`

The tools transpiling your code are using `browserslist` to figure out what is supported. Your `.browserslistrc` could look like this.

```
last 2 Chrome versions
last 2 Safari versions
last 2 Firefox versions
```

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-6---setup-karmaconfjs)

## ➤ Step 6 - Setup `karma.conf.js`

```javascript
const {defaultResolvePlugins, defaultKarmaConfig} = require("@appnest/web-config");

module.exports = (config) => {
  config.set({
    ...defaultKarmaConfig({
      rollupPlugins: defaultResolvePlugins()
    }),
    basePath: "src",
    logLevel: config.LOG_INFO
  });
};
```

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#step-7---add-start-and-build-scripts-to-packagejson)

## ➤ Step 7 - Add start and build scripts to `package.json`

Here an example on what scripts you could add to your `package.json` file.

```
{
  ...
  scripts: {
    "b:dev": "rollup -c --environment NODE_ENV:dev",
    "b:prod": "rollup -c --environment NODE_ENV:prod",
    "s:dev": "rollup -c --watch --environment NODE_ENV:dev",
    "s:prod": "rollup -c --watch --environment NODE_ENV:prod",
    "s": "npm run s:dev"
    ...
  }
  ...
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#how-to-load-stylesheets)

## ➤ How to load stylesheets

### Add the following to your `typings.d.ts` file!

This is to make Typescript not complaining about SCSS, CSS and JSON imports.

```typescript
/// <reference path="node_modules/@appnest/web-config/typings.d.ts" />
```

### Load a global stylesheet (it will be added to the template file)

**Step 1:** Import your stylesheet using the ES6 import syntax

```javascript
import "./main.scss";
```

**Step 2:** Include the name of the stylesheet in your Rollup config

```javascript
export default {
  ...
    defaultPlugins({
       ...
       importStylesConfig: {
         globals: ["main.scss"]
       },
       ...
    }),
  ...
}
```

### Load a stylesheet as a string

```javascript
import css from "./my-component.scss";
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#contributors)

## ➤ Contributors
	
|[<img alt="Andreas Mehlsen" src="https://avatars1.githubusercontent.com/u/6267397?s=460&v=4" width="100">](https://twitter.com/andreasmehlsen) | [<img alt="You?" src="https://joeschmoe.io/api/v1/random" width="100">](https://github.com/andreasbm/web-config/blob/master/CONTRIBUTING.md)|
|:---: | :---:|
|[Andreas Mehlsen](https://twitter.com/andreasmehlsen) | [You?](https://github.com/andreasbm/web-config/blob/master/CONTRIBUTING.md)|

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/vintage.png)](#license)

## ➤ License
	
Licensed under [MIT](https://opensource.org/licenses/MIT).