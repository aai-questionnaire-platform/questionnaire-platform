function addUser() {
  aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL \
  --temporary-password "$USER_NAME#1A"\
  --username $USER_NAME \
  --user-attributes Name="custom:game_ids",Value="$GAME_ID" >/dev/null
  
  echo "Done! User $USER_NAME created in pool $USER_POOL with game_uuid $GAME_ID"
  echo "Your username is $USER_NAME and your temporary password is $USER_NAME#1A"
}

function printUsage() {
  echo 'Adds an admin user to given user pool with temporary password [user_name]#1AAI'
  echo 'add-user.sh -p [user_pool_id] -u [user_name] -g [game_uuid]'
}

unset ENV_NAME
unset USER_NAME

while getopts :p:u:g: opt; do
  case $opt in
    p) USER_POOL=$OPTARG ;;
    u) USER_NAME=$OPTARG ;;
    g) GAME_ID=$OPTARG ;;
    *)
      printUsage
      exit 1
  esac
done


shift "$(( OPTIND - 1 ))"

if [ -z "$USER_POOL" ] || [ -z "${USER_NAME}" ] || [ -z "${GAME_ID}" ]; then
    printUsage
    exit 1
fi

addUser
