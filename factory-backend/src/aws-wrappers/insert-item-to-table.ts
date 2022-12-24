import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { AnswerSet, buildAnswerSetKeyValue } from '../datamodels/answer-set';
import {
  answerCountToString,
  AnswerSummary,
} from '../datamodels/answer-summary';
import { GroupMember } from '../datamodels/group-member';
import { PostGroupRequestBody } from '../datamodels/organizations';
import { Progress } from '../datamodels/progress';


export async function insertAnswerSetToTable(
  tableName: string,
  data: AnswerSet
): Promise<PutItemCommandOutput> {
  try {
    return putItem(tableName, {
      group_id: { S: data.key.organization_ids[0] }, //Partition key
      answer_id: { S: buildAnswerSetKeyValue(data.key) }, //Sort key
      data: { S: JSON.stringify(data.answers) }, //Data
      completed_categories: { S: JSON.stringify(data.completed_categories) },
      questionnaire_version: { N: `${data.questionnaire_version}` }
    });
  } catch (err) {
    console.error('insertAnswerSetToTable(): error:', err, tableName);
    throw err;
  }
}

export async function insertAnswersSummaryToTable(
  tableName: string,
  data: AnswerSummary
): Promise<PutItemCommandOutput> {
  try {
    return await putItem(tableName, {
      cat_id: { S: data.category_id + '#' + data.questionnaire_id }, //Partition key
      org_id: { S: data.organization_id.join('#') }, //Sort key
      data: { S: answerCountToString(data.answers_by_question) }, //Data
      completed_users: { S: JSON.stringify(data.completed_users) },
    });
  } catch (err) {
    console.error('insertAnswersSummaryToTable(): error:', err, tableName);
    throw err;
  }
}

export async function insertProgressToTable(
  tableName: string,
  data: Progress
): Promise<PutItemCommandOutput> {
  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        org_id: { S: data.organization_ids!.join('#') }, //Partition key
        questionnaire_id: { S: data.questionnaire_id! }, //Sort key
        data: { S: JSON.stringify(data.category_statuses) }, //Data
      },
    });
    console.info(
      'insertProgressToTable(): Putting data to table, data, command',
      tableName,
      data,
      command
    );
    const results = await sendCommand(command);
    console.info('insertProgressToTable(): put data to table', results);
    return results;
  } catch (err) {
    console.error('insertProgressToTable(): error:', err, tableName);
    throw err;
  }
}

export async function insertGroupToTable(
  tableName: string,
  group: PostGroupRequestBody
): Promise<PutItemCommandOutput> {
  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        organization_id: { S: group.id }, //Sort key
        parent_organization_id: { S: group.parent_organization_id }, //Partition key
        organization_name: { S: group.name }, //Org name (LSI)
        valid_until: { S: group.valid_until }, //Expiration date (LSI)
        pin: { S: group.pin },
        data: { S: JSON.stringify(group) }, //Data
      },
    });

    console.debug(
      'insertGroupToTable(): Putting data to table, data, command',
      tableName,
      group,
      command
    );

    return sendCommand(command);
  } catch (err) {
    console.error('insertGroupToTable(): error:', err, tableName);
    throw err;
  }
}

export async function insertGroupMemberToTable(
  tableName: string,
  data: GroupMember
): Promise<PutItemCommandOutput> {
  return putItem(tableName, {
    group_id: { S: data.group_id }, //Partition key
    user_id: { S: data.user_id }, // sort key
  });
}

export async function insertUserSettingsToTable(
  tableName: string,
  user_id: string,
  data: Record<string, any>
): Promise<PutItemCommandOutput> {
  return putItem(tableName, {
    user_id: { S: user_id },
    data: { S: JSON.stringify(data) },
  });
}

/**
 * Inserts attribute to dynamodb table
 * @param tableName Table name
 * @param user_id User id
 * @param attribute_name Attribute name
 * @param data Attribute data
 */
export async function insertAttributeToTable(
  tableName: string,
  user_id: string,
  attribute_name: string,
  data: Record<string, any>
): Promise<PutItemCommandOutput> {
  return putItem(tableName, {
    user_id: {S: user_id},
    attribute_name: {S: attribute_name},
    data: {S: JSON.stringify(data)},
  });
}

async function sendCommand(command: PutItemCommand) {
  const client = new DynamoDBClient({});
  return client.send(command);
}

async function putItem(
  tableName: string,
  data: Record<string, AttributeValue>
) {
  return sendCommand(
    new PutItemCommand({
      TableName: tableName,
      Item: data,
    })
  );
}
