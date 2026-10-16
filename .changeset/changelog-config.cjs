const github = require("@changesets/changelog-github");

const base = github.default || github;

// `@changesets/changelog-github` links every `#<digits>` as an issue, including all-digit hex
// colours such as `#151617`. A 6- or 8-digit reference is a colour, not an issue (the tracker is
// far below 100000), so restore it as inline code.
const HEX_COLOUR_LINK = /`?\[(#(?:\d{8}|\d{6}))\]\([^)]*\/issues\/\d+\)`?/g;

module.exports = {
  ...base,
  getReleaseLine: async (...args) => {
    const line = await base.getReleaseLine(...args);
    return line.replace(/ Thanks (@[^!]+)!/, " $1").replace(HEX_COLOUR_LINK, "`$1`");
  },
};
