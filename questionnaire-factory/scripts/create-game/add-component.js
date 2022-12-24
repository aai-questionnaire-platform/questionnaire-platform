const common = require('./common.js');
const prompt = require('prompt');
const util = require('node:util');
const promptAsync = util.promisify(prompt.get);

async function addToTranslations(gameName, entry) {
  const fileContent = await common.readAssetJSON(gameName, 'translations');

  Object.keys(fileContent).forEach((lang) => {
    fileContent[lang].translation = {
      ...fileContent[lang].translation,
      ...entry,
    };
  });

  return common.writeAssetJSON(gameName, 'translations', fileContent);
}

async function addComponent(type) {
  const entry = {
    [type]: {
      key: type
        .toLowerCase()
        .replace(/_(\w)/, (_match, chr) => chr.toUpperCase()),
      value: {},
    },
  };

  // add entry to template files
  await Promise.all(
    ['themes', 'translations'].map((key) => {
      const path = require('node:path').resolve(
        'scripts',
        'create-game',
        `component_${key}.json`
      );

      const contents = common.readJSON(path);

      return common.writeJSON(path, {
        ...contents,
        ...entry,
      });
    })
  );

  // add entry to game theme and translation files

  const { addToGames } = await promptAsync({
    name: 'addToGames',
    description: `List of games this affects (e.g., mun-testi,surupolku) ?`,
  });

  const gameNames = addToGames
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (gameNames.length) {
    await Promise.all(
      gameNames
        .map((gameName) => {
          const gameEntry = { [entry[type].key]: entry[type].value };
          console.log('adding', entry, 'as', gameEntry);
          return [
            common.appendToAssetFile(gameName, 'theme', gameEntry),
            addToTranslations(gameName, gameEntry),
          ];
        })
        .flat()
    );
  }

  console.log('\nAll done! Now you should:');
  console.log(`\t- Add translation to the component_translations.json file`);
  console.log(`\t- Add theme keys to the component_themes.json file`);
  console.log(
    `\t- Add translation keys and values to affected game's translations asset file`
  );
  console.log(
    '\t- Add component to code, instructions are found here: https://github.com/auroraai-questionnaire-platform/questionnaire-factory#adding-new-component-types'
  );
}

module.exports = { addComponent };
