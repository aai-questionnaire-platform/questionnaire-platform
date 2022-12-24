export const axiosPostMock = {
  post: jest.fn((path, body) => {
    if (body.includes('query ListCategories')) {
      return Promise.resolve({
        data: {
          data: {
            listGroups: {
              data: [
                {
                  id: '61ea7f81467d9700099c5b52#0002',
                  entryId: '61ea7f81467d9700099c5b52',
                  uuid: '66b9a11e-1bb3-4b62-bb57-4f406fff451a',
                  name: 'Ryhmä222',
                  organizationUuid: '61e13e08728afc0009f14073',
                  pin: '63245',
                  validFrom: '2022-01-26T14:11:35+00:00',
                  validUntil: '2022-01-26T14:11:35+00:00',
                  deletedAt: null,
                  gameUuid: 'game-1',
                  __typename: 'Group',
                },
                {
                  id: '61ea81d9467d9700099c5b53#0003',
                  entryId: '61ea81d9467d9700099c5b53',
                  uuid: '82caed9d-a90d-4b45-ab1b-f29734a4e9f3',
                  name: 'Ryhmä313',
                  organizationUuid: '61e13e08728afc0009f14073',
                  pin: '79536',
                  validFrom: '2022-01-26T14:07:29+00:00',
                  validUntil: '2022-01-26T14:07:29+00:00',
                  deletedAt: '2022-01-26T14:07:29+00:00',
                  gameUuid: 'game-1',
                  __typename: 'Group',
                },
              ],
              __typename: 'GroupListResponse',
            },
          },
          extensions: {
            console: [],
          },
        },
      });
    } else if (body.includes('query GetSomething')) {
      return Promise.resolve({
        data: {
          data: {
            getQuestionnaireDeleted: {
              data: {
                id: '61e979bacf70930009fffe6c#0001',
                entryId: '61e979bacf70930009fffe6c',
                uuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
                createdOn: '2022-01-20T15:03:22.476Z',
                title: 'Questionnaire 2022',
                author: 'Author',
                locale: 'fi-FI',
                deletedAt: '2022-01-20T15:03:22.476Z',
                gameUuid: 'game-1',
                __typename: 'Questionnaire',
              },
              __typename: 'QuestionnaireResponse',
            },
            getQuestionnaireNotDeleted: {
              data: {
                id: '61e979bacf70930009fffe6c#0001',
                entryId: '61e979bacf70930009fffe6c',
                uuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
                createdOn: '2022-01-20T15:03:22.476Z',
                title: 'Questionnaire 2022',
                author: 'Author',
                locale: 'fi-FI',
                deletedAt: null,
                gameUuid: 'game-1',
                __typename: 'Questionnaire',
              },
              __typename: 'QuestionnaireResponse',
            },
          },
          extensions: {
            console: [],
          },
        },
      });
    } else {
      return Promise.resolve({ data: 'ok' });
    }
  }),
};
