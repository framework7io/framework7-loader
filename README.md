# Framework7 Component Loader

> Webpack loader for Framework7 single file router components

## What is Framework7 Component Loader?

`framework7-component-loader` is a loader for [webpack](https://webpack.js.org/) that allows you to author [Framework7 Router components](http://framework7.io/docs/router-component.html) in a format called [Single-File Components](http://framework7.io/docs/router-component.html#single-file-component):

```html
<!-- my-page.f7.html -->
<template>
  <div class="page">{{msg}}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>
```

## Installation

```
npm i framework7-component-loader
```

## Configuration

```
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.f7.html$/,
        use: ['babel-loader', 'framework7-component-loader'],
      },
      ...
    ]
  }
  ...
}
```

## Framework7 Webpack Template

There is already ready to use [Framework7 Webpack Template](https://github.com/framework7io/framework7-template-webpack) pre-configured with `framework7-component-loader`