function deleteOldTables() {
    aws dynamodb list-tables | jq '.TableNames | .[] ' | grep "QuestionnaireFactoryInfraStack-$1" | sed 's/^.\(.*\).$/\1/' > .old_tables.temp

    getExport QuestionnaireFactoryInfraStack-$1 "FactoryAaiAttributeTable-$1Name" FactoryAaiAttributeTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryAnswersSummaryTable-$1Name" FactoryAnswersSummaryTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryAnswersTable-$1Name" FactoryAnswersTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryGroupMembersTable-$1Name" FactoryGroupMembersTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryGroupsTable-$1Name" FactoryGroupsTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryProgressTable-$1Name" FactoryProgressTable
    getExport QuestionnaireFactoryInfraStack-$1 "FactoryUserSettingsTable-$1Name" FactoryUserSettingsTable

    sed -i "/$FactoryAaiAttributeTable/d" .old_tables.temp
    sed -i "/$FactoryAnswersSummaryTable/d" .old_tables.temp
    sed -i "/$FactoryAnswersTable/d" .old_tables.temp
    sed -i "/$FactoryGroupMembersTable/d" .old_tables.temp
    sed -i "/$FactoryGroupsTable/d" .old_tables.temp
    sed -i "/$FactoryProgressTable/d" .old_tables.temp
    sed -i "/$FactoryUserSettingsTable/d" .old_tables.temp

    echo "Tables currently in use":
    echo ""
    echo "$FactoryAaiAttributeTable"
    echo "$FactoryAnswersSummaryTable"
    echo "$FactoryAnswersTable"
    echo "$FactoryGroupMembersTable"
    echo "$FactoryGroupsTable"
    echo "$FactoryProgressTable"
    echo "$FactoryUserSettingsTable"
    echo ""
    echo "Tables to be removed:"
    echo ""
    cat .old_tables.temp
    echo ""


    read -p "Are you sure you want to delete the tables listed as obsolete (y/n)? " is_confirmed

    if [ "$is_confirmed" == "y" ]
    then
      echo "Delete confirmed, deleting tables..."
      while IFS="" read -r p || [ -n "$p" ]
      do
        deleteTable $p
      done < .old_tables.temp
      echo "Old tables deleted!"
    else
      echo "Skipping table delete"
    fi
}

# Utility function to get exported value from specific stack
function getExport() {
  local stackName=$1
  local urlKey=$2

  ret=$(jq --arg STACK "$stackName" --arg URLKEY "$urlKey" '.Exports | .[] | select( .ExportingStackId | contains($STACK)) | select( .Name == $URLKEY) | .Value' .exports.temp | sed 's/^.\(.*\).$/\1/')

  if [ -z "$ret" ]
   then
     echo "Cannot extract $2 from $1"
     exit 1;
  fi

  export "${3}"="${ret}"
}

function deleteTable() {
  local tableName=$1
  echo "Deleting table $tableName..."
  aws dynamodb delete-table --table-name $tableName > /dev/null
}

function deletCognitoPools() {
  getExport QuestionnaireFactoryInfraStack-$1 "FactoryCognitoUserpoolAdminId-$1" FactoryCognitoUserpoolAdminId
  aws cognito-idp list-user-pools --max-results 60 | jq --arg POOLNAME "factoryuserpooladmin$1" '.UserPools | .[] | select(.Name | contains($POOLNAME)) | .Id' | sed 's/^.\(.*\).$/\1/' | sed "/$FactoryCognitoUserpoolAdminId/d"> .old_userpools.temp

  echo "Current cognito admin pool":
  echo "$FactoryCognitoUserpoolAdminId"
  echo ""
  echo "Pools to be removed:"
  cat .old_userpools.temp
  echo ""

  read -p "Are you sure you want to delete the userpools listed as obsolete (y/n)? " is_confirmed

  if [ "$is_confirmed" == "y" ]
  then
    echo "Delete confirmed, deleting tables..."
    while IFS="" read -r p || [ -n "$p" ]
    do
      deleteUserPool $p
    done < .old_userpools.temp
    echo "Old userpools deleted!"
  else
    echo "Skipping userpool delete"
  fi
}

function deleteUserPool() {
  local poolId=$1
  echo "Deleting userpool $poolId..."
  aws cognito-idp delete-user-pool --user-pool-id $poolId
}

function checkS3() {
  local envName=$1
  getExport QuestionnaireFactoryInfraStack-$envName "FactoryAssets-""$envName""BucketName" FactoryAssets
  echo "Current bucket:"
  echo "$FactoryAssets"
  echo ""
  echo "Old buckets:"
  aws s3api list-buckets | jq --arg BUCKETNAME "questionnairefactoryinfra-factoryassets$1" '.Buckets | .[] | select(.Name | contains($BUCKETNAME)) | .Name' | sed 's/^.\(.*\).$/\1/' | sed "/$FactoryAssets/d"
  echo ""
  echo "NOTE: No buckets were removed because versioned buckets must be deleted manually using the AWS console! "
}

function getExports() {
  aws cloudformation list-exports > .exports.temp
}

function cleanup() {
  rm .exports.temp .old_tables.temp .old_userpools.temp
}

function printUsage() {
        echo "Usage: check-old-data-for-cleanup.sh -e [ENV NAME]"
        echo 'Deletes all old inactive tables and cognito pools and lists obsolete s3 buckets that a stack exports'
        echo ""
        echo "-e Environment name (e.g. dev/test/etc)"
}

unset ENV_NAME
unset TABLE_NAME

while getopts :e:l opt; do
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

getExports
deleteOldTables $ENV_NAME
deletCognitoPools $ENV_NAME
checkS3 $ENV_NAME
cleanup
