# Setting up a new game

Each game requires a dedicated backend and infra stacks and assets files for the application frontend laucher.

## Prerequisites

1. AWS Credentials set. See instructions [here](../md/aws-credentials.md).
1. Node and NPM installed
1. AWS cdk cli installed `sudo npm install -g aws-cdk`
1. (AuroraAI login urls and resources requested from the AuroraAI team, if needed)
1. Docker Desktop should be up and running

## 1. Set up infra

1. Clone the infra repo
1. Add a new infra stack to `bin/questionnaire-factory-infra.ts`:

   ```javascript
   new QuestionnaireFactoryInfraStack(app, "<stack-short-name>");
   ```

   `<stack-short-name>` should be a combination of app name and environment name, e.g., `myapp-dev`.

1. Create API key which is used in admin backend -> factory backend communication.

   ```
   aws secretsmanager create-secret --name FactoryQuestionnaireApiKey-<stack-short-name> --secret-string "<secretstring>"
   ```

   `<stack-short-name>` should be a combination of app name and environment name, e.g., `myapp-dev`.
   `<secretstring>` should be random secret string, at least 20 characters long. Avoid special characters like "'\\[]`{}<>|.

   If the API key already exists, it has to be deleted before creating a new one. Deleting an API key in AWS console causes mandatory waiting period before deletion. Therefore API keys should be deleted using the following command to skip the waiting period:

   ```
   aws secretsmanager delete-secret --secret-id FactoryQuestionnaireApiKey-<stack-short-name> --force-delete-without-recovery
   ```

1. Deploy the infra stack running
   ```
   ./scripts/deploy-stack.sh -e <stack-short-name>
   ```
1. Commit and publish changes to the factory-infra repository

## 2. Set up backend

1. Clone the backend repo
1. Add a new backend stack to `bin/questionnaire-factory-backend.ts`:

   ```javascript
   new QuestionnaireFactoryBackend(app, "<stack-short-name>");
   ```

   `<stack-short-name>` should be the same as the infra stack's for clarity.

1. Add `<stack-short-name>` to the list on deployable stacks in `.github/workflows/deploy-instance.yml`
1. (Run `npm i` in `/src` if necessary)
1. Deploy the stack running
   ```
   ./scripts/deploy-stack.sh -e <stack-short-name>
   ```
1. Set CORS headers for the API and deploy it from the AWS console following [this](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html) guide
1. Commit and publish changes to the factory-backend repository

## 3. Create game to the admin application

1. Clone admin-backend repo
1. (Run `npm i` in `src` folder)
1. Create and save a json file to the `./scripts/questionnaire-factory` folder describing the organization structure and topics used in the app. For example:

   ```json
   {
     "questionnaire": {
       // Parameters for the Questionnaire model
       "author": "Person who is responsible for this content",
       "title": "Mun testi", // this value is shown in admin ui
       "locale": "fi" // required, but not currenly used. Defaults to "fi" if left undefined.
     },
     "organizations": [
       {
         "name": "My Organization", // main-level organization, is added to webiny with type AREA
         "children": [
           // child organizations, they are added to webiny with type UNIT
           {
             "name": "Child 1"
           },
           {
             "name": "Child 2"
           },
           {
             "name": "Child 3"
           },
           {
             "name": "Child 4"
           }
         ]
       }
     ],
     // topics that can be selected for questions (these are optional, use empty list [] if not needed)
     "topics": ["Example topic 1", "Example topic 2"]
   }
   ```

   This file is referenced as `<settings.json>` from here on.

1. Find Webiny's `<webiny-endpoint>` url for appropriate environment from `./cdk.json`, for example if connecting new game to dev instance the correct url is the value of `webiny-endpoint-dev`
1. Find Webiny admin application's url for appropriate environment from `[link removed]`
1. Navigating to the url found in the previous step copy Webiny api's `<api-key>` (Settings -> Access Management -> API Keys -> [api-key-name] -> Token)
1. Run command

   ```
   node ./scripts/questionnaire-factory/setup-new-game -u <webiny-endpoint> -a <api-key> -s <settings.json>
   ```

   Script creates Questionnaire, Organization and Topic models (if set). After execution script prints a generated gameUuid that is used to authorize AWS Cognito users to game content.

   NOTE: Memorize/save the gameUuid as it is used in the following steps!

1. Add a new entry to appropriate environment in `questionnaire-factory-instances` in `./cdk.json` file

   ```json
   {
     // stack name used for the backend
     "factoryEnv": "<stack-short-name>",
     // game uuid printed out by the setup-new-game script
     "gameUuid": "<game-uuid>"
   }
   ```

1. Deploy app running deploy script with `<env>` variable being the environment the game was added to

   ```
   ./scripts/deploy-stack.sh -e <env>
   ```

1. Commit and publish changes to the admin-backend repo

## 4. Authorize a user to the new game

1. Follow [these](/md/authorizing-admin-users.md) instruction to create/update an admin user to the `admin-infra` stack's Cognito user pool.
1. Login to the admin app using the temporary password and change the password of your choosing

## 5. Set up frontend

1. Clone the repo
1. (Run `npm install` in the questionnaire-factory folder if needed)
1. Create asset files for the new game to the assets folder

   - `<appName>.app.json` - Containing the settings and the structure of the app i.e. component definitions. [[?]](./game-frontend-structure.md)
   - `<appName>.theme.json` - Containing theme definitions such as colors etc. [[?]](./theming-games.md)
   - `<appName>.translations.json` - Containing resources for the [i18next](https://react.i18next.com/) library

   These files can be created manually or running a script like so:

   ```
   node ./scripts/create-game.js -n <appName> -l <appLanguage>
   ```

1. Add game backend's API url to environment variables

   ```
   NEXT_PUBLIC_BACKEND_URL=<api-url>
   ```

   HINT: correct API url can be found from the AWS Console, under `Amazon API Gateway -> APIs -> Questionnaire Factory API - [game name]-[env name] -> Stages -> [env name] -> Invoke url`

1. Run `npm run dev` and the new app should be available in `http://localhost:3000/<appName>`
1. (Edit `assets/[game name].theme.json` to contain all the needed theme definitions and `assets/[game name].translations.json` to contain all translations.)

> \> Read more about theming [here](./theming-games.md).

## 6. Deploy frontend

The front end must be deployed before `generate-env` script can be used to fetch all the necessary environment variables. Follow instructions for deployment in the the questionnaire-factory's README.md.

## 6. Add login

Follow [these](/md/adding-logins-to-game.md) instructions to add logins if the questionnaire requires authorization.

## 6. Set up data

1. cd to `factory-backend` project's folder
1. Create the organization json file by running script:
   ```
   node ./scripts/organizations/create-organizations-json-from-webiny -u <webiny-endpoint> -a <api-key> -g <game-uuid>
   ```
   HINT: all values can be found from previous steps
1. Upload the file created to the correct environment:

   ```
   ./scripts/deploy-data-file-to-assets.sh -e <stack-short-name> -f organizations.json
   ```

1. Create and publish a questionnaire using the admin application
