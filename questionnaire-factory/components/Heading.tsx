import { forwardRef, HTMLProps, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

type HeadingProps = PropsWithChildren<
  {
    variant: 'h1' | 'h2' | 'h3';
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    align?: 'left' | 'right' | 'center';
    color?: string;
  } & HTMLProps<HTMLHeadingElement>
>;

const HeadingBase = forwardRef(function HeadingBaseWithRef(
  { variant, as: Component = variant, ...rest }: HeadingProps,
  ref
) {
  return <Component ref={ref as any} {...rest} />;
});

const h1Styles = css`
  font-size: 1.3125rem;
  line-height: 1.75rem;
  font-weight: 600;
`;

const h2Styles = css`
  font-size: 1.125rem;
  line-height: 1.5em;
  font-weight: 600;
`;
const h3Styles = css`
  font-size: 1rem;
  line-height: 1.5em;
  font-weight: 600;
`;

const Heading = styled(HeadingBase)<HeadingProps>`
  ${({ align }) => `text-align: ${align};`}
  ${({ color }) => `color: ${color};`}
  ${({ variant }) => {
    switch (variant) {
      case 'h1':
        return h1Styles;
      case 'h2':
        return h2Styles;
      case 'h3':
        return h3Styles;
      default:
        return '';
    }
  }}
  ${({ theme }) => theme.heading?.font && `font-family: ${theme.heading.font};`}
  ${({ theme }) =>
    theme.heading?.weight && `font-weight: ${theme.heading.weight};`}
`;

export default Heading;
