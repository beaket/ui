const github = require("@changesets/changelog-github");

const base = github.default || github;

// @changesets/changelog-github links every bare `#<digits>` as an issue, so an
// all-digit hex colour such as #151617 becomes a link to an unrelated issue.
// Six or eight digits cannot be an issue number here; turn those back into code.
const ISSUE_LINK_HEX =
  /`?\[(#(?:\d{8}|\d{6}))\]\(https:\/\/github\.com\/[^/)]+\/[^/)]+\/issues\/\d+\)`?/g;

module.exports = {
  ...base,
  getReleaseLine: async (...args) => {
    const line = await base.getReleaseLine(...args);
    return line.replace(/ Thanks (@[^!]+)!/, " $1").replace(ISSUE_LINK_HEX, "`$1`");
  },
};
