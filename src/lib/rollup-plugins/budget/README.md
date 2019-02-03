# rollup-plugin-budget

A Rollup plugin that compares the sizes of the files to a specified budget.

<img src="https://raw.githubusercontent.com/andreasbm/web-config/master/src/lib/rollup-plugins/budget/example.png" width="300">

## Usage

### Configuration

Option   |   Type        |    Description     |    Default
---------| --------------| ------------------ | ---------------------------------
`sizes` | `{[key: String / RegExp]: Number}` | A map mapping each extension or regex to a size in bytes (eg. sizes: { ".js": 1024 * 170, "cat.jpg": 1024 * 400}) | `{}`
`render` | `(({gzippedSize, max, name}) => String)` | A function that takes the information about the budget status for a file and returns a string which is printed to the console. | `defaultRender`
`fileName` | `String` | The name of the output file where the budget for the files is printed to. | `budget.txt`
`silent` | `Boolean` | Whether or not the budget for the files should be printed to the console. | `true`
`reportThreshold` | `Number` | The threshold of what files should be ignored. Every percentage below the threshold is ignored. | `0`
`timeout` | `Number` | Timeout in ms that specifies the amount of time we wait until all of the files has been bundled after building. | `2000`

### Example

```js
import {budget} from "@appnest/web-config";

export default {
  entry: "src/index.js"
  output: {
    dest: "dist/bundle.js"
  },
  plugins: [
    budget({
      sizes: {
        ".js": 1024 * 170, // Max file size in bytes (170kb)
        "cat.jpg": 1024 * 400
      }
    })
  ]
};
```

## How to set up your budget

Your budget depends on your goals so it varies from app to app what the budget should be. Check out [this neat tool](http://www.performancebudget.io/) to get an idea of what your budget could be.

## How to stay under budget

The sooner you think about your performance budget, the better. This plugin is only meant to focus on the **quantity-based metrics** but keep in mind that there also exists other types of budgets such as **rule-based metrics** (eg. lighthouse) and **milestone timings** (eg. FCP & TTI). Below are some ideas on how you can stay inside your budget.

<img src="https://raw.githubusercontent.com/andreasbm/web-config/master/src/lib/rollup-plugins/budget/guide.png" width="500">

If you are interested in learning more you can check out [this brilliant article](https://web.dev/fast/performance-budgets-101).

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
