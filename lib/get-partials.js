const fs = require('fs');
const path = require('path');

module.exports = ({ source, template, options }) => {
  let match;
  const partials = [];
  let partialName = '';
  let partialContent = '';
  if (template !== null && options && options.partialsPath) {
    try {
      const partialPath = (options.partialsPath.trim() + '/').replace(
        '//',
        '/',
      );
      const partialExt = options.partialsExt || '.f7p.html';

      const externalPartialRegex = /{{>\s*["']([^"']+)["']\s*}}/gm;

      while ((match = externalPartialRegex.exec(template)) !== null) {
        // Avoid infinite loops with zero-width matches.
        if (match.index === externalPartialRegex.lastIndex) {
          externalPartialRegex.lastIndex += 1;
        }

        partialName = match[1];

        try {
          const partialFilePath = path.resolve(
            partialPath + partialName + partialExt,
          );

          if (fs.existsSync(partialFilePath)) {
            const file = fs.readFileSync(partialFilePath, 'utf8');

            this.addDependency(partialFilePath);

            if (file.match(/<template[^>]*>/)) {
              partialContent = file
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
                .replace(/(\r\n|\n|\r)/gm, '')
                .replace(/'/g, "\\'")
                .trim();
              partials.push(
                `Template7.registerPartial('${partialName}', '${partialContent}');`,
              );
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Parse inline partials.
  const inlinePartialRegex = /<\s*template-partial[^>]*id="([^>]*)"[^>]*>([\s\S]*?)<\s*\/\s*template-partial>/gm;
  while ((match = inlinePartialRegex.exec(source)) !== null) {
    // Avoid infinite loops with zero-width matches.
    if (match.index === inlinePartialRegex.lastIndex) {
      inlinePartialRegex.lastIndex += 1;
    }
    partialName = match[1];
    partialContent = match[2]
      // Remove newlines.
      .replace(/(\r\n|\n|\r)/gm, '')
      // Escape single quotes.
      .replace(/'/g, "\\'")
      // Trim whitespace
      .trim();
    partials.push(
      `Template7.registerPartial('${partialName}', '${partialContent}');`,
    );
  }

  return { partials };
};
