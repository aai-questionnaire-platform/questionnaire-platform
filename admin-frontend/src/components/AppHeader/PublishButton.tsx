import { useReactiveVar } from '@apollo/client';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublishQuestionnaireMutation } from '../../api/hooks';
import {
  isProcessingMutationsVar,
  publishStateVar,
} from '../../api/reactiveVars';
import { useQueryParams } from '../../util/hooks';
import { useRenderPublishButton } from './util';

const PublishButton = () => {
  const { t } = useTranslation();
  const questionnaireId = useQueryParams().get('questionnaireId');
  const isProcessingMutations = useReactiveVar(isProcessingMutationsVar);
  const shouldRender = useRenderPublishButton();
  const [error, setError] = useState(undefined);
  const [publishQuestionnaire, { loading }] =
    usePublishQuestionnaireMutation(questionnaireId);

  async function doPublish() {
    try {
      setError(undefined);
      await publishQuestionnaire(questionnaireId);
    } catch (e: any) {
      setError(e);
    }
  }

  useEffect(() => {
    publishStateVar(loading ? 'loading' : error ? 'error' : 'idle');
  }, [loading, error]);

  return shouldRender ? (
    <Button
      disabled={loading || isProcessingMutations}
      onClick={doPublish}
      variant="contained"
      data-cy="publish-button"
    >
      {loading ? t('publishing') : t('publishChanges')}
    </Button>
  ) : null;
};

export default PublishButton;
