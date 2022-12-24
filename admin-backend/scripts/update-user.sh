function updateUser() {
  echo "Updating user $USER_NAME, custom:game_ids=${ATTR_VALUE} in pool $USER_POOL"

  aws cognito-idp admin-update-user-attributes \
  --user-pool-id $USER_POOL \
  --username $USER_NAME \
  --user-attributes Name="custom:game_ids",Value="$ATTR_VALUE">/dev/null
}

function printUsage() {
  echo 'Updates custom:game_ids attribute of an admin user (Game.uuid in webiny)'
  echo 'update-user.sh -p [user_pool_id] -u [user_name] -g [game_uuid]'
}

unset ENV_NAME
unset USER_NAME
unset ATTR_VALUE

while getopts :p:u:g: opt; do
  case $opt in
    p) USER_POOL=$OPTARG ;;
    u) USER_NAME=$OPTARG ;;
    g) ATTR_VALUE=$OPTARG ;;
    *)
      printUsage
      exit 1
  esac
done


shift "$(( OPTIND - 1 ))"

if [ -z "$USER_POOL" ] || [ -z "${USER_NAME}" ] || [ -z "${ATTR_VALUE}" ]; then
    printUsage
    exit 1
fi

updateUser

