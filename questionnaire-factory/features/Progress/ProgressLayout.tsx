import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import Background from '@/components/Background';
import PlayerAppHeader from '@/components/PlayerAppHeader';
import { ColorOrBackgroundImage } from '@/schema/Components';
import { SMALL_VIEWPORT_WIDTH_MAX } from '@/util/constants';
import { useAppTheme } from '@/util/hooks';

type ProgressLayoutProps = PropsWithChildren<{
  background?: ColorOrBackgroundImage;
}>;

const ProgressMain = styled.main`
  max-width: ${SMALL_VIEWPORT_WIDTH_MAX}px;
  margin: 0px auto;
  padding: 56px 0;
`;

function ProgressLayout({ background, children }: ProgressLayoutProps) {
  const theme = useAppTheme();
  return (
    <Background bg={background}>
      <PlayerAppHeader color={theme.progress?.playerAppHeader?.color} />
      <ProgressMain>{children}</ProgressMain>
    </Background>
  );
}

export default ProgressLayout;
