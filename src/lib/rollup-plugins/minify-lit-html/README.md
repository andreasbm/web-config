# rollup-plugin-minify-lit-html

A Rollup plugin that minifies lit-html templates (minifies everything inside html`...`).

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`esprima` | `Esprima config` | See [esprima](https://www.npmjs.com/package/esprima) for more information. | `..`
`htmlMinifier` | `html-minifier config` | See [html-minifier](https://www.npmjs.com/package/html-minifier) for more information. | `..`
`include` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to include. | `[/\.js$/, /\.ts$/]`
`exclude` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to exclude. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {minifyLitHTML} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/bundle.js"
  },
  plugins: [
    minifyLitHTML()
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
