const github = require("@changesets/changelog-github");

const base = github.default || github;

module.exports = {
  ...base,
  getReleaseLine: async (...args) => {
    const line = await base.getReleaseLine(...args);
    return line.replace(/ Thanks (@[^!]+)!/, " $1");
  },
};
