import { signOut } from 'next-auth/react';
import * as R from 'ramda';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '@/components/Button';
import Icon from '@/components/Icon';

type AdminHeaderProps = PropsWithChildren<{
  borderColor?: string;
  backgroundColor?: string;
  color?: string;
}>;

const Header = styled.header<Required<AdminHeaderProps>>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  height: 80px;
  border-width: 1px 0;
  border-style: solid;
  color: ${R.prop('color')};
  background: ${R.prop('backgroundColor')};
  border-color: ${R.prop('borderColor')};
  height: 100%;
`;

function AdminHeader({
  color,
  backgroundColor,
  borderColor,
  children,
}: AdminHeaderProps) {
  const { t } = useTranslation();

  function doSignOut() {
    signOut({
      redirect: false,
      callbackUrl: process.env.NEXT_PUBLIC_ADMIN_LOGOUT_URL!,
    });
  }

  return (
    <Header
      borderColor={borderColor ?? '#fff'}
      backgroundColor={backgroundColor ?? '#fff'}
      color={color ?? '#000'}
    >
      {children}
      <Button
        onClick={doSignOut}
        aria-label={t('logout')}
        data-cy="signout-button"
      >
        <Icon icon="logout" />
      </Button>
    </Header>
  );
}

export default AdminHeader;
