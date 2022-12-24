/**
 * AnswerSet key structure
 */
export interface AnswerSetKey {
  /**
   * Ordered list of organization ids in top-down order, e.g. "[0]Kuopio[1]Tuomiokirkkosrk[2]Kesäryhmä1"
   *
   * @minItems 1
   * @uniqueItems true
   */
  organization_ids: string[];

  /**
   * Link to a specific questionnaire
   */
  questionnaire_id: string;
  user_id?: string;
}

/**
 * Represents an answer linked to a question in questionnaire
 */
export interface Answer {
  question_id: string;
  answer_value: any;
}

/**
 * Interface for answering a set of questions
 */
export interface AnswerSet {
  key: AnswerSetKey;
  /**
   * @minItems 1
   */
  answers: Answer[];
  completed_categories?: string[];
  questionnaire_version: string;
}

export function buildAnswerSetKeyValue(answerSetKey: AnswerSetKey): string {
  return (
    answerSetKey.organization_ids
      // remove the first entry from the organization ids list
      // for it is used as primary key not as a part of the sort key
      .slice(1)
      .concat([
        answerSetKey.user_id!,
        answerSetKey.user_id! && answerSetKey.questionnaire_id,
      ])
      .filter(Boolean)
      .join('#')
  );
}

export function parseAnswerSetKeyValue(
  topLevelOrg: string,
  answerSetKeyValue: string
): AnswerSetKey {
  const splitted = answerSetKeyValue.split('#');
  const organizationIds = [topLevelOrg].concat(
    splitted.slice(0, splitted.length - 2)
  );
  const questionnaire_id = splitted[splitted.length - 1];
  const user_id = splitted[splitted.length - 2];

  return {
    organization_ids: organizationIds,
    questionnaire_id: questionnaire_id,
    user_id: user_id,
  };
}

export function mergeAnswerLists(
  oldList: Answer[],
  newList: Answer[]
): Answer[] {
  // add all to be updated questions' ids to the set
  const ids = new Set<string>();
  newList.forEach((item) => ids.add(item.question_id));

  //Sort the list by question id
  return oldList
    .filter((item) => !ids.has(item.question_id))
    .concat(newList)
    .sort((a, b) => (a.question_id > b.question_id ? 1 : -1));
}
