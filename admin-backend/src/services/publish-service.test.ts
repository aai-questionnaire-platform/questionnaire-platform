import { PublishService } from './publish-service';
import { AdminUserService } from './admin-user-service';
import { contentBeforePublish, publishedJson } from './publish-service.mocks';
import { QuestionnaireService } from './questionnaire-service';
import { CategoryService } from './category-service';
import { QuestionService } from './question-service';
import { OptionsService } from './options-service';
import { TopicService } from './topic-service';
import { QuestionTypeService } from './question-type-service';
import { QuestionGameService } from './question-game-service';
import * as utils from './utils';
import { GameInstance } from '../datamodels/game-instance';

jest.mock('./admin-user-service');

jest.mock('./questionnaire-service');
jest.mock('./category-service');
jest.mock('./question-service');
jest.mock('./options-service');
jest.mock('./topic-service');
jest.mock('./question-type-service');
jest.mock('./question-game-service');

describe('PublishService', () => {
  jest
    .spyOn(utils, 'createTimestampWithTimezone')
    .mockReturnValue(publishedJson.date_written);

  jest
    .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
    .mockReturnValue(['game-1']);

  jest
    .spyOn(AdminUserService.prototype as any, 'userHasGame')
    .mockReturnValue(true);

  jest
    .spyOn(AdminUserService.prototype as any, 'getActiveGameId')
    .mockReturnValue('game-1');

  jest
    .spyOn(QuestionnaireService.prototype as any, 'readQuestionnaireByUuid')
    .mockReturnValue(contentBeforePublish.questionnaire);

  const newQuestionnaireRevision = { ...contentBeforePublish.questionnaire };
  newQuestionnaireRevision.id = 'new-questionnaire-id';
  newQuestionnaireRevision.meta.status = 'draft';

  jest
    .spyOn(QuestionnaireService.prototype as any, 'createDraftIfPublished')
    .mockReturnValue(newQuestionnaireRevision);

  jest
    .spyOn(
      CategoryService.prototype as any,
      'readCategoriesByQuestionnaireUuid'
    )
    .mockReturnValue(contentBeforePublish.categories);

  const mutationMock = jest.fn((id: any, model: any) => {
    return model;
  });

  const deleteMock = jest.fn(() => {
    return true;
  });
  jest
    .spyOn(QuestionnaireService.prototype as any, 'publishMutation')
    .mockImplementation(jest.fn(() => contentBeforePublish.questionnaire));

  jest
    .spyOn(CategoryService.prototype as any, 'updateMutation')
    .mockImplementation(mutationMock);

  jest
    .spyOn(CategoryService.prototype as any, 'createFromMutation')
    .mockImplementation(mutationMock);

  jest
    .spyOn(CategoryService.prototype as any, 'publishMutation')
    .mockImplementation(
      jest.fn((id: any) => {
        return contentBeforePublish.categories.find((model) => model.id === id);
      })
    );

  jest
    .spyOn(CategoryService.prototype as any, 'deleteMutation')
    .mockImplementation(deleteMock);

  jest
    .spyOn(QuestionService.prototype as any, 'readQuestionsByGameUuid')
    .mockReturnValue(contentBeforePublish.questions);

  jest
    .spyOn(QuestionService.prototype as any, 'updateMutation')
    .mockImplementation(mutationMock);
  jest
    .spyOn(QuestionService.prototype as any, 'createFromMutation')
    .mockImplementation(mutationMock);

  jest
    .spyOn(QuestionService.prototype as any, 'publishMutation')
    .mockImplementation(
      jest.fn((id: any) => {
        return contentBeforePublish.questions.find((model) => model.id === id);
      })
    );

  jest
    .spyOn(QuestionService.prototype as any, 'deleteMutation')
    .mockImplementation(deleteMock);

  jest
    .spyOn(OptionsService.prototype as any, 'readOptionsByGameUuid')
    .mockReturnValue(contentBeforePublish.options);

  jest
    .spyOn(OptionsService.prototype as any, 'updateMutation')
    .mockImplementation(mutationMock);

  jest
    .spyOn(OptionsService.prototype as any, 'createFromMutation')
    .mockImplementation(mutationMock);

  jest
    .spyOn(OptionsService.prototype as any, 'publishMutation')
    .mockImplementation(
      jest.fn((id: any) => {
        return contentBeforePublish.options.find((model) => model.id === id);
      })
    );

  jest
    .spyOn(OptionsService.prototype as any, 'deleteMutation')
    .mockImplementation(deleteMock);

  jest
    .spyOn(TopicService.prototype as any, 'readTopicsByGameUuid')
    .mockReturnValue([{ uuid: '1', label: 'label', value: 'value' }]);

  jest
    .spyOn(QuestionTypeService.prototype as any, 'readAllQuestionTypes')
    .mockReturnValue([
      { uuid: '1', answerType: 'single' },
      { uuid: '2', answerType: 'multiple' },
    ]);

  const publishServiceMock = jest.fn();
  jest
    .spyOn(QuestionGameService.prototype as any, 'postQuestionnaire')
    .mockImplementation(publishServiceMock);

  jest
    .spyOn(QuestionnaireService.prototype as any, 'deleteMutation')
    .mockImplementation(deleteMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const gameInstance: GameInstance = {
    gameUuid: 'game-1',
    gameApiToken: 'token',
    gameApiEndpoint: 'endpoint',
    gameAdminUserPoolId: 'userpoolid',
  };

  describe('Publish questionnaire', () => {
    it('Should publish models and create new revisions if necessary', async () => {
      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      await service.publishQuestionnaire({
        questionnaireUuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
        editedBy: 'user-1',
      });

      expect(publishServiceMock).toHaveBeenCalledWith(publishedJson);
    });

    it('should return correct query result', async () => {
      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      const result = await service.publishQuestionnaire({
        questionnaireUuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
        editedBy: 'user-1',
      });

      expect(result).toEqual({
        data: {
          publishQuestionnaire: {
            data: { id: '6221b9b6e326ba000970b3de#0078' },
          },
        },
      });
    });

    it('Should delete draft models when rollback is called', async () => {
      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      const rollbackCategoryMock = jest.fn();
      jest
        .spyOn(CategoryService.prototype as any, 'rollbackDraftRevisions')
        .mockImplementation(rollbackCategoryMock);

      const rollbackQuestionMock = jest.fn();
      jest
        .spyOn(QuestionService.prototype as any, 'rollbackDraftRevisions')
        .mockImplementation(rollbackQuestionMock);

      const rollbackOptionMock = jest.fn();
      jest
        .spyOn(OptionsService.prototype as any, 'rollbackDraftRevisions')
        .mockImplementation(rollbackOptionMock);

      await service.rollbackQuestionnaireChanges({
        questionnaireUuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
        editedBy: 'user-1',
      });

      expect(rollbackCategoryMock).toHaveBeenNthCalledWith(
        1,
        '623c590624372300074a735e#0044'
      );

      expect(rollbackQuestionMock).toHaveBeenNthCalledWith(
        1,
        '624c2bb29de66d00090bd008#0017'
      );

      expect(rollbackOptionMock).toHaveBeenNthCalledWith(
        1,
        '624c2bb29de66d00090bd009#0017'
      );
    });

    it('User should not be able to publish questionnaire if gameUuid is not allowed', async () => {
      jest
        .spyOn(AdminUserService.prototype as any, 'userHasGame')
        .mockReturnValue(false);

      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      await expect(
        service.publishQuestionnaire({
          questionnaireUuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
          editedBy: 'user-1',
        })
      ).rejects.toEqual(
        new Error('User not authorized to publish questionnaire')
      );
    });

    it('Throw error if questionnaireUuid is missing', async () => {
      jest
        .spyOn(AdminUserService.prototype as any, 'userHasGame')
        .mockReturnValue(false);

      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      await expect(
        service.publishQuestionnaire({ editedBy: 'user-1' })
      ).rejects.toEqual(
        new Error('Missing required parameter: questionnaireUuid')
      );
    });

    it('Throw error if questionnaireUuid is missing', async () => {
      jest
        .spyOn(AdminUserService.prototype as any, 'userHasGame')
        .mockReturnValue(false);

      const service = new PublishService(
        new AdminUserService('', '', '', '', ''),
        gameInstance
      );

      await expect(
        service.publishQuestionnaire({
          questionnaireUuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
        })
      ).rejects.toEqual(new Error('Missing required parameter: editedBy'));
    });
  });
});
