# questionnaire-factory

This repository contains the AuroraAI questionnaire factory's frontend.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Git Workflow

- Use feature branches. Please, follow the following naming convention `[issue id]-[short description]` e.g. `AAIMMK-123-admin-login`.
- Use JIRA issue id as a commit prefix, e.g. `AAIMMK-123 Fix a bug with admin login`
- Pull requests should be peer reviewed before being merged to dev
- Do not push directly to the main branch

## Folder structure

The code is divided into folders as follows:

- api - contains all server interaction related utilities and hooks
- assets - all game asset files (translations, structure, translations)
- components - components shared between different features
- features - top level components (i.e. pages)
- pages - Nextjs routes
- public - public assets (e.g. images)
- styles - application level styles in css
- types - shared Typescript typings
- util - shared utility functions and such

> **_NOTE:_** Project supports absolute imports. Enable preferences for them in your editor if needed. For example, in Visual Studio Code, add setting `"typescript.preferences.importModuleSpecifier": "non-relative"` to `.vscode/settings.json`

# Getting started with local development

## Prerequisities

- Nodejs and Npm installed
- Git credentials correctly set [[?]](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh)
- AWS credentials correctly set [LINK REMOVED]
- Commands jq (https://stedolan.github.io/jq/) and yq (https://mikefarah.gitbook.io/yq/) are required by some installation scripts

## Starting dev server

1. (Run `npm i`)
1. Please, make sure you have [Prettier](https://prettier.io/docs/en/index.html) formatter, [Husky](https://github.com/typicode/husky) runner and [Eslint](https://eslint.org/docs/latest/) static code analyzer installed and configured
1. Generate env variables for game in development. See [this section](#generate-env-files) for details.
1. The following environment variables must be retrieved manually from [LINK REMOVED] and added to the env file created in the previous step:

   - `[GAME NAME]_CLIENTID` _(aurora ai login client, game specific)_
   - `[GAME NAME]_CLIENTSECRET` _(aurora ai login secret, game specific)_
   - `NEXTAUTH_SECRET` _(for the nextauth, shared for all games)_
   - `JWT_SECRET` _(for the nextauth, shared for all games)_

   <br />

   > **_PRO TIP_**: One can save environment variables for different games in backup files for easy content switching!

   > **_PRO_TIP 2_**: Game specific client ids and secrets are prefixed with the game's name so they can co-exist. Thus, it's possible to keep script generated values in one file e.g., `.env` and all the secrets and client ids that can't be generated with the script in another file e.g., `.env.local`.

1. Run the development server: `npm run dev`
1. Open `http://localhost:3000/<game name>` with your browser to see the result

> **_NOTE:_** game names relate to `<game name>.app.json` files in the `assets` folder, not to the environment name used to generate environment variables!

## Generating the env file to point to backend APIs and logins<a id="generate-env-files"></a>

Each game has it's own backend service. When developing a game the targeted backend must be the backend of that particular game. To change the backend target create the environment variables accordingly with the generate-env script.

```
$ ./generate-env.sh -e <env name> [-l] [-f <filename>]
```

For example, when developing "mygame" game locally against the surupolku-dev server:

```
$ ./generate-env.sh -e mygame-dev -f .env.local -l
```

## Testing

### Unit tests

Write unit tests for utility functions with [Jest](https://jestjs.io/docs/getting-started). Test files should be located next to the test subject. Run the test suite with `npm test`.

### Functional/integration tests

All functional integration tests should be written with [Cypress](https://docs.cypress.io/guides/overview/why-cypress).
Read the Cypress best practices guide [here](https://docs.cypress.io/guides/references/best-practices). Cypress test files are located in the `cypress/integration` folder. The dev server must be running in `http://localhost:3000` before running Cypress tests. When writing tests/code it's most convenient to open the Cypress UI in watch mode with `npx cypress open`.

### Component/snapshot tests

There's only one component/snapshot test written (for `components/ComponentTree.jsx`). Cypress/manual testing was considered to be sufficient.

## Adding new component types

In order to use new types in the app structure schema a new Component type must be created and it must be linked to a component in renderer.

1. To add theme and translations to templates and to affected games, run
   ```
   $ node ./scripts/create-game.js add-component <component type>
   ```
   Where `<component type>` is the type property that will be given to the component in the following step. Type name should be uppercased and snake cased e.g., `FRONT_PAGE`
1. Add new component interface to `./schema/Components.d.ts` extending the base Component interface
1. Add the new interface to the exported ComponentDefinition union type
1. Run `node ./scripts/generate-schemas.js -t AppStructure` to generate the json schema file
1. After creating component .tsx file add it to the Components map in `components/ComponentTree.tsx` with key that matches the type prop of the component in schema

> **_NOTE_**: never edit any of the json files in the schema folder manually! Those changes will be overwritten next time someone runs the schema generation script.

In case one should want to create a new component to be used in code only, there's a helper script `add-component`. Run the script with `--help` option to get the full description of options.

```
$ node ./scripts/create-component.js -c <component name>
```

## Using theme

Theme can be used in components via `useAppTheme` hook. This is a typed version of the styled-components library's `useTheme` hook. Theme can also be used within the styled-components' context in the following way:

```ts
const MyComponent = styled.div`
  background: ${({ theme }) => theme.common.bgColor};
`;
```

> \> Read more about styled-components and theming [here](https://styled-components.com/docs/advanced#theming).

## Editing theme

> **_NOTE_**: never edit any of the json files in the schema folder manually!

1. Edit the `./schema/Theme.d.ts` file if necessary (if new props were added, old props were deleted etc.)
1. If the `Theme.d.ts` file was changed run `node ./scripts/generate-schemas.js -t Theme` to generate the json schema file
1. Make changes to the game's theme file accordingly
1. Remember to check that every game's theme file is valid against the changed schema and that the games work after the change

> \> Read more about theming [LINK REMOVED].

# Deploy

## Deploying with Serverless to dev

From the deployment view of things, the frontend consists of

- AWS CDK stack which creates the infrastucture, such as names and addresses for accessing the questionnaires
- Serverless Next.Js component which deploys the app

If the stack is already created and previously deployed then steps 1 to 3 can be skipped.

1. Add a new stack to `cdk/bin/qf-frontend.ts` file like so:

   ```typescript
   new QuestionnaireFrontendStack(
     app,
     'QFFrontend-<game name>-<env>',
     '<game name>-<env>',
     {
       env: { region: region },
     }
   );
   ```

1. Add mappings to `config/FQDNQuestionnaireMap.ts` file like so:

   ```typescript
   const envMaps: Record<string, Map<string, string>> = {
     // ...
     '<game name>-<env>': new Map<string, string>([
       ['<game name>-<env>.yourdomain.fi', '<game name>'],
     ]),
   };
   ```

1. Create the cdk stack. THIS ONLY NEEDS TO BE DONE ONCE PER env, so the QFFrontend-dev stack probably already exists

   ```
   cd cdk
   cdk deploy QFFrontend-dev
   cd ..
   ```

1. Prefill the environment variables for the environment

   ```
   ./generate-env.sh -e dev -f .env
   ```

1. Remove cached code and variables

   ```
   rm -r .next .serverless .serverless_nextjs
   ```

1. Deploy the app. Only dev env (stage) exists at the moment. The app's url is printed when the deployment is finished

   ```
   npx serverless --debug --stage=<environment name>
   ```

## Deploy to production

To make a deployment to production one must:

- merge released changes to the main branch
- create a release branch
- create a new tag
- bump version number in `package.json`

This can be done using `scripts/create-release.js` script. Usage:

```
node scripts/create-release.js -v <patch|minor|major> [-s <dev|test|...>]
```

For example, to make a minor release from dev branch run (_the source branch argument defaults to dev and can be omitted._):

```
node scripts/create-release.js -v minor
```

After the script has run, navigate to [LINK REMOVED], select relevant project and go to the Actions tab.
Then select workflow "Production deployment of \<project name\>", push "Run workflow" dropdown, select "Tag: \<new version\>" and press "Run workflow".

NOTE: Deploy only tags, never from branch!

# Troubleshooting

**Login redirects to the signin page with all the providers listed**

- Check terminal for NextAuth debug logging, most likely some environment variable is missing
- Remove cookies and clear logins from the `FactoryAaiTokensTable-<env name>` table and retry logging in

**Admin login works but after returning to the app a NextAuth error view is shown**

- Check that Cognito client ID is correct, meaning that the correct Cognito app client is used (there are two: one for local dev, one for deployed environments)
- Remove cookies and clear logins from the `FactoryAaiTokensTable-<env name>` table and retry logging in

**Server request(s) fail(s)**

- Check that the `NEXT_PUBLIC_BACKEND_URL` is correct
- Check if requests fails for CORS errors using dev tools' Network tab. If so, enable CORS for API endpoints [[?]](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html).
- If request to `organizations` endpoint fails for `500: NoSuchKey` the organizations.json file is missing. Add it to the correct bucket by copying it from another bucket or following [LINK REMOVED] and retry.
- If requests fails for 401 when a new game/environment has been added, check that in the `factory-backend` project's `lib/questionnaire-factory-backend.ts` file, there's corresponding env mapping with correct audience value

**What is the current version in environment x?**

1. navigate to the environment
1. open console tab from your browser's dev tools. The application version and the latest commit hash should be printed in the following format: `Application version <version>-<commit hash>`.
1. Copy the hash and run `git show <commit hash>` to see the commit details

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [serverless-nextjs Documentation](https://github.com/serverless-nextjs/serverless-next.js) - learn about configuring the deployment
