How to setup new game for admin-ui:

1. create json-file, example:

```json
{
  "questionnaire": {
    // Parameters for Questionnaire-model
    "author": "Person who is responsible for this content",
    "title": "My test" //This value is shown in admin-ui
  },
  "organizations": [
    {
      "name": "Root organization", //Main-level organization, is added to webiny with type AREA
      "children": [
        //Child-organizations, they are added to webiny with type UNIT
        {
          "name": "North"
        },
        {
          "name": "East"
        },
        {
          "name": "South"
        },
        {
          "name": "West"
        }
      ]
    }
  ],
  // Topics that can be selected for questions (these are optional, use empty list [] if not needed)
  "topics": ["Example topic 1", "Example topic 2"]
}
```

1. Find webiny graphql-api url for appropriate environment from cdk.json
1. Find webiny admin-application url for appropriate environment from your webiny admin ui
1. Find a webiny apikey from webiny admin-application (Settings -> Access Management -> API Keys -> [api-key-name] -> Token)
1. Run script: node setup-new-game -u [webiny graphql-api url] -a [webiny apikey] -s [name of settings json-file]. Script creates Questionnaire-model, Organization-models and Topic-models (if set). After execution script prints generated gameUuid that is used to authorize cognito-users to game content.
1. Add a new entry to appropriate environment in questionnaire-factory-instances.
   ```
   {
     "factoryEnv": <stack-short-name>,
     "gameUuid": <game-uuid>
   }
   ```
1. Run deploy-stack for the environment used: `$ deploy-stack.sh -e [environment]`
1. Script for authorizing users to new gameUuid can be found here: admin-infrastructure/scripts/update_user.sh
