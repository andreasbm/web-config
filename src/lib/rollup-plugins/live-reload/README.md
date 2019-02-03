# rollup-plugin-live-reload

A Rollup plugin that live reload files as they changes.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`watch` | `String` | The folder the plugin watches | `"dist"`
`port` | `Number` | The port the server attaches to | `35729`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {livereload} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/index.js"
  },
  plugins: [
    livereload()
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
