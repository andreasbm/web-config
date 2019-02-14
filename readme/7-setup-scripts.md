Here an example on what scripts you could add to your `package.json` file.

```
{
  ...
  scripts: {
    "b:dev": "rollup -c --environment NODE_ENV:dev",
    "b:prod": "rollup -c --environment NODE_ENV:prod",
    "s:dev": "rollup -c --watch --environment NODE_ENV:dev",
    "s:prod": "rollup -c --watch --environment NODE_ENV:prod",
    "s": "npm run s:dev"
    ...
  }
  ...
}
```
