import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Heading from '@/components/Heading';
import Icon from '@/components/Icon';
import LinkButton from '@/components/LinkButton';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';

interface ErrorProps {
  error: any;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  background-color: #eeeff1;
  color: #000;
  max-width: 100%;
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 56px 36px 72px 36px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

// Override default button styles. There's no guarantee that the primary button
// in theme is visible against white background!
const BackToFrontPageLink = styled(LinkButton)`
  background-color: #006efd;
  color: #fff;
`;

function NetworkError({ error }: ErrorProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current) {
      // focus on the header so that the sr alerts the user that something has happened
      // would otherwise use a container with role "alert" but it needs to be mounted
      // before the error happens so it can't be used with the current implementation
      ref.current.focus();
    }
  }, []);

  // in case of unauthorized no error should be displayed
  // a redirect is done instead
  if (error.status === 401) {
    return null;
  }

  return (
    <ErrorContainer as="main" className="error">
      <ErrorContent ref={ref} tabIndex={-1}>
        <Icon icon="alert" size={63} alt="" />

        <Spacer mt={48}>
          <Heading variant="h1">{t('networkError.heading')}</Heading>
        </Spacer>

        <Typography weight={500} align="center">
          {t('networkError.body')}
        </Typography>

        <Spacer mt={64}>
          <BackToFrontPageLink slug="" label={t('networkError.buttonLabel')} />
        </Spacer>

        {process.env.NODE_ENV === 'development' && (
          <Spacer mt={16}>
            <pre style={{ whiteSpace: 'break-spaces' }}>
              <Typography as="span" weight="bold">
                {`${error.status}: `}
              </Typography>
              {error.message}
            </pre>
          </Spacer>
        )}
      </ErrorContent>
    </ErrorContainer>
  );
}

export default NetworkError;
