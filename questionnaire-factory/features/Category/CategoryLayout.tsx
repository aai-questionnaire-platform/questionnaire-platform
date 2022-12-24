import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import Background from '@/components/Background';
import Flex from '@/components/Flex';
import PlayerAppHeader from '@/components/PlayerAppHeader';
import { ColorOrBackgroundImage } from '@/schema/Components';
import { useAppTheme } from '@/util/hooks';

interface CategoryLayoutProps {
  background?: ColorOrBackgroundImage;
}

export const CategoryContentContainer = styled.div`
  width: 343px;
`;

export const CategoryContainer = styled.div`
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function CategoryLayout({
  background,
  children,
}: PropsWithChildren<CategoryLayoutProps>) {
  const theme = useAppTheme();
  return (
    <Background bg={background}>
      <CategoryContainer>
        <PlayerAppHeader color={theme.category?.playerAppHeader?.color} />

        <Flex direction="column" justify="center" align="center" as="main">
          {children}
        </Flex>
      </CategoryContainer>
    </Background>
  );
}

export default CategoryLayout;
