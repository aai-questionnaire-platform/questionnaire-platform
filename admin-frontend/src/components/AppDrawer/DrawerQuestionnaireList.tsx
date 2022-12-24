import { useQuery } from '@apollo/client';
import List from '@mui/material/List';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { QUESTIONNAIRE_TITLES } from '../../api/queries';
import { withUrlParams } from '../../api/utils';
import { getUrlParam } from '../../util';
import { listQuestionnairesDataLens, viewOr } from '../../util/lenses';
import paths from '../../routes/paths';
import { Questionnaire } from '../../types';
import NavEntry from './NavEntry';
import QuestionnaireListLoader from './QuestionnaireListLoader';

function DrawerQuestionnaireList() {
  const { t } = useTranslation();
  const { data, loading } = useQuery(QUESTIONNAIRE_TITLES);
  const location = useLocation();

  const questionnaires: Questionnaire[] = viewOr(
    [],
    listQuestionnairesDataLens,
    data
  );

  return (
    <List>
      <NavEntry to={paths.HOME} exact>
        {t('games')}
      </NavEntry>

      {loading && <QuestionnaireListLoader />}
      {!loading &&
        questionnaires.map((questionnaire) => (
          <Fragment key={questionnaire.entryId}>
            <NavEntry
              to={withUrlParams(paths.QUESTIONNAIRE, {
                questionnaireId: questionnaire.uuid,
              })}
              indent={1}
            >
              {questionnaire.title}
            </NavEntry>

            {location.pathname.startsWith(paths.QUESTIONNAIRE) &&
              getUrlParam(location.search, 'questionnaireId') ===
                questionnaire.uuid && (
                <>
                  <NavEntry
                    to={withUrlParams(paths.CONTENT_MANAGEMENT, {
                      questionnaireId: questionnaire.uuid,
                    })}
                    indent={2}
                  >
                    {t('contentManagement')}
                  </NavEntry>
                  <NavEntry
                    to={withUrlParams(paths.USER_MANAGEMENT, {
                      questionnaireId: questionnaire.uuid,
                    })}
                    indent={2}
                  >
                    {t('userManagement')}
                  </NavEntry>
                </>
              )}
          </Fragment>
        ))}
    </List>
  );
}

export default DrawerQuestionnaireList;
