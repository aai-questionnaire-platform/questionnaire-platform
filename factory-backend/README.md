# Welcome to Questionnaire Factory Backend

This repository contains the AuroraAI - Questionnaire Factory backend service.

This is an CDK app, which provisions an api gateway, lambda functions and other necessary resources and permissions to AWS. This CDK stack depends on the infra stack. THe infra stack needs to be deployed first - per each environment. It creates the immutable resources such as the VPC, dynamo tables and exports their names that to be used by this stack.

## Prerequisites

1. An AWS account that you've logged into to and aws cli installed
2. cdk cli installed `sudo npm install -g aws-cdk`
3. typescript-json-schema generator installed `sudo npm install typescript-json-schema -g`
4. Docker needs to be installed for deploying
5. Commands jq (https://stedolan.github.io/jq/) and yq (https://mikefarah.gitbook.io/yq/) are required by some installation scripts. Install them if they are not provided by your operating system.

## Quick-start on developing your own stack and running local frontend

Recommended way for local testing is to deploy a personal stack and to develop the frontend against it. To setup a new personal stack follow the instructions for setting up a new game (own stack is basically a new game) in [docs repo](https://github.com/auroraai-questionnaire-platform/docs/blob/main/md/new-game-setup.md).

## Project structure

- bin CDK app definition
- lib CDK stack definition
- src Actual solution code
- test Unit tests
- swagger Utilities and static html template to maintain the OpenAPI spec for the API.

## Development

To add a new path or method you need to do the following:

### Episode 1. NodeJS/typescript coding

1. Create a new event handler (i.e. lambda) into `src/handlers/<verb>-<mydomain>.ts`.

   The handler _should only handle basic HTTP stuff_, and delegate heavy lifting and logic beyond that into a service implementation. Keep the handler as simple as possible, and implement logic in domain services (see next step).

   Remember to add the CORS headers into your responses.

2. Create the domain-specific service functionality into `services/<mydomain-service>.ts`

3. If necessary, author required typescript interfaces for data exchange into `src/datamodels/<myinterface>.ts`

4. If necessary, add lightweight wrappers for AWS services into `src/aws-wrappers/<what-i-do>.ts`

5. Author unit tests for your service.
   Use mocks if necessary to mask out the external dependencies (see previous step) into src/tests

### Episode 2. CDK development

1. Add schema generation, if you added new data models, to lib/schemas.

   The schemas are used by the CDK to specify HTTP request/response validation, and to generate the OpenAPI specification for the API.

   In case you added or modified existing ones, you need to regenerate the schemas with command `generate-schemas.sh` from the lib/schemas-directory

   _DO NOT EDIT THEM MANUALLY._

2. If you have added a new model, register your new model into `lib/utils/model-register.ts`

3. Add your new lambda handler into `lib/handlers/<mydomain>.ts` to register it to API gateway with all the bells and whistles.

4. Instantiate your lambda & register it in `lib/questionnaire-factory.ts`

5. Deploy the stack stack using the the `scripts/deploy-stack.sh` script.

   e.g. `./scripts/deploy-stack.sh -e <stack-short-name>`

6. Update the OpenAPI docs by running `export-and-publish-swagger.sh -a stackName` from the swagger-folder.

## Episode 3, local testing

To test your changes locally you may do the following using the sam cli.
(You need to install the sam cli of course to do this).

1. Export the template using cdk with command
   `cdk synth > cdk.out/template.yaml`
   from the project root.

2. Invoke local events with
   `tool test/test-event.sh -f function_name -e event-file`

   e.g.
   `~/src/factory-backend$ test/test-event.sh -f QuestionnaireFactoryServiceApprovesalevelascompletedanunlocksthenextlevel6BBCA5DE -e test/events/post-progress.json`

   The _function_ids_ that are supported can be printed out using command
   `sam local invoke`

   There's an utility script to generate a local template and environment necessary for running event handlers on your local host. Usage:

`$ build-and-gen-env.sh -i QuestionnaireInfrastructureStack-dev -a QuestionnaireFactoryBackend-dev`

There are some sample events in test/events that can be used to _event-file_.

## Deploy stack

```
$ ./scripts/deploy-stack.sh -e <stack-short-name>
```

## Remove stack

```
$ scripts/destroy-stack.sh -e <stack-short-name>
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
