# Framework7 Component Loader

> Webpack loader for Framework7 single file router components

## What is Framework7 Component Loader?

`framework7-component-loader` is a loader for [webpack](https://webpack.js.org/) that allows you to author [Framework7 Router components](http://framework7.io/docs/router-component.html) in a format called [Single-File Components](http://framework7.io/docs/router-component.html#single-file-component):

```html
<!-- my-page.f7.html -->
<template>
  <div class="page">{{msg}}</div>
  <!-- Inline partials -->
  {{> 'foo'}} {{> 'bar'}}
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
    data() {
      return {
        msg: 'Hello world!',
      };
    },
  };
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
              // path to file that exports array of Template7 helpers names
              helpersPath: './src/template7-helpers-list.js',
              // path where to look for Template7 partials
              partialsPath: './src/pages/',
              // Template7 partials file extension
              partialsExt: '.f7p.html',
              // When enabled it will minify templates HTML content
              minifyTemplate: true,
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

## Template7 Helpers

To use Template7 helpers, we need to specify helpers names in separate file and specify path to file in `helpersPath` loader parameter. It is required because template is compiled on server side which doesn't know about helpers registered during app runtime.

So, if we use helpers named `foo` and `bar` in our templates, we need to register their names in file:

```js
/* src/template7-helpers-list.js */
module.exports = ['foo', 'bar'];
```

And specify this file in loader options:

```js
  rules: [
    ...
    {
      test: /\.f7.html$/,
      use: [
        'babel-loader',
        {
          loader: 'framework7-component-loader',
          options: {
            // path to file that exports array of Template7 helpers names
            helpersPath: './src/template7-helpers-list.js',
            // ...
          }
        }
      ],
    },
    ...
  ]
```
