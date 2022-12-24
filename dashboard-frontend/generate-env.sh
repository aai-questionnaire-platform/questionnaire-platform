#!/bin/bash
function generateEnv() {
    local envName=$1

    unset APIGW
    if [ "$IS_LOCAL" == "true" ]
    then
        APIGW="http://localhost:3000"
    else
        APIGW=$(aws cloudformation list-exports | jq --arg STACK "dashboard-backend-""$envName" --arg URLKEY "Dashboard-ApiUrl-$envName" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' | sed 's/^.\(.*\)\/.$/\1/')
    fi

    if [ -z "$APIGW" ]
    then
        echo "Cannot extract api address for $envName"
        exit 1;
    else
        echo "Extracted address for $envName from aws: $APIGW"
    fi

    echo 'REACT_APP_API_URL='${APIGW} > ".env"
}

function printUsage() {
        echo 'Creates the env file for environment dev/test/prod' >&2
        echo 'with specified filename' >&2
        echo 'Usage: generate-env.sh -e [dev/test/prod]' >&2
}

unset ENV_NAME

while getopts :e:f:l opt; do
        case $opt in
                e) ENV_NAME=$OPTARG ;;
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

generateEnv $ENV_NAME
