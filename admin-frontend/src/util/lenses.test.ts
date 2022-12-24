import * as R from 'ramda';
import * as lenses from './lenses';

describe('viewOr', () => {
  it("should return the lens value if it's not undefined", () => {
    const data = { a: { b: 'c' } };
    const result = lenses.viewOr('defaultValue', R.lensPath(['a', 'b']), data);
    expect(result).toBe('c');
  });

  it('should return the default value if the lens value is undefined', () => {
    const data = { a: {} };
    const result = lenses.viewOr('defaultValue', R.lensPath(['a', 'b']), data);
    expect(result).toBe('defaultValue');
  });
});

describe('listGroupsDataLens', () => {
  it('should return data from listGroups', () => {
    const data = { listGroups: { data: [] } };
    const result = R.view(lenses.listGroupsDataLens, data);
    expect(result).toBe(data.listGroups.data);
  });
});

describe('groupLens', () => {
  it('should return group by entryId', () => {
    const group = { entryId: '1' };
    const data = { listGroups: { data: [group] } };
    const result = R.view(lenses.groupLens('1'), data);
    expect(result).toBe(group);
  });

  it('should return undefined if such group is not found', () => {
    const group = { entryId: '1' };
    const data = { listGroups: { data: [group] } };
    const result = R.view(lenses.groupLens('2'), data);
    expect(result).toBe(undefined);
  });
});

describe('listQuestionnairesDataLens', () => {
  it('should return data from listQuestionnaires', () => {
    const data = { listQuestionnaires: { data: [] } };
    const result = R.view(lenses.listQuestionnairesDataLens, data);
    expect(result).toBe(data.listQuestionnaires.data);
  });
});

describe('listOrganizationsDataLens', () => {
  it('should return data from listOrganizationsDataLens', () => {
    const data = { listOrganizations: { data: [] } };
    const result = R.view(lenses.listOrganizationsDataLens, data);
    expect(result).toBe(data.listOrganizations.data);
  });
});

describe('listCategoriesLens', () => {
  it('should return data from listCategoriesLens', () => {
    const data = { listCategories: { data: [] } };
    const result = R.view(lenses.listCategoriesLens, data);
    expect(result).toBe(data.listCategories.data);
  });
});

describe('categoryLens', () => {
  it('should return category by uuid', () => {
    const category = { uuid: '1' };
    const data = { listCategories: { data: [category] } };
    const result = R.view(lenses.categoryLens('1'), data);
    expect(result).toBe(category);
  });

  it('should return undefined if such category is not found', () => {
    const category = { uuid: '1' };
    const data = { listCategories: { data: [category] } };
    const result = R.view(lenses.categoryLens('2'), data);
    expect(result).toBe(undefined);
  });
});

describe('listQuestionsLens', () => {
  it('should return data from listQuestions', () => {
    const data = { listQuestions: { data: [] } };
    const result = R.view(lenses.listQuestionsLens, data);
    expect(result).toBe(data.listQuestions.data);
  });
});
