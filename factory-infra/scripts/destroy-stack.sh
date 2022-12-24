function removeInraStack() {
  cdk destroy -f QuestionnaireFactoryInfraStack-$1
}

function resolveAndRemoveUserPools() {
  USER_POOLS=$(aws cognito-idp list-user-pools --max-results 60 | jq --arg ENV_NAME "$ENV_NAME" '.UserPools | .[] | select(.Name | contains($ENV_NAME)) | .Id' | sed 's/^.\(.*\).$/\1/')

  removeUserPools $USER_POOLS
}

function removeUserPools() {
  while test $# -gt 0
  do
    echo "Removing user pool $1"
    aws cognito-idp delete-user-pool --user-pool-id $1
    shift
  done

}

function printUsage() {
  echo 'Destroys infra stack and removes buckets and user pools from given environment' >&2
  echo 'destory-stack.sh -e [environment] '
  echo '-e [dev/test/..]'
}

unset ENV_NAME
unset USER_POOLS

while getopts :e: opt; do
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

if [ "$ENV_NAME" == "prod" ]; then
  echo "Nope."
  exit 1
fi


removeInraStack $ENV_NAME
resolveAndRemoveUserPools $ENV_NAME
