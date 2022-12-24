function deployAdminInfraStack() {
  cdk deploy QuestionnaireAdminInfrastructureStack-$1 --require-approval never
}

function printUsage() {
  echo 'Deploys admin infra stack to the given environment' >&2
  echo 'deploy-stack.sh -e [environment] '
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


deployAdminInfraStack $ENV_NAME
