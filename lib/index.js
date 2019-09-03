const path = require('path');
const loaderUtils = require('loader-utils');
const Template7 = require('template7');
const acorn = require('acorn');
const escodegen = require('escodegen');
const fs = require('fs');

function generateId(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const length = map.length;
  return mask.replace(/x/g, () => map[Math.floor((Math.random() * length))]);
}

function loader (source) {
  const loaderContext = this;
  const options = loaderUtils.getOptions(loaderContext);
  if (options && options.helpersPath) {
    try {
      const helpers = require(path.resolve(options.helpersPath));
      helpers.forEach((helperName) => {
        Template7.registerHelper(helperName, () => {});
      });
    } catch (e) {}
  }

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

  // Parse external partials.
  let match;
  let partials = [];
  let partialName = '';
  let partialContent = '';

  if (hasTemplate && options && options.partialsPath) {
    try {
      let partialPath = (options.partialsPath.trim() + '/').replace('//', '/');
      let partialExt = options.partialsExt || '.f7p.html';

      const externalPartialRegex = /{{>\s*["']([^"']+)["']\s*}}/gm;

      while ((match = externalPartialRegex.exec(template)) !== null) {
        // Avoid infinite loops with zero-width matches.
        if (match.index === externalPartialRegex.lastIndex) {
          externalPartialRegex.lastIndex++;
        }

        partialName = match[1];

        try {
          let partialFilePath = path.resolve(partialPath + partialName + partialExt);

          if (fs.existsSync(partialFilePath)) {
            var file = fs.readFileSync(partialFilePath, 'utf8');

            this.addDependency(partialFilePath);

            if (file.match(/<template[^>]*>/)) {
              let partialContent = file
                .split(/<template[^>]*>/)
                .filter((item, index) => index > 0)
                .join('<template>')
                .split('</template>')
                .filter((item, index, arr) => index < arr.length - 1)
                .join('</template>')
                .replace(/{{#raw}}([ \n]*)<template/g, '{{#raw}}<template')
                .replace(/\/template>([ \n]*){{\/raw}}/g, '/template>{{/raw}}')
                .replace(/([ \n])<template/g, '$1{{#raw}}<template')
                .replace(/\/template>([ \n])/g, '/template>{{/raw}}$1')
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace(/'/g, "\\'")
                .trim()
              ;

              partials.push(`Template7.registerPartial('${partialName}', '${partialContent}');`);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Parse inline partials.
  const inlinePartialRegex = /<\s*template-partial[^>]*id="([^>]*)"[^>]*>([\s\S]*?)<\s*\/\s*template-partial>/gm;
  while ((match = inlinePartialRegex.exec(source)) !== null) {
    // Avoid infinite loops with zero-width matches.
    if (match.index === inlinePartialRegex.lastIndex) {
      inlinePartialRegex.lastIndex++;
    }
    partialName = match[1];
    partialContent = match[2]
      // Remove newlines.
      .replace(/(\r\n|\n|\r)/gm, "")
      // Escape single quotes.
      .replace(/'/g, "\\'")
      // Trim whitespace
      .trim()
    ;
    partials.push(`Template7.registerPartial('${partialName}', '${partialContent}');`);
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

  let astExtend;
  let isClassComponent = script.indexOf('export default class') >= 0 || script.indexOf('class extends') >= 0;
  let isClassDeclared;
  let isClassExported;
  let astExtendClass = `
    class {{PAGE_COMPONENT_CLASS_NAME}} extends Component {
      render() {
        ${templateType === 't7'
          ? `return (${Template7.compile(template)})(this)`
          : `return \`${template}\``
        }
      }
    }
    {{PAGE_COMPONENT_CLASS_NAME}}.id = '${id}';
    ${style ? `
    {{PAGE_COMPONENT_CLASS_NAME}}.style = \`${style}\`;
    `.trim() : ''}
    {{PAGE_COMPONENT_CLASS_NAME}}.styleScoped = ${styleScoped};
    
    export default {{PAGE_COMPONENT_CLASS_NAME}};
  `;
  const astExtendObj = `
    export default {
      id: '${id}',
      ${templateType === 't7'
        ? `render() { return (${Template7.compile(template)})(this)},`
        : `render() {return \`${template}\`},`
      }
      ${style ? `style: \`${style}\`,` : ''}
      styleScoped: ${styleScoped},
    }
  `;

  const ast = acorn.parse(script, {sourceType: 'module'});
  
  ast.body.forEach((node, index) => {
    if (node.type === 'ClassDeclaration' && node.superClass) {
      if (isClassExported) return;
      isClassComponent = true;
      isClassDeclared = true;
      astExtendClass = astExtendClass
        .replace('export default {{PAGE_COMPONENT_CLASS_NAME}};', '')
        .replace(/{{PAGE_COMPONENT_CLASS_NAME}}/g, node.id.name);
      astExtend = acorn.parse(astExtendClass, {sourceType: 'module'});
      node.body.body.push(...astExtend.body[0].body.body);
      astExtend.body.splice(0, 1); // remove fist declaration
      ast.body.splice(index + 1, 0, ...astExtend.body) // insert component static props
    }
    if (node.type === 'ExportDefaultDeclaration') {
      if (isClassComponent) {
        if (isClassDeclared) return;
        isClassExported = true;
        astExtendClass = astExtendClass
          .replace(/{{PAGE_COMPONENT_CLASS_NAME}}/g, 'F7PageComponent');
        astExtend = acorn.parse(astExtendClass, {sourceType: 'module'});
        
        if (node.declaration.type === 'ClassDeclaration') {
          astExtend.body[0].superClass = node.declaration.superClass;
          astExtend.body[0].body.body.push(...node.declaration.body.body);

          ast.body.splice(index, 1);
          ast.body.push(...astExtend.body);
        }
      } else {
        astExtend = acorn.parse(astExtendObj, {sourceType: 'module'});
        node.declaration.properties.push(...astExtend.body[0].declaration.properties);
      }
    }
  });
  let code = escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
      compact: false,
    },
  });

  if (templateType === 't7' && code.indexOf('Template7Helpers') >= 0) {
    code = `
      import Template7 from 'template7';
      const Template7Helpers = Template7.helpers;
  
      ${partials.join('\n')}
  
      ${code}
    `;
  }
  return `${code}`;
}
module.exports = loader;