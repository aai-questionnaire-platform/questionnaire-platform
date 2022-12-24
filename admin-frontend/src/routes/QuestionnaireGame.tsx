import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { QUESTIONNAIRE } from '../api/queries';
import { withUrlParams } from '../api/utils';
import { versionFromId } from '../util';
import { useQueryParams } from '../util/hooks';
import { listQuestionnairesDataLens } from '../util/lenses';
import Error from '../components/Error';
import Loader from '../components/Loader';
import paths from './paths';

const QuestionnaireGame = () => {
  const id = useQueryParams().get('questionnaireId') as string;
  const { t } = useTranslation();
  const { loading, error, data } = useQuery(QUESTIONNAIRE, {
    variables: { uuid: id },
    context: { clientName: 'manage' },
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const questionnaire = R.view(listQuestionnairesDataLens, data)[0];
  const heading = questionnaire.title || '-';
  const version = questionnaire.id && versionFromId(questionnaire.id);
  const date = questionnaire.createdOn && new Date(questionnaire.createdOn);

  return (
    <>
      <Box display="flex" flexDirection="row" alignItems="center" pb={4}>
        <Typography sx={{ m: 0 }} variant="h1">
          {heading}
        </Typography>
      </Box>
      <Typography>
        {t('version')}: {version}
      </Typography>
      <Typography sx={{ mb: 2 }}>{t('publishedOn', { date })}</Typography>

      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" mr={5}>
          <Typography variant="h2">{t('contentManagement')}</Typography>
          <Typography sx={{ mb: 4 }}>
            {t('contentManagementDescription')}
          </Typography>
          <Link
            data-cy="questionnaire-game-link-to-content-management"
            component={RouterLink}
            to={withUrlParams(paths.CONTENT_MANAGEMENT, {
              questionnaireId: id,
            })}
            underline="none"
          >
            <Button variant="contained">{t('editContent')}</Button>
          </Link>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="h2">{t('userManagement')}</Typography>
          <Typography sx={{ mb: 4 }}>
            {t('userManagementDescription')}
          </Typography>
          <Link
            data-cy="questionnaire-game-link-to-user-management"
            component={RouterLink}
            to={withUrlParams(paths.USER_MANAGEMENT, {
              questionnaireId: id,
            })}
            underline="none"
          >
            <Button variant="contained">{t('manageGroupsAndUsers')}</Button>
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default QuestionnaireGame;
