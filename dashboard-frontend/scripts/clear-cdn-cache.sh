#!/bin/bash
set -e

function invalidateCloudfrontDistribution() {
  CFDIST_NAME=$(aws cloudfront list-distributions | jq --arg URL "dashboard-$1.yourdomain.fi" '.DistributionList.Items[] | select(.Aliases.Items[]? == $URL).Id')
  CFDIST_NAME=$(echo $CFDIST_NAME | tr -d \")

  if [ -z "$CFDIST_NAME" ]; then
    echo 'CloudFront distribution name not found'
    exit 1
  fi

  aws cloudfront create-invalidation --distribution-id $CFDIST_NAME --paths '/*'
}

function printUsage() {
  echo 'Invalidates CloudFront distribution in order to make new changes take effect immediately' >&2
  echo 'clear-cdn-cache.sh -e [environment] '
  echo '-e [dev/test/..]'
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

if [ "$ENV_NAME" == "prod" ]; then
  echo "Nope."
  exit 1
fi

invalidateCloudfrontDistribution $ENV_NAME
