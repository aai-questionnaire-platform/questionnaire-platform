import { HTMLProps, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

type TypographyProps = PropsWithChildren<
  {
    variant?: 'default' | 'small';
    as?: string;
    color?: string;
    italic?: boolean;
    align?: 'left' | 'right' | 'center';
    weight?: 400 | 500 | 'bold' | 'normal';
  } & HTMLProps<any>
>;

const defaultStyle = css`
  font-size: 1rem;
  line-height: 1.5rem;
`;

const smallStyle = css`
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const Typography = styled(TypographyBase)<TypographyProps>`
  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}

  ${({ italic }) =>
    italic &&
    css`
      font-style: italic;
    `}

  ${({ align }) =>
    css`
      text-align: ${align};
    `}

  ${({ weight }) =>
    css`
      font-weight: ${weight};
    `}

  ${({ variant }) => (variant === 'small' ? smallStyle : defaultStyle)}
  white-space: pre-line;
`;

function TypographyBase({
  as: Component = 'p',
  variant = 'default',
  color,
  italic,
  align,
  weight,
  ...rest
}: TypographyProps) {
  return <Component {...rest} />;
}

export default Typography;
