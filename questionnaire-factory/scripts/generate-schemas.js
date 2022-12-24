/**
 * Script for generating json schemas from types from the schema files in the ./schema folder.
 */

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const TJS = require('typescript-json-schema');

const argv = yargs
  .option('type', {
    alias: 't',
    description: 'Type to convert',
    type: 'string',
    demandOption: true,
  })
  .help()
  .version('1.0.0')
  .alias('help', 'h').argv;

const filePath = path.resolve(`./schema/${argv.type}.d.ts`);

if (!fs.existsSync(path.resolve(filePath))) {
  throw new Error(`No such file: ${argv.type}.d.ts!`);
}

// arguments to the schema generator
const settings = {
  required: true,
  refs: true,
  noExtraProps: true,
};

// ts compiler options
const compilerOptions = {
  strictNullChecks: true,
};

const program = TJS.getProgramFromFiles([filePath], compilerOptions);
const schema = TJS.generateSchema(program, argv.type, settings);

fs.writeFile(
  path.join('schema', `${argv.type}.json`),
  JSON.stringify(schema),
  function (err) {
    if (err) throw err;
    console.log('Schema file:', path.join('.', 'schema', `${argv.type}.json`));
  }
);
