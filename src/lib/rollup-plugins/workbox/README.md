# rollup-plugin-workbox

A Rollup plugin that uses workbox to generate a service worker.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`mode` | `"injectManifest" | "generateSW"` | The generateSW mode creates a service worker file for you, and writes it out to disk. The injectManifest mode will generate a list of URLs to precache, and add that precache manifest to an existing service worker file. It will otherwise leave the file as-is. Read more [here](https://developers.google.com/web/tools/workbox/modules/workbox-build)  | `"generateSW"`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {workbox} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/index.js"
  },
  plugins: [
    workbox()
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
