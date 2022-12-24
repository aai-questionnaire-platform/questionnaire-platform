set -e

function deployFrontEnd() {
  ./generate-env.sh -e $1
  npx env-cmd -f .env.$1 craco build
  aws s3 sync ./build/ s3://order-frontend-$1 --delete
}

function printUsage() {
  echo 'Deploys Order frontend to the given environment' >&2
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


deployFrontEnd $ENV_NAME
