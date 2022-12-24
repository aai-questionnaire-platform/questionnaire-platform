import { ReactNode } from 'react';
import styled from 'styled-components';

import Background from '@/components/Background';
import { ColorOrBackgroundImage } from '@/schema/Components';

export const Container = styled.div<
  Pick<LayoutProps, 'maxWidth' | 'fullHeight'>
>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: ${({ maxWidth }) =>
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth};
  ${({ fullHeight }) => fullHeight && 'height: 100vh;'}
`;

Container.defaultProps = {
  maxWidth: 600,
};

interface LayoutProps {
  children?: ReactNode;
  background?: ColorOrBackgroundImage;
  maxWidth?: number | string;
  fullHeight?: boolean;
}

function Layout({ children, background, ...rest }: LayoutProps) {
  return (
    <Background bg={background}>
      <Container {...rest}>{children}</Container>
    </Background>
  );
}

export default Layout;
