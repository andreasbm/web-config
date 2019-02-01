# rollup-plugin-replace

A Rollup plugin that replaces an import with another import.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`resources` | `String[][]` | A double array of resources of what imports should be changed. The array `[["env/environment.ts", "env/environment.dev.ts"]]` would make sure that the file `env/environment.dev.ts` is imported instead of `env/environment.ts`. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {replace} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/bundle.js"
  },
  plugins: [
    replace({
      resources: [
        [path.resolve(__dirname, "src/env.ts"), path.resolve(__dirname, "src/env.prod.ts")]
      ]
    }),
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
