import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import * as R from 'ramda';
import { AnswerSet, parseAnswerSetKeyValue } from '../datamodels/answer-set';
import {
  answerCountFromString,
  AnswerSummary,
} from '../datamodels/answer-summary';
import { GroupMember } from '../datamodels/group-member';
import { Group } from '../datamodels/organizations';
import { CategoryStatus, Progress } from '../datamodels/progress';

/**
 * Utility method to retrieve a single AnswerSet object from DynamoDB using exact part key  + sortkey.
 * @param tableName     Name of table
 * @param keyFieldName  Primary key field name
 * @param keyValue      Primary key value
 * @param sortKeyName   Name of the sort key in table
 * @param sortKeyValue  Value for the beginning of the sortkey to return
 * @returns Array of Type
 */
export async function getAnswersFromTable(
  tableName: string,
  keyFieldName: string,
  keyValue: string,
  sortKeyName: string,
  sortKeyValue: string
): Promise<AnswerSet | undefined> {
  try {
    // Set the parameters
    const params = {
      //Construct the keycondinition expression
      KeyConditionExpression: '#key' + ' = :k and ' + 'begins_with(#part, :s)',
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: keyValue },
        ':s': { S: sortKeyValue },
      },
      ExpressionAttributeNames: {
        '#key': keyFieldName,
        '#part': sortKeyName,
      },
      TableName: tableName,
    };

    const item = await getSingleItem(params);

    if (!item) {
      console.warn('No answers found with given key');
      return undefined;
    }

    return parseAnswerSet(item);
  } catch (err) {
    console.error('getAnswersFromTable: error:', err, tableName);
    throw err;
  }
}

/**
 * Utility method to retrieve a list of AnswerSets from DynamoDB
 * @param tableName     Name of table
 * @param keyFieldName  Primary key field name
 * @param keyValue      Primary key value
 * @param sortKeyName   Name of the sort key in table
 * @param sortKeyValue  Value for the beginning of the sortkey to return
 * @returns Array of Type
 */
export async function findAnswersFromTable(
  tableName: string,
  keyFieldName: string,
  keyValue: string,
  sortKeyName: string,
  sortKeyValue: string
): Promise<AnswerSet[]> {
  try {
    // Set the parameters
    const params = {
      //Construct the keycondinition expression
      KeyConditionExpression: '#key' + ' = :k and ' + 'begins_with(#part, :s)',
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: keyValue },
        ':s': { S: sortKeyValue },
      },
      ExpressionAttributeNames: {
        '#key': keyFieldName,
        '#part': sortKeyName,
      },
      TableName: tableName,
    };

    const items = await listItems(params);

    console.debug(
      `findAnswersFromTable(): found items:`,
      (items || []).map(R.omit(['data']))
    );

    return items?.map(parseAnswerSet) || [];
  } catch (err) {
    console.error('getAnswersFromTable: error:', err, tableName);
    throw err;
  }
}

function parseAnswerSet(item: { [key: string]: AttributeValue }) {
  return {
    answers: JSON.parse(item.data.S!),
    key: parseAnswerSetKeyValue(item.group_id.S!, item.answer_id.S!),
    completed_categories: JSON.parse(item.completed_categories?.S || '[]'),
    questionnaire_version: item.questionnaire_version.S!
  };
}

/**
 * Utility method to retrieve a single AnswerSummary object from DynamoDB using exact part key  + sortkey.
 * @param tableName     Name of table
 * @param keyFieldName  Primary key field name
 * @param keyValue      Primary key value
 * @param sortKeyName   Name of the sort key in table
 * @param sortKeyValue  Value for the beginning of the sortkey to return
 * @returns Array of Type
 */
