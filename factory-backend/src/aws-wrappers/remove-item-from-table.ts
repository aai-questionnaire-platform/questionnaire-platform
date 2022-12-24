import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { listItems } from "./get-item-from-table";

export async function removeGroupMemberBinding(
  tableName : string,
  group_id: string,
  user_id: string
) {
  try {
    const params = {
      TableName: tableName,
      Key: {
        user_id: { S: user_id },
        group_id: { S: group_id },
      },
    };

    return removeItem(params);
  } catch (err) {
    console.error('removeGroupMemberBinding():', err, tableName);
    throw err;
  }
}

export async function deleteAaiAttributesFromTable(
  tableName: string,
  user_id: string
) {
  try {
    const searchParams = {
      TableName: tableName,
      KeyConditionExpression: `user_id=:k`,
      ExpressionAttributeValues: {
        ':k': {S: user_id}
      },
    }

    // [{"user_id":{"S":"3a9d8287-fd6b-93a8-94d1-deb71e46140d"},"data":{"BOOL":true},"attribute_name":{"S":"tampere_demo_flag"}}]

    // Search..
    const result = await listItems(searchParams);

    const params = {
      RequestItems: {
        [tableName]: [] as any[]
      }
    }

    result?.map((item) => {
      params.RequestItems[tableName].push({
        DeleteRequest: {
          Key: {
            user_id: { S: item.user_id.S },
            attribute_name: { S: item.attribute_name.S }
          }
        }
      })
    });

    // ...and Destroy
    return removeItems(params);

  } catch (err) {
    console.error('deleteAaiAttributesFromTable():', err, tableName);
    throw err;
  }
}

async function sendCommand(command: DeleteItemCommand | BatchWriteItemCommand) {
  const client = new DynamoDBClient({});
  return client.send(command as any);
}

async function removeItem(params: DeleteItemCommandInput) {
  return sendCommand(new DeleteItemCommand(params));
}

async function removeItems(params: BatchWriteItemCommandInput) {
  return sendCommand(new BatchWriteItemCommand(params))
}

