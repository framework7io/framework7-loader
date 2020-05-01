module.exports = ({ id, source }) => {
  let style = null;
  let styleScoped = false;

  if (source.indexOf('<style>') >= 0) {
    style = source.split('<style>')[1].split('</style>')[0];
  } else if (source.indexOf('<style scoped>') >= 0) {
    styleScoped = true;
    style = source.split('<style scoped>')[1].split('</style>')[0];
    style = style
      .split('\n')
      .map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.indexOf('@') === 0) return line;
        if (line.indexOf('{') >= 0) {
          if (line.indexOf('{{this}}') >= 0) {
            return line.replace('{{this}}', `[data-f7-${id}]`);
          }
          return `[data-f7-${id}] ${line.trim()}`;
        }
        return line;
      })
      .join('\n');
  }
  return {
    style,
    styleScoped,
  };
};