export async function getAnswersSummaryFromTable(
  tableName: string,
  keyFieldName: string,
  keyValue: string,
  sortKeyName: string,
  sortKeyValue: string
): Promise<AnswerSummary[] | null> {
  try {
    // Set the parameters
    const params = {
      //Construct the keycondinition expression
      KeyConditionExpression: '#key' + ' = :k and ' + 'begins_with(#part, :s)',
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: keyValue },
        ':s': { S: sortKeyValue },
      },
      ExpressionAttributeNames: {
        '#key': keyFieldName,
        '#part': sortKeyName,
      },
      TableName: tableName,
    };

    //Wait for query results
    const results = await listItems(params);

    //Parse results and return; we should only get one item
    const item = results?.[0];

    if (!item) {
      console.warn('No summary found with given key');
      return null;
    }

    return (results || []).map((i) => {
      const category_id = i.cat_id!.S!.split('#')[0];
      const questionnaire_id = i.cat_id!.S!.split('#')[1];
      const org_ids = i.org_id!.S!.split('#');
      const answers_by_question = i.data!.S!;
      const completed_users = JSON.parse(i.completed_users?.S || '[]');
      return {
        answers_by_question: answerCountFromString(answers_by_question),
        category_id: category_id,
        questionnaire_id: questionnaire_id,
        organization_id: org_ids,
        completed_users,
      };
    });
  } catch (err) {
    console.error('getAnswersSummaryFromTable: error:', err, tableName);
    throw err;
  }
}

export async function getProgressFromTable(
  tableName: string,
  keyFieldName: string,
  keyValue: string,
  sortKeyName: string,
  sortKeyValue: string
): Promise<Progress | undefined> {
  try {
    // Set the parameters
    const params = {
      //Construct the keycondinition expression
      KeyConditionExpression: '#key' + ' = :k and ' + 'begins_with(#part, :s)',
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: keyValue },
        ':s': { S: sortKeyValue },
      },
      ExpressionAttributeNames: {
        '#key': keyFieldName,
        '#part': sortKeyName,
      },
      TableName: tableName,
    };

    const result = await getSingleItem(params);

    //No progress, let's start with default setup
    if (!result) {
      return undefined;
    }

    //Parse results and return. We really expect only one item
    return {
      category_statuses: JSON.parse(result.data.S!) as CategoryStatus[],
      questionnaire_id: sortKeyValue,
    };
  } catch (err) {
    console.error('getProgressFromTable: error:', err, tableName);
    throw err;
  }
}

export async function getGroupFromTable(
  tableName: string,
  indexName: string | undefined,
  keyFieldName: string,
  keyValue: string,
  sortKeyName?: string,
  sortKeyValue?: string
): Promise<Group | undefined> {
  return sortKeyName && sortKeyValue
    ? getGroupWithPrimaryAndSortKey(
        tableName,
        indexName,
        keyFieldName,
        keyValue,
        sortKeyName,
        sortKeyValue
      )
    : getGroupWithPrimaryKeyOnly(tableName, indexName, keyFieldName, keyValue);
}

async function getGroupWithPrimaryAndSortKey(
  tableName: string,
  indexName: string | undefined,
  keyFieldName: string,
  keyValue: string,
  sortKeyName: string,
  sortKeyValue: string
) {
  return executeGetGroupCommand({
    TableName: tableName,
    IndexName: indexName,
    //Construct the keycondinition expression
    KeyConditionExpression: '#key = :k and #part = :s',
    //Define the "bind variable" values
    ExpressionAttributeValues: {
      ':k': { S: keyValue },
      ':s': { S: sortKeyValue },
    },
    ExpressionAttributeNames: {
      '#key': keyFieldName,
      '#part': sortKeyName,
    },
  });
}

async function getGroupWithPrimaryKeyOnly(
  tableName: string,
  indexName: string | undefined,
  keyFieldName: string,
  keyValue: string
) {
  return executeGetGroupCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: '#key = :k',
    ExpressionAttributeValues: { ':k': { S: keyValue } },
    ExpressionAttributeNames: { '#key': keyFieldName },
  });
}

async function executeGetGroupCommand(params: QueryCommandInput) {
  try {
    const result = await getSingleItem(params as any);

    //No progress, let's start with default setup
    if (!result || !result.data.S) {
      return undefined;
    }

    //Parse results and return. We really expect only one item
    return JSON.parse(result.data.S) as Group;
  } catch (err) {
    console.error('getGroupFromTable: error:', err, params.TableName);
    throw err;
  }
}

