# admin-backend

If you use admin-backend from your own stack,

1. edit cdk.json before deployment so that there is corresponding webiny-endpoint-<yourenvidentifier> which points into existing webiny instance.
2. store the existing webiny-token to AWS secret manager so that it's accessible from your admin-backend-stack. For example, if your personal stack's suffix if XXX, store the secret with the following cli command:

aws secretsmanager create-secret --name webiny-token-XXX --description "Webiny token" --secret-string "webinyapikeyhere"

# Configurations to connect admin-backend with factory-backends

cdk.json has property "questionnaire-factory-instances" where connections between admin-backend and factory-backend environments is made. All installed instances should be specified here, admin-backend finds correct instance on runtime by gameUuid. If you don't have gameUuid yet and want to setup new game, see: scripts/questionnaire-factory/README.md for details.

Example configuration with explanation:

```javascript
"questionnaire-factory-instances": {
  "dev": [ // This is the env for admin-backend (dev, test & prod + developers own envs)
    {
      "factoryEnv": "mygame-dev", // env for factory-backend ending with -dev (ripari-dev, surupeli-dev etc.)
      "gameUuid": "b37bbdff-e7db-4760-ad8a-3e1a7ed5e6df" // id used in webiny-models and cognito user pool
    }
  ],
  "test": [ // This is the env for admin-backend (dev, test & prod + developers own envs)
    {
      "factoryEnv": "mygame-test", // env for factory-backend ending with -test (ripari-test, surupeli-test etc.)
      "gameUuid": "c37bbdff-e7db-4760-ad8a-3e1a7ed5e6df" // id used in webiny-models and cognito user pool
    }
  ]
}
```

## Creating and updating admin-users

For each questionnaire-game there is corresponding Game-model in webiny, it has uuid-identifier that is used for filtering webiny-content.

To create/update users, follow instructions in docs repo.

## Deploy stack

To deploy to production see the section below.

```
$ ./scripts/deploy-stack.sh -e <stack-short-name>
```

## Destroy stack

```
$ ./scripts/destroy-stack.sh -e <stack-short-name>
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

After the script has run, navigate to https://github.com/your-repository, select relevant project and go to the Actions tab.
Then select workflow "Production deployment of \<project name\>", push "Run workflow" dropdown, select "Tag: \<new version\>" and press "Run workflow".

NOTE: Deploy only tags, never from branch!
