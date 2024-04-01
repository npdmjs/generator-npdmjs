export const convertGitOriginToUrl = (origin: string) => {
  const sshUrlRegex = /^git@(.*):(.*)\/(.*)\.git$/;

  const match = origin.match(sshUrlRegex);
  if (match) {
      return `https://${match[1]}/${match[2]}/${match[3]}.git`;
  } else {
      return origin.endsWith('.git') ? origin.slice(0, -4) : origin;
  }
};
