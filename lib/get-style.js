module.exports = ({ id, source }) => {
  let style = null;
  let styleScoped = false;

  if (source.indexOf('<style>') >= 0) {
    style = source.split('<style>')[1].split('</style>')[0];
  } else if (source.indexOf('<style scoped>') >= 0) {
    styleScoped = true;
    style = source.split('<style scoped>')[1].split('</style>')[0];
    style = style
      .replace(/{{this}}/g, `[data-f7-${id}]`)
      .replace(/[\n]?([^{^}]*){/gi, (string, rules) => {
        if (rules.indexOf('"') >= 0 || rules.indexOf("'") >= 0) return string;
        // eslint-disable-next-line
        rules = rules
          .split(',')
          .map((rule) => {
            if (rule.indexOf('@') >= 0) return rule;
            if (rule.indexOf(`[data-f7-${id}]`) >= 0) return rule;
            return `[data-f7-${id}] ${rule.trim()}`;
          })
          .join(', ');

        return `\n${rules} {`;
      });
  }
  return {
    style,
    styleScoped,
  };
};
