import { ReactNode } from 'react';
import styled from 'styled-components';

import Link, { LinkProps } from '@/components/Link';

const Container = styled.header`
  position: sticky;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.75);
  border: 2px solid #f2f2f2;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  border-radius: 50px;
  z-index: 2;
`;

const LinkContainer = styled.div`
  position: absolute;
  left: 15px;
`;

const StyledTitle = styled.span`
  font-weight: 600;
`;

interface HeaderProps {
  icon: ReactNode;
  text: string;
  linkProps: LinkProps;
}

function Header({ icon, text, linkProps }: HeaderProps) {
  return (
    <Container>
      <LinkContainer>
        <Link {...linkProps}>{icon}</Link>
      </LinkContainer>
      <StyledTitle>{text}</StyledTitle>
    </Container>
  );
}

export default Header;
