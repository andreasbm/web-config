# rollup-plugin-import-styles

A Rollup plugin that makes it possible to import style files using postcss. Works with "import css from 'styles.scss'" and "import 'styles.scss'" syntax as default.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`plugins` | `Postcss plugins` | Postcss plugins used in the transpiling into CSS. | `[]`
`extensions` | `String[]` | File extensions that the plugin includes. | `[".css", ".scss"]`
`globals` | `String[]` | Name of the files that should be injected into the global scope. | `[]`
`postcssConfig` | [`Postcss config`](https://github.com/postcss/postcss) | Postcss configuration object | `{}`
`sassConfig` | (`SASS config`)[https://github.com/sass/node-sass] | SASS configuration object | `{}`
`transform` | `((id, isGlobal) => css => string)` | A function that returns another function that transform the CSS | `transformImport`
`include` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to include. | `[]`
`exclude` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to exclude. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {importStyles} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/bundle.js"
  },
  plugins: [
    importStyles({
      globals: ["main.scss"]
    })
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
