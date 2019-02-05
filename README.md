# Framework7 Component Loader

> Webpack loader for Framework7 single file router components

## What is Framework7 Component Loader?

`framework7-component-loader` is a loader for [webpack](https://webpack.js.org/) that allows you to author [Framework7 Router components](http://framework7.io/docs/router-component.html) in a format called [Single-File Components](http://framework7.io/docs/router-component.html#single-file-component):

```html
<!-- my-page.f7.html -->
<template>
  <div class="page">{{msg}}</div>
  <!-- Inline partials -->
  {{> 'foo'}}
  {{> 'bar'}}
  <!-- External partials -->
  {{> 'external'}}
</template>

<!-- Template7 inline partial support (optional) -->
<template-partial id="foo">
  <div>foo</div>
</template-partial>
<template-partial id="bar">
  <div>bar</div>
</template-partial>

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
#### External partial templates example (see config for location)
```html
<!-- external.f7p.html -->
<template>
  <div>External template get scope context {{msg}}</div>
</template>
```

## Installation

```
npm i framework7-component-loader
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
          {
            loader: 'framework7-component-loader',
            options: {
              helpersPath: './src/template7-helpers-list.js',
              partialsPath: './src/pages/',
              partialsExt: '.f7p.html'
            }
          }
        ],
      },

      ...
    ]
  }
  ...
}
```

## Framework7 Webpack Template

There is already ready to use [Framework7 Webpack Template](https://github.com/framework7io/framework7-template-webpack) pre-configured with `framework7-component-loader`