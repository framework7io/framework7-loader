const transformScript = require('./transform-script');

module.exports = ({ id, source, template, style, styleScoped }) => {
  // Parse Script
  let script;
  if (source.indexOf('<script>') >= 0) {
    const scripts = source.split('<script>');
    script = scripts[scripts.length - 1].split('</script>')[0].trim();
  } else {
    script = 'export default () => { return $render }';
  }
  if (!script || !script.trim()) script = 'export default { return $render }';

  const code = transformScript({
    id,
    script,
    template,
    style,
    styleScoped,
  });
  return code;
};
