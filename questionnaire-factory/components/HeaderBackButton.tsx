import styled from 'styled-components';

import Icon from '@/components/Icon';
import LinkButton, { LinkButtonProps } from '@/components/LinkButton';

const BackButton = styled(LinkButton)`
  padding: 8px;
`;

function HeaderBackButton({ slug, label, ...rest }: LinkButtonProps) {
  return (
    <BackButton
      {...(rest as any)}
      slug={slug}
      label={label}
      startIcon={<Icon icon="chevron-left" size={14} />}
      variant="flat"
    />
  );
}

export default HeaderBackButton;
