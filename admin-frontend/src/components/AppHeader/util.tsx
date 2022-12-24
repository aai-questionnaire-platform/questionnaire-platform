import { useQuery } from '@apollo/client';
import * as R from 'ramda';
import { useLocation } from 'react-router-dom';
import { QUESTIONNAIRE } from '../../api/queries';
import { useQueryParams } from '../../util/hooks';
import { listQuestionnairesDataLens } from '../../util/lenses';
import paths from '../../routes/paths';

export const useRenderPublishButton = () => {
  const { pathname } = useLocation();
  const questionnaireId = useQueryParams().get('questionnaireId');
  const { data } = useQuery(QUESTIONNAIRE, {
    variables: { uuid: questionnaireId },
    context: { clientName: 'manage' },
  });

  const isContentManagementPath =
    pathname === paths.CONTENT_MANAGEMENT || pathname === paths.EDIT_CATEGORY;
  const unpublishedChanges =
    data &&
    R.view(listQuestionnairesDataLens, data)[0]?.meta.status === 'draft';

  return isContentManagementPath && unpublishedChanges;
};
