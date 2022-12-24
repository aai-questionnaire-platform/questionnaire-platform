import { useQuery } from '@apollo/client';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { QUESTIONNAIRE_TITLES } from '../api/queries';
import { withUrlParams } from '../api/utils';
import { listQuestionnairesDataLens, viewOr } from '../util/lenses';
import Error from '../components/Error';
import Loader from '../components/Loader';
import paths from '../routes/paths';
import { Questionnaire } from '../types';

const Home = () => {
  const { t } = useTranslation();
  const { data, error, loading } = useQuery(QUESTIONNAIRE_TITLES);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const questionnaires: Questionnaire[] = viewOr(
    [],
    listQuestionnairesDataLens,
    data
  );

  return (
    <Box>
      <Typography variant="h1">{t('welcome')}!</Typography>
      <Typography>{t('hereYouCanManageQuestionnaireGames')}</Typography>
      <Typography sx={{ mb: 4 }}>
        {t('selectQuestionnaireGameToManage')}
      </Typography>
      <Paper elevation={3}>
        <List data-cy="home-questionnaire-list" disablePadding>
          {questionnaires.map((questionnaire, index) => (
            <ListItem
              button
              component={RouterLink}
              to={withUrlParams(paths.QUESTIONNAIRE, {
                questionnaireId: questionnaire.uuid,
              })}
              key={questionnaire.uuid}
              divider={index < questionnaires.length - 1}
              sx={{
                '&:hover': {
                  'backgroundColor': '#ebf3ff',
                  'textDecoration': 'underline',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemText
                primary={questionnaire.title}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '1.2rem',
                    fontWeight: 'medium',
                    p: 0.5,
                  },
                }}
              />
              <ChevronRightIcon />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Home;
