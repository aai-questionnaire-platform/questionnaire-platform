import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { CategoryService } from './category-service';
import { QuestionService } from './question-service';
import { SoftDeleteService } from './soft-delete-service';
import { AdminUserService } from './admin-user-service';
import { QuestionnaireService } from './questionnaire-service';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./question-service.ts');
jest.mock('./soft-delete-service.ts');
jest.mock('./admin-user-service');
jest.mock('./questionnaire-service');

describe('CategoryService', () => {
  const mApolloClient = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  const mQuestionService = QuestionService as jest.MockedClass<
    typeof QuestionService
  >;

  const mDeleteService = SoftDeleteService as jest.MockedClass<
    typeof SoftDeleteService
  >;

  jest
    .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
    .mockReturnValue(['game-1']);

  jest
    .spyOn(AdminUserService.prototype as any, 'userHasGame')
    .mockReturnValue(true);

  jest
    .spyOn(AdminUserService.prototype as any, 'getActiveGameId')
    .mockReturnValue('game-1');

  createApolloClientMock.mockImplementation(
    jest.fn().mockReturnValue(mApolloClient)
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteCategory', () => {
    it('should remove category by id', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );
      const getCategoryResult = {
        data: { getCategory: { data: { id: '1' } } },
      };

      mApolloClient.query.mockResolvedValueOnce(getCategoryResult);

      jest
        .spyOn(mQuestionService.prototype, 'listQuestionsByCategoryUuid')
        .mockResolvedValue([]);

      await service.deleteCategory('1');

      expect(mApolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { revision: '1' },
      });

      expect(mDeleteService.mock.instances[0].deleteModel).toHaveBeenCalledWith(
        '1',
        'Category'
      );
    });

    it('should return error if fetching category fails', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );
      const getCategoryResult = { error: { code: '', message: '' } };

      mApolloClient.query.mockResolvedValueOnce(getCategoryResult);

      const result = await service.deleteCategory('1');

      expect(result).toEqual({
        error: {
          code: '',
          message: '',
        },
      });
    });

    it('should remove related questions', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.query.mockResolvedValueOnce({
        data: { getCategory: { data: { id: '1' } } },
      });

      jest
        .spyOn(mQuestionService.prototype, 'listQuestionsByCategoryUuid')
        .mockResolvedValue([{ id: '2' } as any, { id: '3' } as any]);

      await service.deleteCategory('1');

      expect(
        mQuestionService.mock.instances[0].removeQuestion
      ).toHaveBeenCalledTimes(2);

      expect(
        mQuestionService.mock.instances[0].removeQuestion
      ).toHaveBeenCalledWith('2');

      expect(
        mQuestionService.mock.instances[0].removeQuestion
      ).toHaveBeenCalledWith('3');
    });

    it('should return error if fetching question fails', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.query.mockResolvedValueOnce({
        data: { getCategory: { data: { id: '1' } } },
      });

      jest
        .spyOn(mQuestionService.prototype, 'listQuestionsByCategoryUuid')
        .mockRejectedValue({
          error: {
            code: '',
            message: '',
          },
        });

      const result = await service.deleteCategory('1');

      expect(result).toEqual({
        error: {
          code: '',
          message: '',
        },
      });
    });

    it('should return the result from delete question mutation', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );
      const deleteResult = { data: { deleteCategory: { data: { id: '1' } } } };

      mApolloClient.query.mockResolvedValueOnce({
        data: { getCategory: { data: { id: '1' } } },
      });

      jest
        .spyOn(mQuestionService.prototype, 'listQuestionsByCategoryUuid')
        .mockResolvedValue([]);

      jest
        .spyOn(mDeleteService.prototype, 'deleteModel')
        .mockResolvedValue(deleteResult);

      const result = await service.deleteCategory('1');
      expect(result).toEqual(deleteResult);
    });

    it('delete-mutation is called with given revision', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          deleteCategory: {
            data: true,
            error: null,
          },
        },
      });

      await service.deleteMutation('1#0001');

      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: '1#0001',
        },
      });
    });
  });

  describe('sortCategories', () => {
    it('should sort categories correctly', async () => {
      const service = new CategoryService(
        new AdminUserService('', '', '', '', '')
      );

      const categoriesToSort = [
        {
          id: '1',
          entryId: '1#0001',
          uuid: '1',
          description: 'Category 1',
          questionnaireUuid: '1',
          entryMessages: [],
          exitMessages: [],
          sortIndex: 2,
          questionnaireRevision: '',
          gameUuid: 'game-1',
          meta: {
            status: 'draft',
          },
        },
        {
          id: '2',
          entryId: '2#0001',
          uuid: '2',
          description: 'Category 2',
          questionnaireUuid: '1',
          entryMessages: [],
          exitMessages: [],
          sortIndex: 1,
          questionnaireRevision: '',
          gameUuid: 'game-1',
          meta: {
            status: 'draft',
          },
        },
      ];

      mApolloClient.query.mockResolvedValueOnce({
        data: { getCategory: { data: categoriesToSort[0] } },
      });

      mApolloClient.query.mockResolvedValueOnce({
        data: { getCategory: { data: categoriesToSort[1] } },
      });

      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateCategory: { data: categoriesToSort[1] } },
      });

      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateCategory: { data: categoriesToSort[0] } },
      });

      const response = await service.sortCategories(categoriesToSort);

      expect(response).toEqual({
        data: {
          sortCategories: { data: [categoriesToSort[1], categoriesToSort[0]] },
        },
      });

      expect(mApolloClient.mutate).toHaveBeenCalledTimes(2);
      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: '1',
          data: R.omit(['id', 'entryId', 'meta'], categoriesToSort[0]),
        },
      });

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(2, {
        mutation: expect.any(Object),
        variables: {
          revision: '2',
          data: R.omit(['id', 'entryId', 'meta'], categoriesToSort[1]),
        },
      });
    });
  });
});
