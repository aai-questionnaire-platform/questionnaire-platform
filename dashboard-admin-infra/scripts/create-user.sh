#!/bin/bash
function createUser() {
  unset COGNITO_USERPOOL

  COGNITO_USERPOOL=$(aws cloudformation list-exports | jq --arg STACK "DashboardAdminInfraStack-$1" --arg URLKEY "DashboardAdminCognitoPool-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')

  if [ -z "$COGNITO_USERPOOL" ]; then
    echo "Cannot extract api address for $1"
    exit 1
  else
    echo "Extracted user pool for $1 from aws: $COGNITO_USERPOOL"
  fi

  aws cognito-idp admin-create-user --user-pool-id $COGNITO_USERPOOL --username "$2"

}

function printUsage() {
  echo 'Creates a new admin user for specified user pool' >&2
  echo 'Usage: create-user.sh -e [dev/test/prod] -m [desired@email.com]' >&2
}

unset ENV_NAME
unset EMAIL

while getopts :e:m: opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
  m) EMAIL=$OPTARG ;;
  *)
    printUsage
    exit 1
    ;;
  esac
done

shift "$((OPTIND - 1))"

if [ -z "$ENV_NAME" ]; then
  printUsage
  exit 1
fi

createUser $ENV_NAME $EMAIL
