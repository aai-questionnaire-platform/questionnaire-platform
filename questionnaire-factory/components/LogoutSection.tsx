import { signOut } from 'next-auth/react';
import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

interface LogoutSectionProps {
  i18nKey: string;
}

const StyledLink = styled.a`
  white-space: nowrap;
  color: inherit;
`;

function LogoutLink({ children }: React.PropsWithChildren<{}>) {
  return (
    <StyledLink href="#" onClick={() => signOut()}>
      {children}
    </StyledLink>
  );
}

const StyledSection = styled.div`
  font-size: 0.9rem;
  text-align: center;
`;

function LogoutSection({ i18nKey }: LogoutSectionProps) {
  return (
    <StyledSection data-cy="frontpage-logout">
      <Trans
        i18nKey={i18nKey}
        components={{
          a: <LogoutLink />,
        }}
      />
    </StyledSection>
  );
}

export default LogoutSection;
