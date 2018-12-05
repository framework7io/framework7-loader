const path = require('path')
const loaderUtils = require('loader-utils')
const Template7 = require('template7');
const acorn = require('acorn');
const escodegen = require('escodegen');

function generateId(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const length = map.length;
  return mask.replace(/x/g, () => map[Math.floor((Math.random() * length))]);
}

function loader (source) {
  const loaderContext = this

  const id = generateId();

  let template;
  const hasTemplate = source.match(/<template([ ]?)([a-z0-9-]*)>/);
  const templateType = hasTemplate[2] || 't7';
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
  }

  // Parse Styles
  let style = null;
  let styleScoped = false;

  if (source.indexOf('<style>') >= 0) {
    style = source.split('<style>')[1].split('</style>')[0];
  } else if (source.indexOf('<style scoped>') >= 0) {
    styleScoped = true;
    style = source.split('<style scoped>')[1].split('</style>')[0];
    style = style.split('\n').map((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.indexOf('@') === 0) return line;
      if (line.indexOf('{') >= 0) {
        if (line.indexOf('{{this}}') >= 0) {
          return line.replace('{{this}}', `[data-f7-${id}]`);
        }
        return `[data-f7-${id}] ${line.trim()}`;
      }
      return line;
    }).join('\n');
  }

  // Parse Script
  let script;
  if (source.indexOf('<script>') >= 0) {
    const scripts = source.split('<script>');
    script = scripts[scripts.length - 1].split('</script>')[0].trim();
  } else {
    script = 'export default {}';
  }
  if (!script || !script.trim()) script = 'export default {}';

  if (!template) {
    return script;
  }

  const astExtend = acorn.parse(`
    export default {
      id: '${id}',
      ${templateType === 't7'
        ? `template: \`${template}\`,`
        : `render() {return \`${template}\`},`
      }
      styleScoped: ${styleScoped},
    }
  `, {sourceType: 'module'});

  const ast = acorn.parse(script, {sourceType: 'module'});

  ast.body.forEach((node) => {
    if (node.type === 'ExportDefaultDeclaration') {
      node.declaration.properties.push(...astExtend.body[0].declaration.properties);
    }
  });
  const code = escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
      compact: false,
    },
  });

  return `${code}`;
}
module.exports = loader;