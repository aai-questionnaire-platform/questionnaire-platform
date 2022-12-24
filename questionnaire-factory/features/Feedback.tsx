import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useQuestionnaire } from '@/api/hooks';
import Background from '@/components/Background';
import FlatButton from '@/components/Button/FlatButton';
import Heading from '@/components/Heading';
import LinkButton from '@/components/LinkButton';
import NetworkError from '@/components/NetworkError';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import withSettingsGuard from '@/components/withSettingsGuard';
import { FeedbackComponent } from '@/schema/Components';
import { Questionnaire } from '@/types';

type FeedbackProps = FeedbackComponent['props'];

const FeedbackMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 1rem;
`;

const getFeedbackurl = R.pipe<[Questionnaire], any, any, string>(
  R.propOr([], 'categories'),
  R.find(R.propEq('type', 'feedback')),
  R.pathOr('', ['data', 'url'])
);

function Feedback(props: FeedbackProps) {
  const { t } = useTranslation();
  const { background, links } = R.omit(['children'], props);
  const { data: questionnaire, error } = useQuestionnaire();

  if (error) {
    return <NetworkError error={error} />;
  }

  return (
    <Background bg={background}>
      <FeedbackMain as="main">
        <Heading variant="h1">{t('feedback.heading')}</Heading>

        <Spacer mt={56} mb={40}>
          <Typography align="center">{t('feedback.body')}</Typography>
        </Spacer>

        {links?.primary && (
          <Spacer mb={24}>
            <LinkButton
              {...links.primary}
              slug={getFeedbackurl(questionnaire ?? {})}
              label={t('feedback.primaryButton')}
            />
          </Spacer>
        )}

        {links?.secondary && (
          <LinkButton
            {...links.secondary}
            label={t('feedback.secondaryButton')}
            variant="secondary"
          />
        )}

        <Spacer mt={64} mb={48}>
          <FlatButton style={{ textDecoration: 'underline' }}>
            {t('logout')}
          </FlatButton>
        </Spacer>
      </FeedbackMain>
    </Background>
  );
}

export default withSettingsGuard(Feedback);
