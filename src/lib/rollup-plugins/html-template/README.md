# rollup-plugin-html-template

A Rollup plugin that injects the bundle entry points into a HTML file.

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`template` | `String` | Source of the HTML template file the scripts are injected into. This HTML file needs to contain a body tag. | `null`
`target` | `String` | Target destination for the generated file. | `null`
`transform` | `(({template, bodyCloseTagIndex, fileNames, scriptType}) => string)` | Transform function that injects a script tag into the HTML template file. | `transformTemplate`
`scriptType` | `String` | The type of the script tag (eg. 'text/javascript' or 'module') | `module`
`include` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to include. | `[]`
`exclude` | `Pattern` | Minimatch pattern, or an array of minimatch patterns of files to exclude. | `[]`
`verbose` | `Boolean` | Disables or enables logging output to the console. | `true`

### Example

```js
import {htmlTemplate} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/bundle.js"
  },
  plugins: [
    htmlTemplate({
      template: "src/index.html",
      target: "dist/index.html",
      include: /main.js$/
    })
  ]
};
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
