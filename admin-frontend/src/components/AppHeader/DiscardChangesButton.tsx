import { useReactiveVar } from '@apollo/client';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRollbackQuestionnaireMutation } from '../../api/hooks';
import {
  discardStateVar,
  isProcessingMutationsVar,
} from '../../api/reactiveVars';
import { useQueryParams } from '../../util/hooks';
import { useRenderPublishButton } from './util';

const DiscardChangesButton = () => {
  const { t } = useTranslation();
  const questionnaireId = useQueryParams().get('questionnaireId');
  const isProcessingMutations = useReactiveVar(isProcessingMutationsVar);
  const shouldRender = useRenderPublishButton();

  const [rollbackQuestionnaire, { loading, error }] =
    useRollbackQuestionnaireMutation(questionnaireId);

  useEffect(() => {
    discardStateVar(loading ? 'loading' : error ? 'error' : 'idle');
  }, [loading, error]);

  return shouldRender ? (
    <Button
      disabled={loading || isProcessingMutations}
      onClick={rollbackQuestionnaire}
      data-cy="discard-changes-button"
    >
      {t('discardChanges')}
    </Button>
  ) : null;
};

export default DiscardChangesButton;
