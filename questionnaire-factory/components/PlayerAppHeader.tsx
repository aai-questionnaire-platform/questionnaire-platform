import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { withUrlParams } from '@/api/util';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

interface PlayerAppHeaderProps {
  color?: string;
}

const AppHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 24px 16px;
  width: 100%;
`;

const SignoutButton = styled(Button)<{ color?: string }>`
  ${({ color }) => color && `color: ${color};`}
`;

function PlayerAppHeader({ color }: PlayerAppHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const doSignout = () => {
    signOut({
      redirect: false,
      callbackUrl: withUrlParams(
        `${process.env.NEXT_PUBLIC_AAI_BASE_URL}/logout`,
        {
          callbackUrl: `${window.location.origin}/${router.query.appId}`,
        }
      ),
    });
  };

  return (
    <AppHeader color={color}>
      <SignoutButton
        variant="flat"
        aria-label={t('logout')}
        onClick={doSignout}
        startIcon={<Icon icon="logout" />}
        iconOnly
        data-cy="signout-button"
        color={color}
      />
    </AppHeader>
  );
}

export default PlayerAppHeader;
