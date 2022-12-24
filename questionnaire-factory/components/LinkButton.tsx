import { PropsWithoutRef } from 'react';

import AppLink from '@/components/AppLink';
import Button from '@/components/Button';
import { ButtonProps } from '@/components/Button/ButtonBase';
import ConditionalWrapper from '@/components/ConditionalWrapper';
import { LinkProps } from '@/schema/Components';

export type LinkButtonProps = PropsWithoutRef<
  LinkProps & Omit<ButtonProps, 'label'> & Required<Pick<ButtonProps, 'label'>>
>;

function LinkButton({
  slug,
  label,
  external = false,
  ...rest
}: LinkButtonProps) {
  return (
    <ConditionalWrapper
      if={!external}
      with={(children) => <AppLink slug={slug}>{children}</AppLink>}
    >
      <Button as="a" {...rest} {...(external && { href: slug })} type="">
        {label}
      </Button>
    </ConditionalWrapper>
  );
}

export default LinkButton;
