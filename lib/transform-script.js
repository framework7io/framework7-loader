const babel = require('@babel/core');

function transformToAst(code) {
  const { ast } = babel.transformSync(code, {
    ast: true,
  });
  return ast;
}

function transformFromAst(ast) {
  const { code } = babel.transformFromAst(ast, '', {});
  return code;
}

module.exports = ({ script, template, id, style, styleScoped }) => {
  let astExtend;
  const astExtendFunction = `
    function {{COMPONENT_NAME}}(props, ctx) {
      
    }
    {{COMPONENT_NAME}}.id = '${id}';
    ${
      style
        ? `
    {{COMPONENT_NAME}}.style = \`${style}\`;
    `.trim()
        : ''
    }
    {{COMPONENT_NAME}}.styleScoped = ${styleScoped};
    
    export default {{COMPONENT_NAME}};
  `;

  const ast = transformToAst(
    `/** @jsx $jsx */\nimport { $jsx } from 'framework7';\n${script}`,
  );

  ast.program.body.forEach((node, index) => {
    if (node.type === 'ExportDefaultDeclaration') {
      if (
        node.declaration &&
        (node.declaration.type === 'ArrowFunctionExpression' ||
          node.declaration.type === 'FunctionDeclaration')
      ) {
        astExtend = transformToAst(
          astExtendFunction.replace(
            /{{COMPONENT_NAME}}/g,
            'framework7Component',
          ),
        );
        astExtend.program.body[0].params = node.declaration.params;
        astExtend.program.body[0].body = node.declaration.body;
        ast.program.body.splice(index, 1, ...astExtend.program.body);
      }
    }
  });

  const code = transformFromAst(ast).replace(
    '$render',
    `function ($$ctx) {
      var $ = $$ctx.$$;
      var $h = $$ctx.$h;
      var $root = $$ctx.$root;
      var $f7 = $$ctx.$f7;
      var $f7route = $$ctx.$f7route;
      var $f7router = $$ctx.$f7router;
      var $theme = $$ctx.$theme;
      var $update = $$ctx.$update;
      var $store = $$ctx.$store;

      return $h\`${template}\`
    }
    `,
  );

  return code;
};
