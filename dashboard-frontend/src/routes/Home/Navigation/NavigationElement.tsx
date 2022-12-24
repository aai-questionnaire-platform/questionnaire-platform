import React, { ReactNode } from 'react';
import styled from 'styled-components';

import StyledLink from '@/components/Link';

const Link = styled(StyledLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 50px;
  height: 50px;
`;

const Title = styled.div<{ hide: boolean }>`
  font-family: 'Nanum Pen Script', cursive;
  font-size: 0.8rem;
  position: absolute;
  top: 65px;
  transition: all 0.3s ease;
  ${({ hide }) => hide && 'opacity: 0;'}
`;

interface NavigationElementProps {
  icon: ReactNode;
  text: string | null;
  to: string;
  hideTitles: boolean;
}

function NavigationElement({
  icon,
  text,
  to,
  hideTitles,
}: NavigationElementProps) {
  return (
    <Link to={to}>
      {icon}
      <Title hide={hideTitles}>{text}</Title>
    </Link>
  );
}

export default NavigationElement;
