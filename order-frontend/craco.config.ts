import path from 'path';
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

module.exports = {
  webpack: {
    alias: Object.keys(paths).reduce(
      (all, alias) => ({
        ...all,
        [alias.replace('/*', '')]: path.resolve(
          __dirname,
          'src',
          paths[alias][0].replace('/*', '')
        ),
      }),
      {}
    ),
  },
};
