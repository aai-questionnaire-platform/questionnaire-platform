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
    default: './components',
    type: 'string',
  })
  .option('nowrap', {
    description: 'If true no wrapping folder is created',
    default: false,
    type: 'boolean',
  })
  .help()
  .alias('help', 'h').argv;

if (!argv.component) {
  throw new Error('Component name is required!');
}

const { component: name, destination, nowrap } = argv;
const fullDestination = nowrap ? destination : `${destination}/${name}`;

if (!fs.existsSync(fullDestination)) {
  fs.mkdirSync(fullDestination);
}

function errorHandler(fileName) {
  return function handleError(err, ...rest) {
    if (err) throw err;
    console.log(`${destination}/${fileName} successfully created`);
  };
}

if (!nowrap && !fs.existsSync(path.join(fullDestination, 'index.tsx'))) {
  fs.writeFile(
    path.join(fullDestination, 'index.tsx'),
    `export { default } from './${name}';\n`,
    errorHandler('index.ts')
  );
}

if (!fs.existsSync(path.join(fullDestination, `${name}.tsx`))) {
  fs.writeFile(
    path.join(fullDestination, `${name}.tsx`),
    [
      "import { useTranslation } from 'react-i18next';",
      "import styled from 'styled-components';",
      '',
      `interface ${name}Props {`,
      '\t',
      '}',
      '',
      `const ${name}Container = styled.div\`\`;`,
      '',
      `function ${name}({}: ${name}Props) {`,
      '\tconst { t } = useTranslation();',
      '',
      '\treturn (',
      `\t\t<${name}Container>`,
      '\t\t\t',
      `\t\t</${name}Container>`,
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
