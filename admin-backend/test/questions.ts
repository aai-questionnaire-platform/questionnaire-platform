export const questionDtoWithoutOptions = {
  uuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
  gameUuid: 'game-1',
  label: 'Rock?',
  topicUuid: '1812c656-6fb0-4a9d-b6d9-cf0b9b041497',
  typeUuid: '9626dcf5-d508-4e90-8560-6052c283aac9',
  categoryUuid: 'f3b68ad9-65d0-4613-b23d-e5d88f5d184b',
  sortIndex: 1,
  tags: [],
  questionnaireRevision: '',
  options: [],
};

export const questionDtoWithOptions = {
  uuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
  gameUuid: 'game-1',
  label: 'Rock?',
  topicUuid: '1812c656-6fb0-4a9d-b6d9-cf0b9b041497',
  typeUuid: '9626dcf5-d508-4e90-8560-6052c283aac9',
  categoryUuid: 'f3b68ad9-65d0-4613-b23d-e5d88f5d184b',
  sortIndex: 1,
  tags: [],
  questionnaireRevision: '',
  options: [
    {
      uuid: 'dae80f19-25d8-474f-bcc7-7db071e018dc',
      questionUuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
      questionnaireRevision: '',
      gameUuid: 'game-1',
      label: 'Bon Jovi',
      value: 'dae80f19-25d8-474f-bcc7-7db071e018dc',
      sortIndex: 1,
    },
  ],
};

export const draftQuestionWithoutOptions = {
  id: '123#0001',
  entryId: '123',
  uuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
  gameUuid: 'game-1',
  label: 'Rock?',
  topicUuid: '1812c656-6fb0-4a9d-b6d9-cf0b9b041497',
  typeUuid: '9626dcf5-d508-4e90-8560-6052c283aac9',
  categoryUuid: 'f3b68ad9-65d0-4613-b23d-e5d88f5d184b',
  sortIndex: 1,
  tags: [],
  questionnaireRevision: '',
  options: [],
  meta: {
    status: 'draft',
  },
};

export const draftQuestionWithNewOption = {
  id: '123#0001',
  entryId: '123',
  uuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
  gameUuid: 'game-1',
  label: 'Rock?',
  topicUuid: '1812c656-6fb0-4a9d-b6d9-cf0b9b041497',
  typeUuid: '9626dcf5-d508-4e90-8560-6052c283aac9',
  categoryUuid: 'f3b68ad9-65d0-4613-b23d-e5d88f5d184b',
  sortIndex: 1,
  tags: [],
  questionnaireRevision: '',
  options: [
    {
      uuid: 'dae80f19-25d8-474f-bcc7-7db071e018dc',
      gameUuid: undefined,
      questionUuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
      label: 'Bon Jovi',
      value: 'dae80f19-25d8-474f-bcc7-7db071e018dc',
      sortIndex: 1,
    },
  ],
  meta: {
    status: 'draft',
  },
};

export const draftQuestionWithExistingOption = {
  id: '123#0001',
  entryId: '123',
  uuid: 'a8d45544-cb8c-4e4d-adcd-2b63fd6b3b33',
  gameUuid: 'game-1',
  label: 'Rock?',
  topicUuid: '1812c656-6fb0-4a9d-b6d9-cf0b9b041497',
  typeUuid: '9626dcf5-d508-4e90-8560-6052c283aac9',
  categoryUuid: 'f3b68ad9-65d0-4613-b23d-e5d88f5d184b',
  sortIndex: 1,
  tags: [],
  questionnaireRevision: '',
  options: [
    {
      id: '123#0001',
      entryId: '123',
      uuid: 'c877ae5d-4d18-4941-9040-f36c3f3e7ee4',
      gameUuid: 'game-1',
      label: 'The Scorpions',
      value: 'c877ae5d-4d18-4941-9040-f36c3f3e7ee4',
      questionUuid: '76e1a0b2-1f72-4a26-b23e-cb071195d0d2',
      questionnaireRevision: '',
      sortIndex: 1,
    },
  ],
  meta: {
    status: 'draft',
  },
};
