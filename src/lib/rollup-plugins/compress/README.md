# rollup-plugin-compress

A Rollup plugin that compresses the files in the bundle after building.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`compressors` | `(({src, verbose, options}) => void)[]` | An array of functions that compresses the included files. | `[compressGzip, compressBrotli]`
`include` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to include. | `[]`
`exclude` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to exclude. | `[]`
`timeout` | `Number` | Timeout in ms that specifies the amount of time we wait until all of the files has been bundle after building. | `2000`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`
`` | `` |  | ``
`` | `` |  | ``
`` | `` |  | ``

### Example

```js
import {compress} from "@appnest/web-config";

export default {
  entry: 'src/index.js'
  output: {
    dest: 'dist/bundle.js'
  },
  plugins: [
    compress()
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
