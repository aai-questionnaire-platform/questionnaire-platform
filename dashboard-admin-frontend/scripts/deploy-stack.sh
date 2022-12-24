set -e

function deployDashboardAdminFrontend() {
  ./generate-env.sh -e $1
  npm run build
  aws s3 sync ./build/ s3://dashboard-admin-frontend-$1 --delete
}

function printUsage() {
  echo 'Deploys dashboard admin frontend to the given environment' >&2
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

deployDashboardAdminFrontend $ENV_NAME
