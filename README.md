# @appnest/web-config

## 🤔 What is this?

This is an opinionated simple configuration I sometimes use when getting started with new web applications (usually using the lit-html/lit-element library). I wanted to share it, maybe it can give you some inspiration. It contains the following:

- An extensible `create-rollup-config.js` for using Rollup with SCSS, single-page webapp, chunking, treeshaking, typescript, production minifying etc.
- A Rollup plugin to inject the entry files into an `index.html` file.
- A Rollup plugin to load style files using the ES6 import syntax.
- A Rollup plugin that minifies the html from files using the `lit-html` library.
- A `tsconfig.json` file to configure your Typescript
- A `tslint.json` file to configure your linting
- A `babel.config.js` file to configure how the Javascript is transpiled
- A `typings.d.ts` file you can use as inspiration for your own `typings.d.ts` file
- A `.gitignore` file you can use as inspiration for your own `.gitignore` file
- A `.browserslistrc` you can use as inspiration for your own `.browserslistrc` file

## 🎉 Step 1 - Install the dependency

```javascript
npm i @appnest/web-config --save-dev
```

## 💪 Step 2 - Setup `rollup.config.js`

Here's an example on what your Rollup configuration file could look like:

```javascript
import {builtinModules} from "module";
import path from "path";
import {isProd, isServe, isLibrary, defaultOutputConfig, defaultPlugins, defaultServePlugins, defaultProdPlugins, defaultExternals} from "@appnest/web-config";

const folders = {
 dist: path.resolve(__dirname, "dist"),
 src: path.resolve(__dirname, "src"),
 src_assets: path.resolve(__dirname, "src/assets"),
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
   format: "esm",
   dist: folders.dist
  })
 ],
 plugins: [
  ...defaultPlugins({
   dist: folders.dist,
   scssGlobals: ["main.scss"],
   resources: [[folders.src_assets, folders.dist_assets]],
   htmlTemplateConfig: {
    template: files.src_index,
    target: files.dist_index,
    include: /main-.*\.js$/
   }
  }),

  // Serve
  ...(isServe ? [
   ...defaultServePlugins({
    port: 1338,
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
 external: [
  ...(isLibrary ? [
   ...defaultExternals()
  ] : [])
 ],
 experimentalCodeSplitting: true,
 treeshake: isProd,
 context: "window"
}
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

## 👊 Step 5 - Setup `babel.config.js`

```javascript
import {defaultBabelConfig} from "@appnest/web-config";
export default defaultBabelConfig();
```

## ✌️ Step 6 - Setup `.browserslistrc`

Add a `.browserslistrc` file to tell the Rollup plugins how the js/css should be transpiled.

```
last 1 version
> 1%
not dead
```

## 🖌 How to load stylesheets

### Add the following to your `typings.d.ts` file!

This is to make Typescript not complaining about SCSS and CSS imports

```
declare module "*.scss" {
 const content: string;
 export default content;
}

declare module "*.css" {
 const content: string;
 export default content;
}
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

## Future work

Future work involves making the configuration more customizable.

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).