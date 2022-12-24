import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '@/components/Button';
import Dialog from '@/components/Dialog';
import Heading from '@/components/Heading';
import Icon from '@/components/Icon';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import {
  SMALL_VIEWPORT_WIDTH_MAX,
  SMALL_SCREEN_HEIGHT,
} from '@/util/constants';

interface ErrorProps {
  error: any;
  message?: string;
}

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px;
  max-width: ${SMALL_VIEWPORT_WIDTH_MAX};
  color: #000;

  @media screen and (max-height: ${SMALL_SCREEN_HEIGHT}px) {
    height: 90vh;
  }
`;

// Override default button styles. There's no guarantee that the primary button
// in theme is visible against white background
const CloseButton = styled(Button)`
  background-color: #006efd;
  color: #fff;
  flex-shrink: 0;
`;

const ErrorContentSpacer = styled(Spacer)`
  @media screen and (max-height: ${SMALL_SCREEN_HEIGHT}px) {
    margin-top: ${({ mt }) => (mt ?? 0) / 2}px;
  }
`;

function NetworkErrorDialog({ error, message }: ErrorProps) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!error);
  }, [error]);

  return (
    <Dialog
      isOpen={isOpen}
      close={() => setOpen(false)}
      autoFocus
      data-cy="network-error-dialog"
    >
      {isOpen && (
        <ErrorContent>
          <Icon icon="alert" size={63} alt="" />

          <ErrorContentSpacer mt={48}>
            <Heading variant="h1">{t('networkError.heading')}</Heading>
          </ErrorContentSpacer>

          <Typography weight={500} align="center">
            {message ?? t('networkError.body')}
          </Typography>

          <ErrorContentSpacer mt={64}>
            <CloseButton
              data-cy="network-error-close"
              onClick={() => setOpen(false)}
              onBlur={(e) => {
                // poor man's tab trap
                e.currentTarget.focus();
              }}
            >
              {t('networkError.close')}
            </CloseButton>
          </ErrorContentSpacer>
        </ErrorContent>
      )}
    </Dialog>
  );
}

export default NetworkErrorDialog;