export async function getGroupsFromTable(
  tableName: string,
  sortFieldName: string,
  keyFieldName: string,
  keyValue: string
): Promise<Group[]> {
  try {
    // Set the parameters
    const params = {
      //Construct the keycondinition expression
      KeyConditionExpression: '#key = :k and #validUntil >= :valid',

      IndexName: 'valid-until-index',

      //Define the "bind variable" values138
      ExpressionAttributeValues: {
        ':k': { S: keyValue },
        ':valid': { S: new Date().toISOString() },
      },
      ExpressionAttributeNames: {
        '#key': keyFieldName,
        '#validUntil': sortFieldName,
      },
      TableName: tableName,
    };

    console.debug(
      'getGroupsFromTable(): Searching table',
      tableName,
      'with key index',
      keyFieldName,
      '=',
      keyValue,
      'and sort index',
      sortFieldName
    );

    const result = await listItems(params);

    console.debug('getGroupsFromTable(): found', result);

    if (!result) {
      console.warn('getGroupsFromTable(): No items found');
      return [];
    }

    return result.map((item) => JSON.parse(item.data.S!));
  } catch (err) {
    console.error('getGroupsFromTable: error:', err, tableName);
    throw err;
  }
}

export async function getUserSettingsFromTable(
  tableName: string,
  user_id: string
) {
  try {
    const params = {
      TableName: tableName,
      //Construct the keycondinition expression
      KeyConditionExpression: `user_id=:k`,
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: user_id },
      },
    };

    const result = await getSingleItem(params);
    return JSON.parse(result?.data.S || '{}');
  } catch (err) {
    console.error('getUserSettingsFromTable():', err, tableName);
    throw err;
  }
}

export async function getGroupMembersFromTable(
  tableName: string,
  group_id: string
) {
  try {
    const params = {
      TableName: tableName,
      //Construct the keycondinition expression
      KeyConditionExpression: `group_id=:k`,
      //Define the "bind variable" values
      ExpressionAttributeValues: {
        ':k': { S: group_id },
      },
    };

    const result = await listItems(params);
    const groupMembers: GroupMember[] = (result || []).map((item) => {
      return {
        group_id: item.group_id.S!,
        user_id: item.user_id.S!,
      };
    });

    console.debug(
      'getGroupMembersFromTable(): found',
      result,
      'and parsed',
      groupMembers
    );

    return groupMembers;
  } catch (err) {
    console.error('getGroupMembersFromTable():', err, tableName);
    throw err;
  }
}

/**
 * Get user attribute(s) from dynamo db
 * @param tableName
 * @param user_id
 */
export async function getAaiAttributesFromTable(
  tableName: string,
  user_id: string
) {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: `user_id=:k`,
      ExpressionAttributeValues: {
        ':k': {S: user_id}
      },
    }

    const result = await listItems(params);
    const attributes = result?.map((item) => {
      return {
        [item.attribute_name.S as string]: JSON.parse(item.data.S as string)
      }
    });
    return Object.assign({}, ...attributes!)
  } catch (err) {
    console.error('getAaiAttributeFromTable():', err, tableName);
    throw err;
  }
}

export async function getAccessTokenFromTable(
  tableName: string,
  userId: string,
  nextAuthProvider: string
) {
  if (!tableName || !userId || !nextAuthProvider) {
    console.error('getAccessTokenFromTable(): Mandatory parameters not set');
    return;
  }

  const params = {
    TableName: tableName,
    IndexName: 'GSI1',
    //Construct the keycondinition expression
    KeyConditionExpression: `GSI1PK = :pk AND GSI1SK = :sk`,
    //Define the "bind variable" values
    ExpressionAttributeValues: {
      ':pk': {S: `ACCOUNT#${nextAuthProvider}`},
      ':sk': {S: `ACCOUNT#${userId}`}
    },
  };

  const result = await getSingleItem(params)
  return result?.access_token?.S;
}

function runQuery(params: QueryCommandInput) {
  const client = new DynamoDBClient({});
  const command = new QueryCommand(params);
  return client.send(command);
}

/**
 * Get a single item from the dynamo db.
 * @async
 * @param params
 * @throws if the query returns more than one result
 * @returns First item from the result list
 */
async function getSingleItem(params: QueryCommandInput) {
  const results = await runQuery(params);
  const items = results.Items || [];

  if (items.length > 1) {
    throw new Error(`Expected exactly 1 result, got ${items.length || 0}`);
  }

  return items[0];
}

/**
 * Get a list of items from a dynamo db
 * @async
 * @param params
 * @returns
 */
export async function listItems(params: QueryCommandInput) {
  const results = await runQuery(params);
  return results.Items;
}
