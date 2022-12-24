# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

# Deploying the stack

- AWS credentials must be set to command-line tools before deploying, see documentation at [LINK REMOVED].
- Use the command-line tool to deploy to environment, `cdk deploy DashboardFrontend-[env]`, for example:

`cdk deploy DashboardFrontend-dev`

DashboardFrontend-dev is automatically deployed or updated on updates to dev-branch. Stack is also deployed by ../scripts/deploy-stack.sh script.
