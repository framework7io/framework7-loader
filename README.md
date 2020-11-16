# Framework7 Component Loader

> Webpack loader for Framework7 single file components

## What is Framework7 Component Loader?

`framework7-loader` is a loader for [webpack](https://webpack.js.org/) that allows you to author [Framework7 Router components](http://framework7.io/docs/router-component.html) in a format called [Single-File Components](http://framework7.io/docs/router-component.html#single-file-component):

```html
<!-- my-page.f7.html -->
<template>
  <div class="page">${msg}</div>
</template>

<script>
  export default () => {
    const msg = 'Hello world';

    return $render;
  };
</script>
```

## Installation

```
npm i framework7-loader
```

## Configuration

```js
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.f7.html$/,
        use: [
          'babel-loader',
          'framework7-loader',
        ],
      },

      ...
    ]
  }
  ...
}
```

## JSX

Framework7 v6 single file components also support JSX:

```html
<!-- my-page.f7.html -->
<script>
  export default () => {
    const msg = 'Hello world';

    return () => <div class="page">{msg}</div>;
  };
</script>
```

```js
// my-page.f7.js

export default () => {
  const msg = 'Hello world';

  return () => <div class="page">{msg}</div>;
};
```
