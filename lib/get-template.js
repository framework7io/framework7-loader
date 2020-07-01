const minify = require('html-minifier').minify;

module.exports = ({ source, options }) => {
  let template = null;
  const hasTemplate = source.match(/<template([ ]?)([a-z0-9-]*)>/);
  const templateType = hasTemplate[2] || 't7';
  const minifyTemplate = !options || options.minifyTemplate !== false;
  if (hasTemplate) {
    template = source
      .split(/<template[ ]?[a-z0-9-]*>/)
      .filter((item, index) => index > 0)
      .join('<template>')
      .split('</template>')
      .filter((item, index, arr) => index < arr.length - 1)
      .join('</template>')
      .replace(/{{#raw}}([ \n]*)<template/g, '{{#raw}}<template')
      .replace(/\/template>([ \n]*){{\/raw}}/g, '/template>{{/raw}}')
      .replace(/([ \n])<template/g, '$1{{#raw}}<template')
      .replace(/\/template>([ \n])/g, '/template>{{/raw}}$1');
    const originalTemplate = template;
    if (minifyTemplate) {
      try {
        template = minify(template, {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
        });
      } catch (err) {
        template = originalTemplate;
      }
    }
  }
  return {
    template,
    templateType,
  };
};
