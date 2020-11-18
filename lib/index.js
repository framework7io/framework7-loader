const getTemplate = require('./get-template');
const getStyle = require('./get-style');
const getScript = require('./get-script');

function generateId(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const length = map.length;
  return mask.replace(/x/g, () => map[Math.floor(Math.random() * length)]);
}

function loader(source) {
  const id = generateId();
  const isJSComponent =
    this && this.resourcePath && this.resourcePath.indexOf('.f7.js') > 0;

  const { template } = getTemplate({ source });

  // Parse Styles
  const { style } = getStyle({ id, source });

  // Parse Script
  const script = getScript({
    id,
    source,
    template,
    style,
    isJSComponent,
  });

  return script;
}
module.exports = loader;
