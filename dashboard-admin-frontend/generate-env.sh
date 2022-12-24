#!/bin/bash
function generateEnv() {
  unset LOGIN_URL
  unset API_URL

  LOGIN_URL=$(aws cloudformation list-exports | jq --arg STACK "DashboardAdminInfraStack-$1" --arg URLKEY "cognito-signin-url-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
  API_URL=$(aws cloudformation list-exports | jq --arg STACK "DashboardAdminInfraStack-$1" --arg URLKEY "DashboardAdminRestApiUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')

  if [ -z "$LOGIN_URL" ]; then
    echo "Cannot extract api address for $1"
    exit 1
  else
    echo "Extracted address for $1 from aws: $LOGIN_URL"
  fi

  echo 'REACT_APP_LOGIN_URL='${LOGIN_URL} >".env"
  echo 'REACT_APP_API_URL='${API_URL} >>".env"

}

function printUsage() {
  echo 'Creates the env file for environment dev/test/prod' >&2
  echo 'with specified filename' >&2
  echo 'Usage: generate-env.sh -e [dev/test/prod]' >&2
}

unset ENV_NAME

while getopts :e: opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
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

generateEnv $ENV_NAME
