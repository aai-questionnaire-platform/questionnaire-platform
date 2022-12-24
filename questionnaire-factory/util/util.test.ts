import { CategoryState } from '@/enums';
import { Group, Organization, Progress } from '@/types';
import {
  combineCategoryWithProgress,
  combineMultiAnswers,
  getHierarchicalIdOfGroup,
} from '@/util';

describe('Category/utils', () => {
  describe('combineCategoryWithProgress', () => {
    const questions = [{ id: '1' }];
    const category: any = { id: '1', questions };

    it('should return categories with progress', () => {
      const progress = {
        questionnaire_id: '1',
        organization_ids: ['1'],
        category_statuses: [{ category_id: '1', state: 1 }],
        completionCounts: { '1': 1 },
        groupMemberCount: 2,
      } as Progress;

      const expected = {
        id: '1',
        questions,
        state: CategoryState.LOCKED,
        completionCount: 1,
        groupMemberCount: 2,
      };

      expect(combineCategoryWithProgress(progress, category)).toEqual(expected);
    });

    it('should default groupMemberCount to zero', () => {
      const progress = {
        questionnaire_id: '1',
        organization_ids: ['1'],
        category_statuses: [{ category_id: '1', state: 1 }],
        completionCounts: { '1': 1 },
      } as Progress;

      const actual = combineCategoryWithProgress(progress, category);
      expect(actual.groupMemberCount).toBe(0);
    });

    it('should default completionCount to zero', () => {
      const progress = {
        questionnaire_id: '1',
        organization_ids: ['1'],
        category_statuses: [{ category_id: '1', state: 1 }],
      } as Progress;

      const actual = combineCategoryWithProgress(progress, category);
      expect(actual.completionCount).toBe(0);
    });

    it('should default state to LOCKED', () => {
      const progress = {
        questionnaire_id: '1',
        organization_ids: ['1'],
        category_statuses: [],
      } as Progress;

      const actual = combineCategoryWithProgress(progress, category);
      expect(actual.state).toBe(CategoryState.LOCKED);
    });
  });

  describe('combineMultiAnswers', () => {
    it('should return an empty array if answers is undefined', () => {
      expect(combineMultiAnswers()).toEqual([]);
    });

    it('should return an empty array if answers is empty', () => {
      expect(combineMultiAnswers([])).toEqual([]);
    });

    it('should combine multiple answers by question_id', () => {
      const answers = [
        { question_id: '1', answer_value: '1' },
        { question_id: '2', answer_value: '1' },
        { question_id: '1', answer_value: '2' },
      ];

      const expectedAnswers = [
        { question_id: '1', answer_value: '1,2' },
        { question_id: '2', answer_value: '1' },
      ];

      expect(combineMultiAnswers(answers)).toEqual(expectedAnswers);
    });
  });

  describe('getHierarchicalIdOfGroup', () => {
    it('should return ids from depth 0', () => {
      const organizations = [] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '1',
        parent_organization_id: '11',
      } as Group);
      expect(result).toEqual(['1']);
    });

    it('should return ids from depth 1', async () => {
      const organizations = [{ id: '11' }] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '111',
        parent_organization_id: '11',
      } as Group);
      expect(result).toEqual(['11', '111']);
    });

    it('should return ids from depth 2', async () => {
      const organizations = [
        { id: '1', children: [{ id: '11' }] },
      ] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '111',
        parent_organization_id: '11',
      } as Group);
      expect(result).toEqual(['1', '11', '111']);
    });

    it('should return ids from depth 3', async () => {
      const organizations = [
        { id: '1', children: [{ id: '11', children: [{ id: '111' }] }] },
      ] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '1111',
        parent_organization_id: '111',
      } as Group);
      expect(result).toEqual(['1', '11', '111', '1111']);
    });

    it('should return ids from depth 4', async () => {
      const organizations = [
        {
          id: '1',
          children: [
            { id: '11', children: [{ id: '111', children: [{ id: '1111' }] }] },
          ],
        },
      ] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '11111',
        parent_organization_id: '1111',
      } as Group);
      expect(result).toEqual(['1', '11', '111', '1111', '11111']);
    });

    it('should return ids from from the top of the tree', async () => {
      const organizations = [
        { id: '1', children: [{ id: '11', children: [{ id: '111' }] }] },
      ] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '11',
        parent_organization_id: '1',
      } as Group);
      expect(result).toEqual(['1', '11']);
    });

    it('should return ids from from the middle of the tree', async () => {
      const organizations = [
        { id: '1', children: [{ id: '11', children: [{ id: '111' }] }] },
      ] as Organization[];
      const result = getHierarchicalIdOfGroup(organizations, {
        id: '111',
        parent_organization_id: '11',
      } as Group);
      expect(result).toEqual(['1', '11', '111']);
    });
  });
});
