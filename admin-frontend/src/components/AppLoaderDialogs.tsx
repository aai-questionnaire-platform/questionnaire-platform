import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { discardStateVar, publishStateVar } from '../api/reactiveVars';
import LoaderDialog from './LoaderDialog';

const AppLoaderDialogs = () => {
  const { t } = useTranslation();
  const publishState = useReactiveVar(publishStateVar);
  const discardState = useReactiveVar(discardStateVar);

  return (
    <>
      <LoaderDialog
        state={publishState}
        loadingLabel={t('publishing')}
        successLabel={`${t('published')}!`}
        errorLabel={t('publishFailed')}
        data-cy="publish-loader-dialog"
      />

      <LoaderDialog
        state={discardState}
        loadingLabel={t('discardingChanges')}
        successLabel={t('changesDiscarded')}
        errorLabel={t('changesDiscardFailed')}
        data-cy="discard-loader-dialog"
      />
    </>
  );
};

export default AppLoaderDialogs;
