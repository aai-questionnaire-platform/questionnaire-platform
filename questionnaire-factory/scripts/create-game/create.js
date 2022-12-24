const path = require('path');
const prompt = require('prompt');
const util = require('node:util');
const promptAsync = util.promisify(prompt.get);

const common = require('./common.js');

/**
 * This will contain the [game-name].app.json file's contents
 */
let appJSON = {
  $schema: '../schema/AppStructure.json',
};

/**
 * Keep track of the types of components that are added to the game
 */
const addedTypes = [];

/**
 * Handler for the create command. Helps to create assets files for a new game
 */
async function createNewGame(gameName) {
  try {
    await createAppMeta();
    await createRoutes();
    await writeAppJSON(gameName);
    await Promise.all([
      createThemeJSON(gameName),
      createTranslationsJSON(gameName),
    ]);
    console.log('\nAll done! Now you should:');
    console.log(
      `\t- review the assets/${gameName}.app.json file for component properties`
    );
    console.log(`\t- add theming to the assets/${gameName}.theme.json file`);
    console.log(
      `\t- add translations to the assets/${gameName}.translations.json file`
    );
  } catch (e) {
    console.log('exiting', e);
    process.exit(1);
  }
}

async function promptYesNo(message) {
  const { isOk } = await promptAsync({
    name: 'isOk',
    description: `${message} (Y/n)?`,
    default: 'y',
  });

  if (isOk.toLowerCase() !== 'y') {
    throw new Error('Not accepted');
  }

  return true;
}

async function createAppMeta() {
  const properties = [
    {
      name: 'lang',
      description: 'What is the default language of this game (fi)?',
      default: 'fi',
      validator: /^[a-z]{2}$/,
      warning:
        'The value should be a language part of a locale identifier (two lower case letters, e,g., "fi")',
      required: true,
    },
    {
      name: 'title',
      description:
        "What is your game's main title? This is used as a prefix in sub page titles",
      type: 'string',
      required: true,
    },
  ];

  prompt.start();

  const result = await promptAsync(properties);

  appJSON.meta = {
    title: result.title,
    lang: result.lang,
  };

  return appJSON;
}

async function createRoutes() {
  appJSON.routes = [];
  prompt.start();

  while (true) {
    const addsAnother = await promptRoute();
    if (!addsAnother) {
      return appJSON;
    }
  }
}

async function promptRoute() {
  const routeProperties = [
    {
      name: 'path',
      description: 'Add a path to the app',
      default: !appJSON.routes.length ? '/' : undefined,
      required: true,
    },
    {
      name: 'title',
      description: "What is this path's title?",
      required: false,
    },
    {
      name: 'auth',
      description: 'Is this path for authenticated users only (Y/n)?',
      default: 'y',
      type: 'string',
      required: true,
    },
    {
      name: 'childType',
      description: 'What is the type of component this path contains?',
      warning:
        'Component type does not exist, run list-types command to see available options',
      type: 'string',
      required: true,
      conform: (v) => {
        const types = common.getAllTypes();
        return types.includes(v);
      },
    },
  ];

  try {
    await promptYesNo('Should we add a new route');
    const result = await promptAsync(routeProperties);
    const route = {
      path: result.path,
      meta: {
        title: result.title || '',
        auth:
          result.auth.toLowerCase() !== 'y'
            ? false
            : {
                roles: [
                  result.path.includes('/admin')
                    ? 'mmk-rs/questionnaire:approve'
                    : 'mmk-rs/questionnaire:play',
                ],
              },
      },
      children: [
        {
          type: result.childType,
          props: {},
        },
      ],
    };
    appJSON.routes.push(route);
    addedTypes.push(result.childType);
    return true;
  } catch (e) {
    return false;
  }
}

async function writeAppJSON(gameName) {
  try {
    await promptYesNo(`Is this ok?
      ${JSON.stringify(appJSON, null, 2)}
    `);
    return common.writeAssetJSON(gameName, 'app', appJSON);
  } catch (e) {
    throw new Error('No accepted');
  }
}

async function createThemeJSON(gameName) {
  const styleDefs = common.readJSON(
    path.resolve('scripts', 'create-game', 'component_themes.json')
  );
  let themeFile = {
    $schema: '../schema/Theme.json',
    ...styleDefs.COMMON,
  };

  addedTypes.forEach((type) => {
    const def = styleDefs[type];
    if (def) {
      themeFile = { ...themeFile, [def.key]: def.value };
    }
  });

  return common.writeAssetJSON(gameName, 'theme', themeFile);
}

async function createTranslationsJSON(gameName) {
  const lang = appJSON.meta.lang;
  const translationDefs = common.readJSON(
    path.resolve('scripts', 'create-game', 'component_translations.json')
  );
  let translations = {
    ...translationDefs.COMMON,
  };

  addedTypes.forEach((type) => {
    const def = translationDefs[type] || { key: type, value: {} };
    if (def) {
      translations = { ...translations, [def.key]: def.value };
    }
  });

  const translationsFile = {
    [lang]: {
      translation: translations,
    },
  };

  return common.writeAssetJSON(gameName, 'translations', translationsFile);
}

module.exports = { createNewGame };
