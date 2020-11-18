module.exports = ({ source }) => {
  let style = null;

  if (source.indexOf('<style>') >= 0) {
    style = source.split('<style>')[1].split('</style>')[0];
  }
  if (source.indexOf('<style scoped>') >= 0) {
    style = source.split('<style scoped>')[1].split('</style>')[0];
  }
  return {
    style,
  };
};
