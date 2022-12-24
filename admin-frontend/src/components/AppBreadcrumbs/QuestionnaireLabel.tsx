import { useQuery } from '@apollo/client';
import * as R from 'ramda';
import { QUESTIONNAIRE_TITLES } from '../../api/queries';
import { useQueryParams } from '../../util/hooks';
import { listQuestionnairesDataLens, viewOr } from '../../util/lenses';
import { Questionnaire } from '../../types';

const QuestionnaireLabel = () => {
  const { data, loading } = useQuery(QUESTIONNAIRE_TITLES);
  const id = useQueryParams().get('questionnaireId') as string;

  if (loading) {
    return <>-</>;
  }

  const questionnaires: Questionnaire[] = viewOr(
    [],
    listQuestionnairesDataLens,
    data
  );
  const label = questionnaires.find(R.propEq('uuid', id))?.title || '-';

  return <>{label}</>;
};

export default QuestionnaireLabel;
