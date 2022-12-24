# Factory-infra

See [docs repo][REMOVED] for more information.

## Prerequisites

1. AWS Credentials set. See instructions [here][REMOVED].
1. Node and NPM installed
1. AWS cdk cli installed `sudo npm install -g aws-cdk`
1. Docker needs to be installed and running for deploying

## Deploy stack

```
$ ./scripts/deploy-stack.sh -e <stack-short-name>
```

## Destroy stack

```
$ ./scripts/destroy-stack.sh -e <stack-short-name>
```

## Clean stack related obsolete resources

Stack destroy does'nt remove resources containing data, such as Dynamo tables, S3 buckets and Cognito user pools. To remove obsolete Dynamo tables and Cognito user pools, run the following command. It also lists obsolete s3 buckets for manual delete (versioned buckets can't be removed with the cli tool).

```
$ ./scripts/cleanup-stack.sh -e <stack-short-name>
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx jest --watchAll` run unit tests in watch mode
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

# Related repositories

- [AAIMMK docs][REMOVED]
- [factory-backend][REMOVED]
- [factory-frontend][REMOVED]
