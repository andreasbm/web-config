# rollup-plugin-clean

A Rollup plugin that clean directories before rebuilding.

## Usage

### Example

```js
import {clean} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/index.js"
  },
  plugins: [
    clean({
      targets: [
        "dist"
      ]
    })
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
