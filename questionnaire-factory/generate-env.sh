#!/bin/bash

# Sets environment-specific variables
function setVariablesForEnv() {
  local environmentName=$1

  case $environmentName in
    muntesti-dev)
      export frontendStackExtension="dev"
      export backendStackExtension="mygame-dev"
      export nextAuthUrl="https://mygame-dev.yourdomain.fi"
      export nextPublicAaiBaseUrl="https://auroraai.astest.suomi.fi"
      export appName="mygame"
      if [ "$IS_LOCAL" == "true" ]; then
        export nextPublicProviderExtension="mg-local"
      else
        export nextPublicProviderExtension="mg-dev"
      fi
      ;;
    *)
      echo "No such env: $environmentName!"
      exit 1
      ;;
  esac
}

function generateEnvWithoutBackend() {
  aws cloudformation list-exports >.exports.temp

  # Get values from QfFrontend stack
  getExport QFFrontend "$frontendStackExtension" cloudFrontDistributionId
  getExport QFFrontend "$frontendStackExtension" cloudFrontDistributionEndpoint
  getExport QFFrontend "$frontendStackExtension" originBucketId

  if [ ! -f "$FILE_NAME" ]; then
    touch "$FILE_NAME"
  fi

  if [ "$(uname)" == "Darwin" ]; then
    SED="sed -i ''"
  else
    SED="sed -i"
  fi

  insertOrReplace NEXT_PUBLIC_BACKEND_URL none
  insertOrReplace NEXTJS_BUCKET "$originBucketId"
  insertOrReplace NEXTJS_CLOUDFRONTID "$cloudFrontDistributionId"
  insertOrReplace NEXT_PUBLIC_ENVNAME "$frontendStackExtension"

  rm .exports.temp
}

# Write varibles to file which is used in deploy
function generateEnv() {
  aws cloudformation list-exports >.exports.temp

  # Get values from QfFrontend stack
  getExport QFFrontend "$frontendStackExtension" cloudFrontDistributionId
  getExport QFFrontend "$frontendStackExtension" cloudFrontDistributionEndpoint
  getExport QFFrontend "$frontendStackExtension" originBucketId

  # Get Infra-stack specific parameters
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryRestApiUrl
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryUserpoolAdminIssuer
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryCognitoClientId
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryCognitoAuthorizerAdminLocalClient
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryCognitoAuthorizerAdminUrl
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryCognitoClientSecret
  getExport QuestionnaireFactoryInfraStack "$backendStackExtension" FactoryCognitoClientSecretLocal

  if [ ! -f "$FILE_NAME" ]; then
    touch "$FILE_NAME"
  fi

  if [ "$(uname)" == "Darwin" ]; then
    SED="sed -i ''"
  else
    SED="sed -i"
  fi

  # Replace or insert values in env file
  if [ "$IS_LOCAL" == "true" ]; then
    nextAuthUrl="http://localhost:3000"
    adminLogoutUrl="${FactoryCognitoAuthorizerAdminUrl/login/logout}?client_id=${FactoryCognitoAuthorizerAdminLocalClient}\&logout_uri=${nextAuthUrl}/${appName}"
  else
    adminLogoutUrl="${FactoryCognitoAuthorizerAdminUrl/login/logout}?client_id=${FactoryCognitoClientId}\&logout_uri=${nextAuthUrl}"
  fi

  insertOrReplace NEXTAUTH_URL "$nextAuthUrl"
  insertOrReplace NEXT_PUBLIC_AAI_BASE_URL "$nextPublicAaiBaseUrl"
  insertOrReplace NEXT_PUBLIC_BACKEND_URL "$FactoryRestApiUrl"
  insertOrReplace NEXT_PUBLIC_PROVIDER_EXTENSION "$nextPublicProviderExtension"

  if [ "$IS_LOCAL" == "true" ]; then
    insertOrReplace "COGNITO_CLIENTID" "$FactoryCognitoAuthorizerAdminLocalClient"
    insertOrReplace "COGNITO_CLIENTSECRET" "$FactoryCognitoClientSecretLocal"
  else
    insertOrReplace "COGNITO_CLIENTID" "$FactoryCognitoClientId"
    insertOrReplace "COGNITO_CLIENTSECRET" "$FactoryCognitoClientSecret"
  fi

  insertOrReplace "COGNITO_ISSUER" "$FactoryUserpoolAdminIssuer"
  insertOrReplace NEXT_PUBLIC_ADMIN_LOGOUT_URL "$adminLogoutUrl"
  insertOrReplace NEXTJS_BUCKET "$originBucketId"
  insertOrReplace NEXTJS_CLOUDFRONTID "$cloudFrontDistributionId"
  insertOrReplace NEXT_PUBLIC_ENVNAME "$frontendStackExtension"
  insertOrReplace NEXT_TOKEN_DB_NAME "FactoryAaiTokensTable-""$ENV_NAME"
  insertAWSDbWriteCredentials

  rm .exports.temp
}

# Utility function to insert or replace line in KEY=VALUE format
function insertOrReplace() {
  local valueToReplace=$1
  local replacementValue=$2

  # escape slashes in URLs
  escReplacementValue=$(echo $replacementValue | sed 's/\//\\\//g')

  grep -q "^$valueToReplace=" "$FILE_NAME" || echo "$valueToReplace=$escReplacementValue" >>"$FILE_NAME"
  $SED 's/'${valueToReplace}'=.*/'${valueToReplace}'='${escReplacementValue}'/g' "$FILE_NAME"
}

# Utility function to get exported value from specific stack
function getExport() {
  local stackName=$1
  local exportStackExtension=$2
  local exportName=$3

  ret=$(jq --arg STACK "$stackName" --arg URLKEY "$exportName"-"$exportStackExtension" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' .exports.temp | sed 's/^.\(.*\).$/\1/')
  if [ -z "$ret" ]; then
    echo "Cannot extract $3 from $1-$2"
    exit 1
  fi

  export "${3}"="${ret}"
}

# Get AWS accessKeyId and accessKeySecret from AWS secretsmanager, export them to env
function insertAWSDbWriteCredentials() {
  accessKey=$(aws secretsmanager get-secret-value --secret-id accessTokenWriter-test --query SecretString --output text | jq '."accessKeyId"' | tr -d \")
  accessSecretKey=$(aws secretsmanager get-secret-value --secret-id accessTokenWriter-test --query SecretString --output text | jq '."accessKeySecret"' | tr -d \")

  insertOrReplace NEXT_AUTH_AWS_ACCESS_KEY "$accessKey"
  insertOrReplace NEXT_AUTH_AWS_SECRET_KEY "$accessSecretKey"
}

function printUsage() {
  echo 'Usage: generate-env.sh -e <ENVNAME> [-f <FILENAME>] [-l]'
  echo 'Creates the env file for an enironment specified'
  echo ''
  echo '  -e    Environment name'
  echo '  -f    Output file name. Optional, defaults to .env.local'
  echo '  -l    Local, if true the variables will be set for local development. Optional.'
}

unset ENV_NAME
unset BACKEND_STACK_EXTENSION
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

if [ -z "$FILE_NAME" ]; then
  FILE_NAME=".env"
fi

setVariablesForEnv "$ENV_NAME"

if [ -z "$frontendStackExtension" ] || [ -z "$backendStackExtension" ] || [ -z $ENV_NAME ]; then
  printUsage
  exit 1
fi


if [ "$backendStackExtension" == "n/a" ]; then
  generateEnvWithoutBackend "$frontendStackExtension" "$FILE_NAME"
else
  generateEnv "$frontendStackExtension" "$backendStackExtension" "$FILE_NAME"
fi

