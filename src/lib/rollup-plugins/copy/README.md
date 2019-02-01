# rollup-plugin-copy

A Rollup plugin that copies resources from one location to another.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`resources` | `String[][]` | A double array of resources of what folders/files should be copied and where they should be copied. The array `[["src/assets", "dist/assets"]]` would copy the assets folder from the src folder to the dist folder. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`
`overwrite` | `Boolean` | Determines whether the copying of resources should overwrite existing files at the final location. | `true`

### Example

```js
import {copy} from "@appnest/web-config";

export default {
  entry: 'src/index.js'
  output: {
    dest: 'dist/bundle.js'
  },
  plugins: [
    copy({
      resources: [
        ["src/assets", "dist/assets"],
        ["src/index.html", "dist/index.html"]
      ]
    })
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
