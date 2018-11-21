# @appnest/web-config

<a href="https://npmcharts.com/compare/@appnest/web-config?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/web-config.svg" height="20"></img></a>
<a href="https://david-dm.org/andreasbm/web-config"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/web-config.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@appnest/web-config"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/web-config.svg" height="20"></img></a>
<a href="https://github.com/andreasbm/web-config/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/web-config.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>

## 🤔 What is this?

This is an opinionated simple configuration I sometimes use when getting started with new web applications (usually using the lit-html/lit-element library). I wanted to share it, maybe it can give you some inspiration. It contains the following:

- An extensible `create-rollup-config.js` for using Rollup with SCSS, single-page webapp, chunking, treeshaking, typescript, production minifying etc
- A Rollup plugin to inject the entry files into an `index.html` file
- A Rollup plugin to load style files using the ES6 import syntax
- A Rollup plugin to enables livereload
- A Rollup plugin that minifies the html from files using the `lit-html` library
- A Rollup plugin that helps with copying files
- A Rollup plugin that helps with replacing imports
- A Rollup plugin that helps with compressing files
- A Rollup plugin to uses Workbox to generate a Service Worker
- An extensible `create-karma-config.js` to help with your Karma testing setup
- A `tsconfig.json` file to configure your Typescript
- A `tslint.json` file to configure your linting
- A `typings.d.ts` file you can use as inspiration for your own `typings.d.ts` file
- A `.browserslistrc` file to configure how your files are transpiled
- A `.gitignore` file you can use as inspiration for your own `.gitignore` file

## Step 👆 - Install the dependency

```javascript
npm i @appnest/web-config --save-dev
```

## Step ✌️ - Setup `rollup.config.js`

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
  experimentalCodeSplitting: true,
  treeshake: isProd,
  context: "window"
}
```

## Step 🤟 - Setup `tslint.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tslint.json"
}
```

## Step 🖖 - Setup `tsconfig.json`

```json
{
  "extends": "./node_modules/@appnest/web-config/tsconfig.json"
}
```

## Step 🖐 - Setup `.browserslistrc`

The tools transpiling your code are using `browserslist` to figure out what is supported. Your `.browserslistrc` could look like this.

```
last 2 Chrome versions
last 2 Safari versions
last 2 Firefox versions
```

## Step 🖐👆 - Setup `karma.conf.js`

It is now time to add the testing setup.

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

## Step 🖐✌️ - Add start and build scripts to `package.json`

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

## 🖌 How to load stylesheets

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
     scssGlobals: ["main.scss"]
     ...
    }),
  ...
}
```

### Load a stylesheet as a string

```javascript
import css from "./my-component.scss";
```

## 💥 Rollup plugins

### `rollup-plugin-copy`

Copies files from one path to another.

```javascript
copy({
  resources: [["./src/assets", "./dist/assets"]]
}),

```

### `rollup-plugin-gzip`

Compresses all of the files in the build directory.

```javascript
gzip()
```

### `rollup-plugin-html-template`

Injects script tags with the entry files from the bundle into a html file. In the below example the file that matches the include regex will be included in the resulting html file.

```javascript
htmlTemplate({
  template: "./src/index.html",
  target: "./dist/index.html",
  include: /main(-.*)?\.js$/
})
```

### `rollup-plugin-import-styles`

Makes it possible to import style files using es6 imports. The stylesheets are processed with postcss. In the example below, the `main.scss` file is appended to the document as a stylesheet, where other imports are imported as strings.

```javascript
importStyles({
  plugins: [
    precss(),
    autoprefixer(),
    cssnano()
  ],
  globals: ["main.scss"]
}),
```

### `rollup-plugin-livereload`

Enables livereload when files changes.

```javascript
livereload({
  watch: "./dist"
})
```

### `rollup-plugin-minify-lit-html`

Minifies the html used within the lit-html `html` tagged templates.

```javascript
minifyLitHTML()
```

### `rollup-plugin-replace`

Replaces files.

```javascript
replace({
  resources: [["./src/env.ts", "./src/env.prod.ts"]]
})
```

### `rollup-plugin-workbox`

Creates a service worker.

```javascript
workbox({
  mode: "injectManifest",
  workboxConfig: {
    swSrc: "./src/sw-config.js",
    swDest: './dist/sw.js',
    globDirectory: './dist',
    globPatterns: ["./dist/**/*.{js,css,html,png}"]
  }
})
```

## Future work

Future work involves making the configuration more customizable.

* Document and add tests for the rollup plugins
* Move the rollup plugins to its own packages

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).