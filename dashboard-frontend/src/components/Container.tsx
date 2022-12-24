import styled, { css } from 'styled-components';

interface ContainerProps {
  p?: number;
  pt?: number;
  pb?: number;
  pr?: number;
  pl?: number;
  ph?: number;
  pv?: number;
}

const Container = styled.div<ContainerProps>`
  ${({ p }) =>
    p &&
    css`
      padding: ${p / 16}rem;
    `}
  ${({ ph }) =>
    ph &&
    css`
      padding-left: ${ph / 16}rem;
      padding-right: ${ph / 16}rem;
    `}
  ${({ pv }) =>
    pv &&
    css`
      padding-top: ${pv / 16}rem;
      padding-bottom: ${pv / 16}rem;
    `}
  ${({ pt }) =>
    pt &&
    css`
      padding-top: ${pt / 16}rem;
    `}
  ${({ pr }) =>
    pr &&
    css`
      padding-right: ${pr / 16}rem;
    `}
  ${({ pb }) =>
    pb &&
    css`
      padding-bottom: ${pb / 16}rem;
    `}
  ${({ pl }) =>
    pl &&
    css`
      padding-left: ${pl / 16}rem;
    `}
`;

export default Container;
