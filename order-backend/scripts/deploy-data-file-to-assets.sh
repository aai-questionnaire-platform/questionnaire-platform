function printUsage() {
  echo "Deploys a data file to the given environment's assets" >&2
  echo 'deploy-stack.sh -e [environment] -f '
  echo '-e [dev/test]'
  echo '-f [filename]'
}

unset ENV_NAME
unset FILE_LOCATION

while getopts :e:f: opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
  f) FILE_LOCATION=$OPTARG ;;
  *)
    printUsage
    exit 1
    ;;
  esac
done

BASEDIR=$(dirname $0)

shift "$((OPTIND - 1))"

if [ -z "$ENV_NAME" ]; then
  printUsage
  exit 1
fi

if [ -z "$FILE_LOCATION" ]; then
  printUsage
  exit 1
fi

ASSETS_BUCKET=orderassets-$ENV_NAME

aws s3 cp --region eu-west-1 $FILE_LOCATION s3://$ASSETS_BUCKET
