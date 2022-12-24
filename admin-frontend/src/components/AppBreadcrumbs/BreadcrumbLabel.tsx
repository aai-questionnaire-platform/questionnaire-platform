import { useTranslation } from 'react-i18next';
import QuestionnaireLabel from './QuestionnaireLabel';

interface BreadcrumbLabelProps {
  route: string;
}

const BreadcrumbLabel = ({ route }: BreadcrumbLabelProps) => {
  const { t } = useTranslation();

  if (route === 'questionnaire') {
    return <QuestionnaireLabel />;
  }

  return <>{t(`routeLabels.${route || 'home'}`)}</>;
};

export default BreadcrumbLabel;
