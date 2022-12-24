# Admin-frontend

User interface for questionnaire content and user management.

# Getting started with development

## Prerequisites

1. AWS cli installed. See [AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
1. AWS cli configured. See instructions in [AAIMMK docs](https://github.com/auroraai-questionnaire-platform/docs/blob/main/md/aws-credentials.md).
1. Commands [jq](https://stedolan.github.io/jq/) and [yq](https://mikefarah.gitbook.io/yq/) are required by some installation scripts. Install them if they are not provided by your operating system.
1. User created for admin application. See step about generating an admin user in AAIMMK docs.
1. Please, make sure you have Prettier, Eslint and Husky installed and configured for code quality

## Project setup

0. Assuming that the prerequisites are met
1. Run `npm install` to install dependencies
1. Generate env file for the preferred environment. See [this section](#generate-env-files).
1. Run npm start to open locally in browser (Port 3000)

## Application structure

- This project leans heavily on the [Material UI](https://mui.com/getting-started/installation/) library
- Data fetching and caching is handled with [GraphQL](https://graphql.org/graphql-js/)
- All components are located in the `src/components` folder. Subdirectories are created if a component is an composition of other components that are not used by other components. Component folder should contain an `index.ts` file providing the component's public API.
- Two kinds of tests should be written: unit tests using Jest for utility functions and Cypress tests for integration and component testing

## Workflow

- Use feature branches. Please, follow the following naming convention `[issue id]-[short description]` e.g. `AAIMMK-123-admin-login`.
- Use JIRA issue id as a commit prefix, e.g. `AAIMMK-123 Fix a bug with admin login`
- Pull requests should be peer reviewed before being merged to dev
- Do not push directly to the main branch

# Available Scripts

In the project directory, you can run:

## `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Generating the env files to point to backend APIs<a id="generate-env-files"></a>

To generate an env file with most recent address of the API in specific environment, run the tool generate-env.sh.

```
./generate-env.sh -e [environment] -f [filename] [-l for local development]
```

For example, to develop locally against the dev server run:

```
./generate-env.sh -e dev -f .env.development -l
```

# Deploy stack

To deploy to production see the section below.

```
$ ./scripts/deploy-stack.sh -e <stack-short-name>
```

# Deploy to production

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

After the script has run, navigate to https://github.com/your-repository, select relevant project and go to the Actions tab.
Then select workflow "Production deployment of \<project name\>", push "Run workflow" dropdown, select "Tag: \<new version\>" and press "Run workflow".

NOTE: Deploy only tags, never from branch!

# Related repositories

- admin-infrastructure
- admin-backend
