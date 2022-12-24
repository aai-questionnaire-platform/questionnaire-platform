import * as R from 'ramda';

import { CategoryState } from '@/enums';

import * as commonUtils from '../../util';
import { findActiveCategories } from './util';

jest.mock('../../util');

describe('AdminGroups/util', () => {
  describe('findActiveCategories', () => {
    it('should return an empty array in case of empty categories array', () => {
      const result = findActiveCategories({} as any, []);
      expect(result).toEqual([]);
    });

    it('should return an empty array in case of empty state array', () => {
      const categories = [{ id: 1 }] as any;

      jest
        .spyOn(commonUtils, 'combineCategoryWithProgress')
        .mockReturnValueOnce(R.identity as any);

      const result = findActiveCategories({} as any, categories);
      expect(result).toEqual([]);
    });

    it('should return categories that are UNLOCKED', () => {
      const categoriesWithState: any = [{ state: CategoryState.UNLOCKED }];

      jest
        .spyOn(commonUtils, 'combineCategoryWithProgress')
        .mockReturnValueOnce(R.identity as any);

      const result = findActiveCategories({} as any, categoriesWithState);
      expect(result.length).toBe(1);
    });

    it('should return categories that are COMPLETED', () => {
      const categoriesWithState: any = [{ state: CategoryState.COMPLETED }];

      jest
        .spyOn(commonUtils, 'combineCategoryWithProgress')
        .mockReturnValueOnce(R.identity as any);

      const result = findActiveCategories({} as any, categoriesWithState);
      expect(result.length).toBe(1);
    });

    it('should return not categories that are LOCKED', () => {
      const categoriesWithState: any = [{ state: CategoryState.LOCKED }];

      jest
        .spyOn(commonUtils, 'combineCategoryWithProgress')
        .mockReturnValueOnce(R.identity as any);

      const result = findActiveCategories({} as any, categoriesWithState);
      expect(result.length).toBe(0);
    });

    it('should return not categories that are APPROVED', () => {
      const categoriesWithState: any = [{ state: CategoryState.APPROVED }];

      jest
        .spyOn(commonUtils, 'combineCategoryWithProgress')
        .mockReturnValueOnce(R.identity as any);

      const result = findActiveCategories({} as any, categoriesWithState);
      expect(result.length).toBe(0);
    });
  });
});
