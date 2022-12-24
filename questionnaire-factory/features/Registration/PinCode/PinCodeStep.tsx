import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Spacer from '@/components/Spacer';
import SpinnerButton from '@/components/SpinnerButton';
import Typography from '@/components/Typography';

import InputError from './InputError';
import PinInput from './PinInput';

interface PinCodeStepProps {
  pin: string;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
  onPinChange: (value: string) => void;
  error?: string;
}

const PinCodeContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2.5rem;
`;

function PinCodeStep({
  pin,
  error,
  isLoading,
  onSubmit,
  onPinChange,
}: PinCodeStepProps) {
  const { t } = useTranslation();

  return (
    <PinCodeContainer>
      <Heading id="pin-code-input-heading" variant="h1">
        {t('registration.pin.heading')}
      </Heading>

      <Spacer mt={32} mb={40}>
        <Typography align="center">{t('registration.pin.body')}</Typography>
      </Spacer>

      <form onSubmit={onSubmit} aria-labelledby="pin-code-input-heading">
        <label>
          <Spacer mb={8}>
            <Typography as="div">{t('registration.pin.inputLabel')}</Typography>
          </Spacer>

          <PinInput
            onChange={onPinChange}
            size={5}
            value={pin}
            invalid={!!error}
            aria-describedby="pin-code-error"
          />
        </label>

        <InputError id="pin-code-error" error={error} />

        <Spacer mt={48}>
          <Flex justify="center">
            <SpinnerButton
              variant="primary"
              type="submit"
              disabled={!!error}
              isLoading={isLoading}
            >
              {t('registration.pin.nextButtonLabel')}
            </SpinnerButton>
          </Flex>
        </Spacer>
      </form>
    </PinCodeContainer>
  );
}

export default PinCodeStep;
