function removeAdminInfraStack() {
  cdk destroy -f QuestionnaireAdminInfrastructureStack-$1
}

function removeBucket() {
  aws s3 rb s3://questionnaire-admin-$1 --force
}

function printUsage() {
  echo 'Destroys admin infra stack and the related S3 bucket' >&2
  echo 'destroy-stack.sh -e [environment] '
  echo '-e [dev/test/..]'
}

unset ENV_NAME

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


removeBucket $ENV_NAME
removeAdminInfraStack $ENV_NAME
