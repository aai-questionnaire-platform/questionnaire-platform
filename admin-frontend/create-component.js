const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const argv = yargs
  .option('component', {
    alias: 'c',
    description: 'Component name',
    type: 'string',
  })
  .option('destination', {
    alias: 'd',
    description: 'Destination folder',
    default: './src/components',
    type: 'string',
  })
  .help()
  .alias('help', 'h').argv;

if (!argv.component) {
  throw new Error('Component name is required!');
}

const { component: name, destination } = argv;

if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination);
}

function errorHandler(fileName) {
  return function handleError(err, ...rest) {
    if (err) throw err;
    console.log(`${destination}/${fileName} successfully created`);
  };
}

if (!fs.existsSync(path.join(destination, `${name}.tsx`))) {
  fs.writeFile(
    path.join(destination, `${name}.tsx`),
    [
      "import { useTranslation } from 'react-i18next';",
      '',
      `interface ${name}Props {`,
      '\t',
      '}',
      '',
      `const ${name}: React.FC<${name}Props> = ({`,
      '\t',
      '}) => {',
      '\tconst { t } = useTranslation();',
      '',
      '\treturn (',
      `\t\t<div className="${name}">`,
      '\t\t\t',
      '\t\t</div>',
      '\t)',
      '}',
      '',
      '',
      `export default ${name};`,
      '',
    ].join('\n'),
    errorHandler(`${name}.tsx`)
  );
}
