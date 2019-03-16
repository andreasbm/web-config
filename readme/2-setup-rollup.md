## Step 2 - Setup `rollup.config.js`

Here's an example on what your Rollup configuration file could look like:

```javascript
import {resolve, join} from "path";
import pkg from "./package.json";
import {
  defaultExternals,
  defaultOutputConfig,
  defaultPlugins,
  defaultProdPlugins,
  defaultServePlugins,
  isLibrary,
  isProd,
  isServe
} from "@appnest/web-config";

const folders = {
  dist: resolve(__dirname, "dist"),
  src: resolve(__dirname, "src/demo"),
  src_assets: resolve(__dirname, "src/demo/assets"),
  dist_assets: resolve(__dirname, "dist/assets")
};

const files = {
  main: join(folders.src, "main.ts"),
  src_index: join(folders.src, "index.html"),
  dist_index: join(folders.dist, "index.html")
};

export default {
  input: {
    main: files.main
  },
  output: [
    defaultOutputConfig({
      dir: folders.dist,
      format: "esm"
    })
  ],
  plugins: [
    ...defaultPlugins({
      copyConfig: {
        resources: [[folders.src_assets, folders.dist_assets]],
      },
      cleanerConfig: {
        targets: [
          folders.dist
        ]
      },
      htmlTemplateConfig: {
        template: files.src_index,
        target: files.dist_index,
        include: /main(-.*)?\.js$/
      },
      importStylesConfig: {
        globals: ["main.scss"]
      }
    }),

    // Serve
    ...(isServe ? [
        ...defaultServePlugins({
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
  treeshake: isProd,
  context: "window"
}
```
