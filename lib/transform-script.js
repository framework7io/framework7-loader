const babel = require('@babel/core');
const Template7 = require('template7');

function transformToAst(code) {
  const { ast } = babel.transformSync(code, {
    ast: true,
    babelrc: false,
    configFile: false,
  });
  return ast;
}

function transformFromAst(ast) {
  const { code } = babel.transformFromAst(ast, '', {
    babelrc: false,
    configFile: false,
  });
  return code;
}

module.exports = ({
  script,
  template,
  templateType,
  id,
  style,
  styleScoped,
  partials,
}) => {
  let astExtend;
  let isClassComponent =
    script.indexOf('export default class') >= 0 ||
    script.indexOf('class extends') >= 0;
  let isClassDeclared;
  let isClassExported;
  let astExtendClass = `
    class {{PAGE_COMPONENT_CLASS_NAME}} extends Component {
      render() {
        ${
          templateType === 't7'
            ? `return (${Template7.compile(template)})(this)`
            : `return \`${template}\``
        }
      }
    }
    {{PAGE_COMPONENT_CLASS_NAME}}.id = '${id}';
    ${
      style
        ? `
    {{PAGE_COMPONENT_CLASS_NAME}}.style = \`${style}\`;
    `.trim()
        : ''
    }
    {{PAGE_COMPONENT_CLASS_NAME}}.styleScoped = ${styleScoped};
    
    export default {{PAGE_COMPONENT_CLASS_NAME}};
  `;
  const astExtendObj = `
    export default {
      id: '${id}',
      ${
        templateType === 't7'
          ? `render() { return (${Template7.compile(template)})(this)},`
          : `render() {return \`${template}\`},`
      }
      ${style ? `style: \`${style}\`,` : ''}
      styleScoped: ${styleScoped},
    }
  `;

  const ast = transformToAst(script);

  ast.program.body.forEach((node, index) => {
    if (node.type === 'ClassDeclaration' && node.superClass) {
      if (isClassExported) return;
      isClassComponent = true;
      isClassDeclared = true;
      astExtendClass = astExtendClass
        .replace('export default {{PAGE_COMPONENT_CLASS_NAME}};', '')
        .replace(/{{PAGE_COMPONENT_CLASS_NAME}}/g, node.id.name);
      astExtend = transformToAst(astExtendClass);
      node.body.body.push(...astExtend.program.body[0].body.body);
      astExtend.program.body.splice(0, 1); // remove fist declaration
      ast.program.body.splice(index + 1, 0, ...astExtend.program.body); // insert component static props
    }
    if (node.type === 'ExportDefaultDeclaration') {
      if (isClassComponent) {
        if (isClassDeclared) return;
        isClassExported = true;
        astExtendClass = astExtendClass.replace(
          /{{PAGE_COMPONENT_CLASS_NAME}}/g,
          'F7PageComponent',
        );
        astExtend = transformToAst(astExtendClass);

        if (node.declaration.type === 'ClassDeclaration') {
          astExtend.program.body[0].superClass = node.declaration.superClass;
          astExtend.program.body[0].body.body.push(
            ...node.declaration.body.body,
          );

          ast.program.body.splice(index, 1);
          ast.program.body.push(...astExtend.program.body);
        }
      } else {
        astExtend = transformToAst(astExtendObj);
        node.declaration.properties.push(
          ...astExtend.program.body[0].declaration.properties,
        );
      }
    }
  });

  let code = transformFromAst(ast);

  if (templateType === 't7' && code.indexOf('Template7Helpers') >= 0) {
    code = `
      import Template7 from 'template7';
      const Template7Helpers = Template7.helpers;
  
      ${partials.join('\n')}
  
      ${code}
    `;
  }

  return code;
};
