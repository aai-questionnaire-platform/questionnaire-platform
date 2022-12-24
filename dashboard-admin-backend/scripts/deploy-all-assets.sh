unset ENV_NAME

while getopts :e: opt; do
  case $opt in
  e) ENV_NAME=$OPTARG ;;
  *)
    exit 1
    ;;
  esac
done

# for FILE in ./assets/*; do
./scripts/deploy-data-file-to-assets.sh -e $ENV_NAME -f ./assets/contactDetailsLabels.json
#done
