/**
 * Script for generating json schemas from types from the schema files in the ./schema folder.
 */
const yargs = require('yargs');
const { createNewGame } = require('./create-game/create.js');
const { listTypes } = require('./create-game/list-types.js');
const { addComponent } = require('./create-game/add-component.js');

const argv = yargs(process.argv.slice(2))
  .command(
    'create <game_name>',
    'Creates asset files for a new game',
    (yargs) => {
      yargs.positional('game_name', {
        describe: 'Name of the game',
      });
    },
    (argv) => createNewGame(argv.game_name)
  )
  .command(
    'list-types',
    'Lists all the available component types',
    (x) => x,
    listTypes
  )
  .command(
    'add-component <component>',
    'Add a new type of component to the game',
    (yargs) =>
      yargs.positional('component', {
        describe: 'Name of the component',
        demandOption: ['component'],
      }),
    (argv) => addComponent(argv.component)
  )
  .help().argv;
