function removeAdminBackendStack() {
  cdk destroy -f MMK-QuestionnaireAdmin-$1
}

function printUsage() {
  echo 'Destroys admin/backend stack' >&2
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


removeAdminBackendStack $ENV_NAME
