function removeBackendStack() {
  cdk destroy -f DashboardAdminBackend-$1
}

function printUsage() {
  echo 'Destroys backend stack' >&2
  echo 'destroy-stack.sh -e [dev/test/..] '
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

removeBackendStack $ENV_NAME
