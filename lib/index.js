const getTemplate = require('./get-template');
const getStyle = require('./get-style');
const getScript = require('./get-script');

function generateId(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const length = map.length;
  return mask.replace(/x/g, () => map[Math.floor(Math.random() * length)]);
}

function loader(source) {
  const id = generateId();

  const { template } = getTemplate({ source });

  // Parse Styles
  const { style, styleScoped } = getStyle({ id, source });

  // Parse Script
  const script = getScript({
    id,
    source,
    template,
    style,
    styleScoped,
  });

  return script;
}
module.exports = loader;
