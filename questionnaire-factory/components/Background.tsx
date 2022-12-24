import { PropsWithChildren, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { ColorOrBackgroundImage } from '@/schema/Components';
import {
  MEDIUM_VIEWPORT_WIDTH_MIN,
  SMALL_VIEWPORT_WIDTH_MAX,
} from '@/util/constants';
import { useAppTheme } from '@/util/hooks';

interface BackgroundProps {
  bg?: ColorOrBackgroundImage;
}

const StyledBackground = styled.div<BackgroundProps>`
  height: 100%;
  min-height: 100vh;
  max-width: ${MEDIUM_VIEWPORT_WIDTH_MIN}px;
  margin: 0 auto;

  ${({ bg }) => {
    if (bg?.type === 'COLOR') {
      return `background: ${bg.value};`;
    }

    if (bg?.type === 'IMAGE') {
      return css`
        background-image: url(${bg.value});
        background-position: ${bg.position ?? 'center top'};
        background-repeat: ${bg.size === 'cover' ? 'no-repeat' : 'repeat-y'};
        background-size: ${bg.size ?? 'auto'};

        @media (min-width: ${SMALL_VIEWPORT_WIDTH_MAX}px) {
          background-size: cover;
          background-repeat: no-repeat;
        }
      `;
    }
  }}
`;

export default function Background({
  bg,
  children,
  ...rest
}: PropsWithChildren<BackgroundProps>) {
  const theme = useAppTheme();

  useEffect(() => {
    if (bg?.type === 'COLOR') {
      document.body.style.background = bg.value;
    } else if (theme.common.bgColor) {
      document.body.style.background = theme.common.bgColor;
    }
  }, [bg, theme.common.bgColor]);

  return (
    <StyledBackground {...rest} bg={bg}>
      {children}
    </StyledBackground>
  );
}
