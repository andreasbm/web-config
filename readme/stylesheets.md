### Add the following to your `typings.d.ts` file!

This is to make Typescript not complaining about SCSS, CSS and JSON imports.

```typescript
/// <reference path="node_modules/@appnest/web-config/typings.d.ts" />
```

### Load a global stylesheet (it will be added to the template file)

**Step 1:** Import your stylesheet using the ES6 import syntax

```javascript
import "./main.scss";
```

**Step 2:** Include the name of the stylesheet in your Rollup config

```javascript
export default {
  ...
    defaultPlugins({
       ...
       importStylesConfig: {
         globals: ["main.scss"]
       },
       ...
    }),
  ...
}
```

### Load a stylesheet as a string

```javascript
import css from "./my-component.scss";
```
