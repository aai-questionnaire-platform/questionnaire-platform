import * as R from 'ramda';

/**
 * Creates an matcher lens that finds an entry from an array whose [propName] matches the given [propValue]
 * @param propName
 * @returns
 */
export const lensMatch = R.curry((propName: string, propValue: any) =>
  R.lens(R.find(R.propEq(propName, propValue)), (val, arr) =>
    // either update the item in current index or append the item to the end of the list
    R.update(R.findIndex(R.propEq(propName, propValue), arr), val as any, arr)
  )
);

/**
 * Call lens view and return default value if falsy
 * @param defaultValue
 * @param lens
 * @param data
 * @returns
 */
export const viewOr = R.curry((defaultValue: any, lens: any, data: any) =>
  R.pipe(R.view(lens), R.or(R.__, defaultValue))(data)
);

export const queryDataLens = (queryName: string) =>
  R.lensPath(['data', queryName, 'data']);

export const listGroupsDataLens = R.lensPath(['listGroups', 'data']);

export const listQuestionnairesDataLens = R.lensPath([
  'listQuestionnaires',
  'data',
]);

const questionnaireLens = (questionnaireUuid: string) =>
  R.compose<any, any>(
    listQuestionnairesDataLens,
    lensMatch('uuid', questionnaireUuid)
  );

export const listOrganizationsDataLens = R.lensPath([
  'listOrganizations',
  'data',
]);

export const groupLens = (id: string) =>
  R.compose<any, any>(listGroupsDataLens, lensMatch('entryId', id));

export const listCategoriesLens = R.lensPath(['listCategories', 'data']);

export const categoryLens = (categoryUuid: string) =>
  R.compose<any, any>(listCategoriesLens, lensMatch('uuid', categoryUuid));

export const questionnaireStatusLens = (questionnaireUuid: string) =>
  R.compose<any, any, any>(questionnaireLens(questionnaireUuid), statusLens);

export const categoryStatusLens = (categoryUuid: string) =>
  R.compose<any, any, any>(categoryLens(categoryUuid), statusLens);

export const listQuestionsLens = R.lensPath(['listQuestions', 'data']);

export const listTopicsLens = R.lensPath(['listTopics', 'data']);

export const listQuestionTypesLens = R.lensPath(['listQuestionTypes', 'data']);

export const questionLens = (questionUuid: string) =>
  R.compose<any, any>(listQuestionsLens, lensMatch('uuid', questionUuid));

export const listOptionsLens = R.lensPath(['listOptions', 'data']);

export const optionLens = (optionUuid: string) =>
  R.compose<any, any>(listOptionsLens, lensMatch('uuid', optionUuid));

export const statusLens = R.lensPath(['meta', 'status']);
