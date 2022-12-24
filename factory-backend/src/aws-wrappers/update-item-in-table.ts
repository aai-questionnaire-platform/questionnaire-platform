import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { Group } from '../datamodels/organizations';

export async function updateGroupInTable(
  tableName: string,
  group: Group
): Promise<UpdateItemCommandOutput> {
  try {
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        parent_organization_id: { S: group.parent_organization_id },
        organization_id: { S: group.id },
      },
      UpdateExpression: 'SET #N = :group_name, #D = :group_data, #U = :group_valid_until',
      ExpressionAttributeNames: {
        '#N': 'organization_name',
        '#D': 'data',
        '#U': 'valid_until'
      },
      ExpressionAttributeValues: {
        ':group_name': { S: group.name },
        ':group_data': { S: JSON.stringify(group) },
        ':group_valid_until': { S: group.valid_until }
      },
      ReturnValues: 'ALL_NEW',
    });

    console.debug(
      'updateGroupInTable(): Updating data in table, command',
      tableName,
      JSON.stringify(command)
    );

    return sendCommand(command);
  } catch (err) {
    console.error('updateGroupInTable(): error:', err, tableName);
    throw err;
  }
}

async function sendCommand(command: UpdateItemCommand) {
  const client = new DynamoDBClient({});
  return client.send(command);
}
