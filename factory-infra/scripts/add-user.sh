function addUser() {
  echo "Creating admin user $USER_NAME to user pool $USER_POOL with organization_ids ${ORG_ID}"

  aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL \
  --temporary-password "$USER_NAME#1A"\
  --username $USER_NAME \
  --desired-delivery-mediums EMAIL \
  --user-attributes Name="custom:organization_ids",Value="$ORG_ID" Name="email",Value="$USER_NAME" Name="name",Value="$USER_NAME">/dev/null
}

function printUsage() {
  echo 'Adds an admin user to given user pool with temporary password [user_name]#1A'
  echo 'add-user.sh -p [user_pool_id] -u [user_name] -o [organization_id]'
}

unset ENV_NAME
unset USER_NAME
unset ORG_ID

while getopts :p:o:u: opt; do
  case $opt in
    p) USER_POOL=$OPTARG ;;
    u) USER_NAME=$OPTARG ;;
    o) ORG_ID=$OPTARG ;;
    *)
      printUsage
      exit 1
  esac
done


shift "$(( OPTIND - 1 ))"

if [ -z "$USER_POOL" ] || [ -z "${USER_NAME}" ] || [ -z "${ORG_ID}" ]; then
    printUsage
    exit 1
fi

addUser

