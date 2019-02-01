# rollup-plugin-import-styles

A Rollup plugin that makes it possible to import style files using postcss. Works with "import css from 'styles.scss'" and "import 'styles.scss'" syntax as default.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`` | `` |  | ``
`` | `` |  | ``
`` | `` |  | ``
`include` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to include. | `[]`
`exclude` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to exclude. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {} from "@appnest/web-config";

export default {
  entry: 'src/index.js'
  output: {
    dest: 'dist/bundle.js'
  },
  plugins: [
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
