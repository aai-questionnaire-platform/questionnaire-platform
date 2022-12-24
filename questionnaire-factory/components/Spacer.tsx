import styled, { css } from 'styled-components';

interface SpacerProps {
  m?: number;
  mt?: number;
  mb?: number;
  mr?: number;
  ml?: number;
  mh?: number;
  mv?: number;
}

const Spacer = styled.div<SpacerProps>`
  ${({ m }) =>
    m &&
    css`
      margin: ${m / 16}rem;
    `}

  ${({ mh }) =>
    mh &&
    css`
      margin-left: ${mh / 16}rem;
      margin-right: ${mh / 16}rem;
    `}

  ${({ mv }) =>
    mv &&
    css`
      margin-top: ${mv / 16}rem;
      margin-bottom: ${mv / 16}rem;
    `}

  ${({ mt }) =>
    mt &&
    css`
      margin-top: ${mt / 16}rem;
    `}

  ${({ mr }) =>
    mr &&
    css`
      margin-right: ${mr / 16}rem;
    `}

  ${({ mb }) =>
    mb &&
    css`
      margin-bottom: ${mb / 16}rem;
    `}

  ${({ ml }) =>
    ml &&
    css`
      margin-left: ${ml / 16}rem;
    `}
`;

export default Spacer;
