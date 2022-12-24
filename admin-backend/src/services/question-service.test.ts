import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { QuestionService } from './question-service';
import { OptionsService } from './options-service';
import { SoftDeleteService } from './soft-delete-service';
import {
  questionDtoWithOptions,
  questionDtoWithoutOptions,
  draftQuestionWithoutOptions,
  draftQuestionWithNewOption,
  draftQuestionWithExistingOption,
} from '../../test/questions';
import { CategoryService } from './category-service';
import { AdminUserService } from './admin-user-service';
import { Category } from '../types';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./options-service.ts');
jest.mock('./soft-delete-service.ts');
jest.mock('./category-service.ts');
jest.mock('./admin-user-service');

describe('QuestionService', () => {
  const mApolloClient = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  const mOptionsService = OptionsService as jest.MockedClass<
    typeof OptionsService
  >;

  const mDeleteService = SoftDeleteService as jest.MockedClass<
    typeof SoftDeleteService
  >;

  const mCategoryService = CategoryService as jest.MockedClass<
    typeof CategoryService
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
    mApolloClient.mutate = jest.fn();
    mApolloClient.query = jest.fn();
  });

  describe('listQuestionsByCategoryUuid', () => {
    it('should call query with correct variables', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      mApolloClient.query.mockResolvedValueOnce({
        data: { listQuestions: { data: [] } },
      });
      await service.listQuestionsByCategoryUuid('1');
      expect(mApolloClient.query).toHaveBeenCalledTimes(1);
      expect(mApolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { where: { categoryUuid: '1' } },
      });
    });

    it('should return a list of questions', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const response = { data: { listQuestions: { data: [{ id: '1' }] } } };
      mApolloClient.query.mockResolvedValueOnce(response);

      const result = await service.listQuestionsByCategoryUuid('1');
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('createQuestion without options', () => {
    it('should create the question and update parent category status to draft', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      jest
        .spyOn(mCategoryService.prototype, 'createDraft')
        .mockResolvedValueOnce({} as Category);

      await service.createQuestion(questionDtoWithoutOptions);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          data: R.omit(['options'], questionDtoWithoutOptions),
        },
      });
      expect(
        mCategoryService.mock.instances[0].createDraft
      ).toHaveBeenCalledWith(questionDtoWithoutOptions.categoryUuid);
    });

    it('should return the result from the createQuestion mutation', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const response = { data: { createQuestion: { data: { id: '1' } } } };
      mApolloClient.mutate.mockResolvedValueOnce(response);

      const result = await service.createQuestion(questionDtoWithoutOptions);

      expect(result).toEqual({
        data: { createQuestion: { data: { id: '1' } } },
      });
    });
  });

  describe('createQuestion with options', () => {
    it('should create the question along with the option', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);

      await service.createQuestion(questionDtoWithOptions);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(
        mOptionsService.mock.instances[0].createOption
      ).toHaveBeenCalledWith({
        ...questionDtoWithOptions.options[0],
      });
    });

    it('should return the result from the createQuestion mutation', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const createResult = { data: { createQuestion: { data: { id: '1' } } } };

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithoutOptions } },
      });

      mApolloClient.mutate.mockResolvedValueOnce(createResult);
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { createOption: { data: { id: '2' } } },
      });

      const result = await service.createQuestion(questionDtoWithOptions);
      expect(result).toEqual(createResult);
    });
  });

  describe('updateQuestion without options', () => {
    it('should update the question with update-mutation when status is draft', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithoutOptions } },
      });
      await service.updateQuestion(
        '123#0001',
        draftQuestionWithoutOptions,
        true,
        true
      );
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: QuestionService.UPDATE_QUESTION,
        variables: {
          revision: draftQuestionWithoutOptions.id,
          data: R.omit(
            ['options', 'id', 'entryId', 'meta'],
            draftQuestionWithoutOptions
          ),
        },
      });
    });

    it('should create new revision and also new category-revision on update if question to be updated is published', async () => {
      jest
        .spyOn(mCategoryService.prototype, 'createDraft')
        .mockResolvedValueOnce({} as Category);

      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const question = JSON.parse(JSON.stringify(draftQuestionWithoutOptions));
      question.meta.status = 'published';

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: question } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { createQuestionFrom: { data: question } },
      });

      await service.updateQuestion('123#0001', question, true, false);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: QuestionService.CREATE_QUESTION_FROM,
        variables: {
          revision: question.id,
          data: R.omit(['options', 'id', 'entryId', 'meta'], question),
        },
      });

      expect(
        mCategoryService.mock.instances[0].createDraft
      ).toHaveBeenCalledWith(question.categoryUuid);
    });

    it('should return the result from the updateQuestion mutation', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const updateResult = {
        data: { updateQuestion: { data: { id: '1' }, error: null } },
      };

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithoutOptions } },
      });

      mApolloClient.mutate.mockResolvedValueOnce(updateResult);

      const result = await service.updateQuestion(
        '1',
        draftQuestionWithoutOptions,
        false,
        true
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('updateQuestion with options', () => {
    it('should update the question and create the option', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithNewOption } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          updateQuestion: {
            data: R.omit(['options'], draftQuestionWithNewOption),
          },
        },
      });

      await service.updateQuestion(
        '1',
        draftQuestionWithNewOption,
        false,
        true
      );
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(
        mOptionsService.mock.instances[0].createOption
      ).toHaveBeenCalledWith({
        ...draftQuestionWithNewOption.options[0],
        gameUuid: 'game-1',
      });
    });

    it('should update the existing option', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithExistingOption } },
      });

      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          updateQuestion: {
            data: R.omit(['options'], draftQuestionWithExistingOption),
          },
        },
      });

      await service.updateQuestion(
        '1',
        draftQuestionWithExistingOption,
        false,
        true
      );
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(
        mOptionsService.mock.instances[0].updateOption
      ).toHaveBeenCalledWith(draftQuestionWithExistingOption.options[0]);
    });

    it('should delete removed question', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce(draftQuestionWithExistingOption.options);

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithExistingOption } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          updateQuestion: {
            data: R.omit(['options'], draftQuestionWithExistingOption),
          },
        },
      });

      await service.updateQuestion(
        '1',
        {
          ...draftQuestionWithExistingOption,
          options: [],
        },
        false,
        true
      );

      expect(
        mOptionsService.mock.instances[0].removeOption
      ).toHaveBeenCalledTimes(1);

      expect(
        mOptionsService.mock.instances[0].removeOption
      ).toHaveBeenCalledWith(draftQuestionWithExistingOption.options[0].id);
    });

    it('should return the result from the updateQuestion mutation', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const updateResult = {
        data: { updateQuestion: { data: { id: '1' }, error: null } },
      };
      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValueOnce([]);
      mApolloClient.mutate.mockResolvedValueOnce(updateResult);
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateOption: { data: { id: '2' } } },
      });

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: draftQuestionWithExistingOption } },
      });

      const result = await service.updateQuestion(
        '1',
        draftQuestionWithExistingOption,
        false,
        true
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('removeQuestion', () => {
    it("should remove the question by it's id", async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const getQuestionResult = {
        data: { getQuestion: { data: { id: '1' } } },
      };

      mApolloClient.query.mockResolvedValueOnce(getQuestionResult);

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValue([]);

      await service.removeQuestion('1');

      expect(mApolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { revision: '1' },
      });

      expect(mDeleteService.mock.instances[0].deleteModel).toHaveBeenCalledWith(
        '1',
        'Question'
      );
    });

    it('should return error if fetching question fails', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const getQuestionResult = { error: { code: '', message: '' } };

      mApolloClient.query.mockResolvedValueOnce(getQuestionResult);

      const result = await service.removeQuestion('1');

      expect(result).toEqual({
        error: {
          code: '',
          message: '',
        },
      });
    });

    it('should remove related options', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const getQuestionResult = {
        data: { getQuestion: { data: { id: '1' } } },
      };

      mApolloClient.query.mockResolvedValueOnce(getQuestionResult);

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValue([{ id: '2' } as any, { id: '3' } as any]);

      await service.removeQuestion('1');

      expect(
        mOptionsService.mock.instances[0].removeOption
      ).toHaveBeenCalledTimes(2);

      expect(
        mOptionsService.mock.instances[0].removeOption
      ).toHaveBeenCalledWith('2');

      expect(
        mOptionsService.mock.instances[0].removeOption
      ).toHaveBeenCalledWith('3');
    });

    it('should return error if fetching options fails', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: { id: '1' } } },
      });

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockRejectedValue({
          error: {
            code: '',
            message: '',
          },
        });

      const result = await service.removeQuestion('1');

      expect(result).toEqual({
        error: {
          code: '',
          message: '',
        },
      });
    });

    it('should return the result from delete question mutation', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );
      const deleteResult = { data: { deleteQuestion: { data: { id: '1' } } } };

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: { id: '1' } } },
      });

      jest
        .spyOn(mOptionsService.prototype, 'listOptionsByQuestionUuid')
        .mockResolvedValue([]);

      jest
        .spyOn(mDeleteService.prototype, 'deleteModel')
        .mockResolvedValue(deleteResult);

      const result = await service.removeQuestion('1');
      expect(result).toEqual(deleteResult);
    });

    it('delete-mutation is called with given revision', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          deleteQuestion: {
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

  describe('sortQuestions', () => {
    it('should sort categories correctly', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );

      const commonQuestionProperties = {
        entryMessages: [],
        exitMessages: [],
        categoryUuid: '1',
        topicUuid: '1',
        typeUuid: '1',
        questionnaireUuid: '1',
        gameUuid: 'game-1',
        meta: {
          status: 'draft',
        },
      };

      const questionsToSort = [
        {
          ...commonQuestionProperties,
          id: '1',
          entryId: '1#0001',
          uuid: '1',
          description: 'Question 1',
          sortIndex: 2,
          tags: [],
          label: 'Question 1',
        },
        {
          ...commonQuestionProperties,
          id: '2',
          entryId: '2#0001',
          uuid: '2',
          description: 'Question 2',
          sortIndex: 1,
          tags: [],
          label: 'Question 2',
        },
      ];

      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: questionsToSort[1] } },
      });
      mApolloClient.query.mockResolvedValueOnce({
        data: { getQuestion: { data: questionsToSort[0] } },
      });

      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateQuestion: { data: questionsToSort[0] } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateQuestion: { data: questionsToSort[1] } },
      });

      await service.sortQuestions(questionsToSort);

      expect(mApolloClient.mutate).toHaveBeenCalledTimes(2);
      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: '1',
          data: R.omit(['id', 'entryId', 'meta'], questionsToSort[0]),
        },
      });

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(2, {
        mutation: expect.any(Object),
        variables: {
          revision: '2',
          data: R.omit(['id', 'entryId', 'meta'], questionsToSort[1]),
        },
      });
    });
  });

  describe('createDraft', () => {
    it('should create draft version', async () => {
      const service = new QuestionService(
        new AdminUserService('', '', '', '', '')
      );

      const question = JSON.parse(JSON.stringify(draftQuestionWithoutOptions));
      question.meta.status = 'published';

      mApolloClient.query.mockResolvedValueOnce({
        data: { listQuestions: { data: [question] } },
      });

      mApolloClient.query.mockResolvedValueOnce({
        data: {
          listQuestions: {
            data: [question],
          },
        },
      });

      await service.createDraft(question.uuid);

      expect(mApolloClient.query).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: question.id,
          data: R.omit(['id', 'entryId', 'meta'], question),
        },
      });
    });
  });
});
