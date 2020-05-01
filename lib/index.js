const path = require('path');
const loaderUtils = require('loader-utils');
const Template7 = require('template7');

const getTemplate = require('./get-template');
const getStyle = require('./get-style');
const getScript = require('./get-script');
const getPartials = require('./get-partials');

function generateId(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const length = map.length;
  return mask.replace(/x/g, () => map[Math.floor(Math.random() * length)]);
}

function loader(source) {
  const loaderContext = this;
  const options = loaderUtils.getOptions(loaderContext);
  if (options && options.helpersPath) {
    try {
      // eslint-disable-next-line
      const helpers = require(path.resolve(options.helpersPath));
      helpers.forEach((helperName) => {
        Template7.registerHelper(helperName, () => {});
      });
    } catch (e) {
      // error
    }
  }

  const id = generateId();

  const { template, templateType } = getTemplate({ source });

  // Parse external partials.
  const { partials } = getPartials({
    source,
    template,
    options,
  });

  // Parse Styles
  const { style, styleScoped } = getStyle({ id, source });

  // Parse Script
  const script = getScript({
    id,
    source,
    template,
    templateType,
    style,
    styleScoped,
    partials,
  });

  return script;
}
module.exports = loader;
