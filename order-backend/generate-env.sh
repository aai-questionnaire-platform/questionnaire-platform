#!/bin/bash

# Sets environment-specific variables
function setVariablesForEnv() {
  local environmentName=$1

  case $environmentName in
  *)
    export aaiClientid=$(aws secretsmanager get-secret-value --secret-id SECRETID | grep SecretString | awk -F'"' '{print $7}' | awk '{print substr($0, 1, length($0)-1)}')
    export aaiClientsecret=$(aws secretsmanager get-secret-value --secret-id SECRETID | grep SecretString | awk -F'"' '{print $7}' | awk '{print substr($0, 1, length($0)-1)}')
    export aaiLoginRedirectUrl="http://localhost:3000/api/auth/callback/auroraai-pt-local"
    export aaiLoginUrl=""
    ;;
  esac
}

# Write varibles to file which is used in deploy
function generateEnv() {

  if [ ! -f ".env" ]; then
    touch ".env"
  fi

  if [ "$(uname)" == "Darwin" ]; then
    SED="sed -i ''"
  else
    SED="sed -i"
  fi

  # Replace or insert values in env file
  insertOrReplace AAI_CLIENTID "$aaiClientid"
  insertOrReplace AAI_CLIENTSECRET "$aaiClientsecret"
  insertOrReplace AAI_LOGIN_REDIRECT_URL "$aaiLoginRedirectUrl"
  insertOrReplace AAI_LOGIN_URL "$aaiLoginUrl"
}

function printUsage() {
  echo 'Creates the env file for any or the environments'
  echo 'with specified filename'
  echo 'Usage: generate-env.sh -e [dev/test/mr/pr/kr/jt etc] -f [filename]'
}

# Utility function to insert or replace line in KEY=VALUE format
function insertOrReplace() {
  local valueToReplace=$1
  local replacementValue=$2

  # escape slashes in URLs
  escReplacementValue=$(echo $replacementValue | sed 's/\//\\\//g')

  grep -q "^$valueToReplace=" .env || echo "$valueToReplace=$escReplacementValue" >>.env
  $SED 's/'${valueToReplace}'=.*/'${valueToReplace}'='${escReplacementValue}'/g' .env
}

unset ENV_NAME
unset BACKEND_STACK_EXTENSION

while getopts :e:f:l opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
  *)
    printUsage
    exit 1
    ;;
  esac
done

shift "$((OPTIND - 1))"

if [ -z $ENV_NAME ]; then
  printUsage
  exit 1
fi

setVariablesForEnv "$ENV_NAME"
generateEnv "$frontendStackExtension" "$backendStackExtension" "$FILE_NAME"
