import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Icon from '@/components/Icon';

interface ExternalLinkProps {
  href: string;
}

const ExteralLinkIcon = styled(Icon)`
  margin-left: 4px;
`;

function ExternalLink({
  href,
  children,
  ...rest
}: PropsWithChildren<ExternalLinkProps>) {
  const { t } = useTranslation();
  return (
    <a href={href} target="_blank" rel="noreferrer" {...rest}>
      {children}
      <ExteralLinkIcon
        icon="external-link"
        size={14}
        alt={t('opensInNewTab')}
      />
    </a>
  );
}

export default ExternalLink;
