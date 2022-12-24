import { always as noop } from 'ramda';
import { forwardRef, PropsWithChildren } from 'react';
import { StyledComponent } from 'styled-components';

import { ButtonVariant } from '@/schema/Components';

import { ButtonProps } from './ButtonBase';
import FlatButton from './FlatButton';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const variants: Record<ButtonVariant, StyledComponent<'button', any>> = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  flat: FlatButton,
};

const Button = forwardRef(function ButtonWithRef(
  {
    children,
    disabled,
    onClick,
    variant = 'primary',
    type = 'button',
    iconOnly = false,
    ...rest
  }: PropsWithChildren<ButtonProps>,
  ref
) {
  const Variant = variants[variant];

  return (
    <Variant
      {...(rest as any)}
      ref={ref}
      iconOnly={iconOnly}
      type={type}
      aria-disabled={Boolean(disabled)}
      onClick={disabled ? noop : onClick}
    >
      {rest.startIcon ?? null}
      {children && <span>{children}</span>}
      {rest.endIcon ?? null}
    </Variant>
  );
});

export default Button;
