#!/bin/bash
function generateEnv() {
  unset APIGW
  if [ "$IS_LOCAL" == "true" ]; then
    APIGW=$(aws cloudformation list-exports | jq --arg STACK "OrderInfraStack-$1" --arg URLKEY "OrderRestApiUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
  else
    APIGW=$(aws cloudformation list-exports | jq --arg STACK "OrderInfraStack-$1" --arg URLKEY "OrderRestApiUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
  fi

  unset AAI_LOGIN_URL
  unset AAI_LOGIN_CLIENT_ID
  unset AAI_LOGIN_REDIRECT
  unset AAI_LOGIN_ENV_ID

  if [ "$1" == "dev" ]; then
    AAI_LOGIN_URL="removed"
    AAI_LOGIN_CLIENT_ID=$(aws secretsmanager get-secret-value --secret-id SECRETID | grep SecretString | awk -F'"' '{print $7}' | awk '{print substr($0, 1, length($0)-1)}')
    AAI_LOGIN_REDIRECT="https://palvelutilaus-dev.yourdomain.fi/api/auth/callback/auroraai-pt-dev"
    AAI_LOGIN_ENV_ID="auroraai-pt-dev"
    REACT_APP_APP_URL_DASHBOARD="http://dashboard-dev.yourdomain.fi"
  fi

  if [ -z "$APIGW" ]; then
    echo "Cannot extract api address for $1"
    exit 1
  else
    echo "Extracted address for $1 from aws: $APIGW"
  fi

  echo 'REACT_APP_API_HOST='${APIGW} >"$2"
  echo 'REACT_APP_LOGIN_URL='${AAI_LOGIN_URL} >>"$2"
  echo 'REACT_APP_LOGIN_CLIENT_ID='${AAI_LOGIN_CLIENT_ID} >>"$2"
  echo 'REACT_APP_LOGIN_REDIRECT='${AAI_LOGIN_REDIRECT} >>"$2"
  echo 'REACT_APP_LOGIN_ENV_ID='${AAI_LOGIN_ENV_ID} >>"$2"
  echo 'REACT_APP_APP_URL_DASHBOARD='${REACT_APP_APP_URL_DASHBOARD} >>"$2"

}

function printUsage() {
  echo 'Creates the env file for environment dev/test/prod' >&2
  echo 'with specified filename' >&2
  echo 'Usage: generate-env.sh -e [dev/test/prod] -f [filename] [-l]' >&2
}

unset ENV_NAME
unset FILE_NAME
unset IS_LOCAL

while getopts :e:f:l opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
  f) FILE_NAME=$OPTARG ;;
  l) IS_LOCAL="true" ;;
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

if [ -z "$FILE_NAME" ]; then
  if [ "$IS_LOCAL" == "true" ]; then
    FILE_NAME=".env.development.local"
  else
    FILE_NAME=".env.$ENV_NAME"
  fi
fi

generateEnv $ENV_NAME $FILE_NAME
