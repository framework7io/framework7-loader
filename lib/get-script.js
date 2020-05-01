const transformScript = require('./transform-script');

module.exports = ({
  id,
  source,
  template,
  templateType,
  style,
  styleScoped,
  partials,
}) => {
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

  const code = transformScript({
    id,
    script,
    template,
    templateType,
    style,
    styleScoped,
    partials,
  });
  return code;
};
