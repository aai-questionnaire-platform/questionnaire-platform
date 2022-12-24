# Adding AAI/Cognito login to a game

All logins are implemented with NextAuth.js (https://next-auth.js.org/) package. The following ENV variables
are needed in local development environment for all games:

```
JWT_SECRET=<used to sign the jwt token>
NEXTAUTH_SECRET=<needed with middleware>
NEXTAUTH_URL=http://localhost:3000/
```

## Adding an AAI login

In order to add an AAI login to a new game the AAI client for the game must be requested from the Ydinkomponentit team. Instructions can be found from their [wiki](https://wiki.dvv.fi/display/AAI/Uuden+palvelun+integroiminen+profiilinhallintaan+-+tekninen). Once the integration is done and all the client id, client secret and callback urls are received it is possible to add login to the new game with the following steps:

1. Resolve CLIENT_ID and CLIENT_SECRET for the game from secrets [[?](/md/secrets-management.md)] (if found, all instances of the game use the same values)
1. Add an AAI provider to providers in the `pages/api/auth/[...nextauth].ts` file:

   ```typescript
   {
     providers: [
       // ... //

       AAIProvider("<provider id>", {
         clientId: process.env.MY_CLIENTID!,
         clientSecret: process.env.MY_CLIENTSECRET!,
         // ...other props if needed
       }),
     ];
   }
   ```

1. Add environment variables to the `.env` file of your choice (in local dev `.env.local` should be used). The values should've been requested from the AAI team.

   ```
   MY_CLIENTID=<client-id>
   MY_CLIENTSECRET=<client-secret>
   NEXT_PUBLIC_PROVIDER_EXTENSION=<provider-extension>
   ```

   NOTE: The NEXT_PUBLIC_PROVIDER_EXTENSION variable's value should match the last part of the provided callback url, for example if the callback url for the local dev is `http://localhost:3000/api/auth/callback/auroraai-mylogin-local` then the variable should be `mylogin-local`!

1. Add env config to the `lib/questionnaire-factory-backend.ts` file in the `factory-backend` project like so:

   ```typescript
   envParamMap.set("<stack-short-name>", {
     JWT_ISSUER: "https://auroraai.astest.suomi.fi/oauth",
     JWT_AUDIENCE: "<aud property from the jwt token>",
     ENV_NAME: env,
     AAI_ATTRIBUTES: "<aai attribute prefix>",
   });
   ```

1. To make the env variables available for ci/cd pipelines, add
   game's client id and secret to `questionnaire-factory/.github/workflows/deploy-instance.yml`'s env.

1. Update the `generate-env` script [[?]](#generate-env)
1. Add CLIENT_ID and CLIENT_SECRET to secrets if need be[[?]](/md/secrets-management.md)
1. Deploy the stack, commit and publish changes

## Adding a Cognito login

1. Find client id, client Secret and cognito user pool id from AWS console. See more info in NextAuth's [documentation](https://next-auth.js.org/providers/cognito)
1. Add an AAI provider to providers in the `pages/api/auth/[...nextauth].ts` file with correct values:

   ```typescript
   CognitoProvider({
      id: 'admin-<NEXT_PUBLIC_PROVIDER_EXTENSION>',
      name: 'Descriptive name',
      clientId: process.env.MY_COGNITO_CLIENTID as string,
      clientSecret: process.env.MY_COGNITO_CLIENTSECRET as string,
      issuer: process.env.MY_COGNITO_ISSUER as string,
      profile: adminProfileHandler,
    }),
   ```

1. Add env config to the `lib/questionnaire-factory-infra-stack.ts` file in the `factory-infra`project like so:
   ```javascript
   envParamMap.set('<stack-short-name>', {
       appName: '<app name>',
       groupAdminCallBackUrl: 'api/auth/callback/<cognito-provider-id>',
       [...] // rest of the values can be copied from some other config
     });
   ```
1. Update the `generate-env` script [[?]](#generate-env)
1. Deploy the stack, commit and publish changes

## Updating the generate-env script<a id="generate-env"></a>

Update the script in `questionnaire-factory` repo (`./generate-env.sh`) so that the environment variables can be automatically retrieved with the script. Add a new entry to the environments switch statement, like so:

```bash
function setVariablesForEnv() {
  # ...
  <stack short name>)
    export frontendStackExtension="<stack short name>"
    export backendStackExtension="<stack short name>"
    export nextAuthUrl="<url of your application>"
    export nextPublicAaiBaseUrl="https://auroraai.astest.suomi.fi"
    export appName="<app name>"
    if [ "$IS_LOCAL" == "true" ]; then
      export nextPublicProviderExtension="<nextauth provider id (local)>"
    else
      export nextPublicProviderExtension="<nextauth provider id (test/dev..)"
    fi
    ;;
```
