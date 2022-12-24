function addUser() {
  echo "Updating user $USER_NAME, ${ATTR_NAME}=${ATTR_VALUE} in pool $USER_POOL"

  aws cognito-idp admin-update-user-attributes \
  --user-pool-id $USER_POOL \
  --username $USER_NAME \
  --user-attributes Name="${ATTR_NAME}",Value="$ATTR_VALUE">/dev/null
}

function printUsage() {
  echo 'Updates a custom attribute of an admin user (if the attribute is marked mutable)'
  echo 'update-user-attributes.sh -p [user_pool_id] -u [user_name] -n [attribute_name] -v [attribute_value]'
}

unset ENV_NAME
unset USER_NAME
unset ATTR_NAME
unset ATTR_VALUE

while getopts :p:u:n:v: opt; do
  case $opt in
    p) USER_POOL=$OPTARG ;;
    u) USER_NAME=$OPTARG ;;
    n) ATTR_NAME=$OPTARG ;;
    v) ATTR_VALUE=$OPTARG ;;
    *)
      printUsage
      exit 1
  esac
done


shift "$(( OPTIND - 1 ))"

if [ -z "$USER_POOL" ] || [ -z "${USER_NAME}" ] || [ -z "${ATTR_NAME}" ]; then
    printUsage
    exit 1
fi

addUser

