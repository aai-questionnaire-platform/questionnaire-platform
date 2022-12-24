import styled, { css } from 'styled-components';

interface FlexProps {
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'wrap' | 'no-wrap' | 'wrap-reverse';
  grow?: number;
  shrink?: number;
}

const Flex = styled.div<FlexProps>`
  display: flex;
  ${({ justify }) =>
    justify &&
    css`
      justify-content: ${justify};
    `}
  ${({ align }) =>
    align &&
    css`
      align-items: ${align};
    `}
  ${({ direction }) =>
    direction &&
    css`
      flex-direction: ${direction};
    `}
  ${({ wrap }) =>
    wrap &&
    css`
      flex-wrap: ${wrap};
    `}
  ${({ grow }) =>
    grow &&
    css`
      flex-grow: ${grow};
    `}
  ${({ shrink }) =>
    shrink &&
    css`
      flex-shrink: ${shrink};
    `}
`;

export const flexCenteredColumn = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Flex;
