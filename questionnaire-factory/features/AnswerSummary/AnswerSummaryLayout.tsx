import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import Background from '@/components/Background';
import Flex from '@/components/Flex';
import PlayerAppHeader from '@/components/PlayerAppHeader';
import { ColorOrBackgroundImage } from '@/schema/Components';
import { useAppTheme } from '@/util/hooks';

interface AnswerSummaryLayoutProps {
  background?: ColorOrBackgroundImage;
}

const AnswerSummaryContainer = styled.div`
  ${({ theme }) =>
    theme.answerSummary?.fgColor && `color: ${theme.answerSummary.fgColor};`}
  padding-bottom: 64px;
`;

function AnswerSummaryLayout({
  children,
  background,
}: PropsWithChildren<AnswerSummaryLayoutProps>) {
  const theme = useAppTheme();

  return (
    <Background bg={background}>
      <PlayerAppHeader color={theme.answerSummary?.playerAppHeader?.color} />

      <AnswerSummaryContainer>
        <Flex as="main" justify="center" align="center" direction="column">
          {children}
        </Flex>
      </AnswerSummaryContainer>
    </Background>
  );
}

export default AnswerSummaryLayout;
