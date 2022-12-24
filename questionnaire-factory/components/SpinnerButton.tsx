import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import Button from '@/components/Button';
import { ButtonProps } from '@/components/Button/ButtonBase';
import ChangeAnnouncer from '@/components/ChangeAnnouncer';
import Flex from '@/components/Flex';
import Spinner from '@/components/Spinner';

type SpinnerButtonProps = PropsWithChildren<
  ButtonProps & {
    isLoading: boolean;
  }
>;

function SpinnerButton({
  isLoading,
  disabled,
  children,
  variant = 'primary',
  ...props
}: SpinnerButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme() as Record<string, any>;
  return (
    <Button
      {...(props as any)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      variant={variant}
    >
      {isLoading ? (
        <Flex align="center" justify="center">
          <Spinner
            size={24}
            color={theme[`${variant}Button`].default.spinnerColor}
          />
        </Flex>
      ) : (
        children
      )}

      <ChangeAnnouncer message={isLoading ? t('loading') : ''} />
    </Button>
  );
}

export default SpinnerButton;
