import * as R from 'ramda';
import {
  questionDtoWithOptions,
  draftQuestionWithExistingOption,
} from '../../test/questions';
import { createApolloClient } from '../api/graphql/apollo-client';
import { OptionsService } from './options-service';
import { QuestionService } from './question-service';
import { SoftDeleteService } from './soft-delete-service';
import { AdminUserService } from './admin-user-service';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./soft-delete-service.ts');
jest.mock('./question-service.ts');
jest.mock('./admin-user-service');

describe('OptionsService', () => {
  const mApolloClient = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  const mDeleteService = SoftDeleteService as jest.MockedClass<
    typeof SoftDeleteService
  >;

  const mQuestionService = QuestionService as jest.MockedClass<
    typeof QuestionService
  >;

  jest.spyOn(QuestionService.prototype, 'createDraft').mockResolvedValue({});

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

  describe('listOptionsByQuestionUuid', () => {
    it('should call query with correct variables', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      mApolloClient.query.mockResolvedValueOnce({
        data: { listOptions: { data: [{ id: '1' }] } },
      });
      await service.listOptionsByQuestionUuid('1');
      expect(mApolloClient.query).toHaveBeenCalledTimes(1);
      expect(mApolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { where: { questionUuid: '1' } },
      });
    });

    it('should return a list of options', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      const response = {
        data: {
          listOptions: {
            data: [{ id: '1', deletedAt: null, gameUuid: 'game-1' }],
          },
        },
      };
      mApolloClient.query.mockResolvedValueOnce(response);

      const result = await service.listOptionsByQuestionUuid('1');
      expect(result).toEqual([
        { id: '1', deletedAt: null, gameUuid: 'game-1' },
      ]);
    });
  });

  describe('createOption', () => {
    it('should create an option', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      await service.createOption(questionDtoWithOptions.options[0]);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          data: R.omit(['id'], questionDtoWithOptions.options[0]),
        },
      });
    });

    it('should return the result from the createOption mutation', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      const response = { data: { createOption: { data: { id: '1' } } } };
      mApolloClient.mutate.mockResolvedValueOnce(response);

      const result = await service.createOption(
        questionDtoWithOptions.options[0]
      );

      expect(result).toEqual({
        data: { createOption: { data: { id: '1' } } },
      });
    });
  });

  describe('updateOption', () => {
    it('should update an option when updating draft', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      const mockOption = {
        ...draftQuestionWithExistingOption.options[0],
        meta: { status: 'draft' },
      };
      mockOption.sortIndex++;

      mApolloClient.query.mockResolvedValueOnce({
        data: { getOption: { data: mockOption } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateOption: { data: mockOption } },
      });
      await service.updateOption(draftQuestionWithExistingOption.options[0]);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          revision: draftQuestionWithExistingOption.options[0].id,
          data: R.omit(
            ['id', 'entryId'],
            draftQuestionWithExistingOption.options[0]
          ),
        },
      });
    });

    it('should create new draft from published option and update draft-status to parent-question', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );

      const mockOption = {
        ...draftQuestionWithExistingOption.options[0],
        meta: { status: 'published' },
      };
      mockOption.sortIndex++;

      mApolloClient.query.mockResolvedValueOnce({
        data: { getOption: { data: mockOption } },
      });
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { createOptionFrom: { data: mockOption } },
      });
      await service.updateOption(draftQuestionWithExistingOption.options[0]);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: OptionsService.CREATE_OPTION_FROM,
        variables: {
          revision: draftQuestionWithExistingOption.options[0].id,
          data: R.omit(
            ['id', 'entryId'],
            draftQuestionWithExistingOption.options[0]
          ),
        },
      });
      expect(
        mQuestionService.mock.instances[0].createDraft
      ).toHaveBeenCalledWith(mockOption.questionUuid);
    });

    it('should return the result from the updateOption mutation', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      const updateResult = { data: { updateOption: { data: { id: '1' } } } };
      mApolloClient.mutate.mockResolvedValueOnce(updateResult);
      mApolloClient.mutate.mockResolvedValueOnce({
        data: { updateOption: { data: { id: '2' } } },
      });
      const mockOption = {
        ...draftQuestionWithExistingOption.options[0],
        meta: { status: 'draft' },
      };
      mockOption.sortIndex++;

      mApolloClient.query.mockResolvedValueOnce({
        data: { getOption: { data: mockOption } },
      });

      const result = await service.updateOption(
        draftQuestionWithExistingOption.options[0]
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('removeOption', () => {
    it('should call SoftDeleteService with correct parameters', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );
      await service.removeOption('1');
      expect(mDeleteService.mock.instances[0].deleteModel).toHaveBeenCalledWith(
        '1',
        'Option'
      );
    });

    it('delete-mutation is called with given revision', async () => {
      const service = new OptionsService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          deleteOption: {
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
});
