#!/bin/bash
function generateEnv() {
    unset APIGW
    if [ "$IS_LOCAL" == "true" ]
    then
        APIGW=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "QuestionnaireAdminApiUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        COGNITOURL=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "AdminCognitoAuthorizerUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        COGNITOCLIENTID=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "AdminCognitoAuthorizerLocalClient-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        REDIRECTURL="http://localhost:3000/login"
    else
        APIGW=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "QuestionnaireAdminApiUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        COGNITOURL=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "AdminCognitoAuthorizerUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        COGNITOCLIENTID=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "AdminCognitoAuthorizerClient-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
        REDIRECTURL=$(aws cloudformation list-exports | jq --arg STACK "QuestionnaireAdminInfrastructureStack-$1" --arg URLKEY "QuestionnaireAdminLoginUrl-$1" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\).$/\1/')
    fi

    if [ -z "$APIGW" ]
    then
        echo "Cannot extract api address for $1"
        exit 1;
    else
        echo "Extracted address for $1 from aws: $APIGW"
    fi
        echo 'REACT_APP_API_HOST='${APIGW} > "$2"
        echo 'REACT_APP_LOGIN_URL='${COGNITOURL} >> "$2"
        echo 'REACT_APP_LOGOUT_URL='${COGNITOURL/login/logout} >> "$2"
        echo 'REACT_APP_LOGOUT_REDIRECT='${REDIRECTURL/\/login/} >> "$2"
        echo 'REACT_APP_LOGIN_CLIENT_ID='${COGNITOCLIENTID} >> "$2"
        echo 'REACT_APP_LOGIN_REDIRECT='${REDIRECTURL} >> "$2"
        echo 'REACT_APP_USE_MOCK_API=false' >> "$2"
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
        esac
done

shift "$(( OPTIND - 1 ))"

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
