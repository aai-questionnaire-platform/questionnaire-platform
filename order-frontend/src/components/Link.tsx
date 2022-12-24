import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import Icon from './Icon';

interface BaseLinkProps {
  to: string;
}

interface InternalLinkProps extends BaseLinkProps {
  external?: false;
}

interface ExternalLinkProps extends BaseLinkProps {
  external: true;
  target?: 'self' | 'blank';
}

export type LinkProps = InternalLinkProps | ExternalLinkProps;

const StyledLink = styled.a`
  color: inherit;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    color: inherit;
  }
`;

const ExteralLinkIcon = styled(Icon)`
  margin-left: 4px;
`;

function Link(props: PropsWithChildren<LinkProps>) {
  const { t } = useTranslation();
  const { children, external, to } = props;

  if (external) {
    const { target = 'blank' } = props as ExternalLinkProps;
    return (
      <StyledLink href={to} target={`_${target}`} rel="noreferrer">
        {children}
        {target === 'blank' && (
          <ExteralLinkIcon
            icon="external-link"
            size={14}
            alt={t('opensInNewTab')}
          />
        )}
      </StyledLink>
    );
  }

  return (
    <StyledLink as={RouterLink} to={to}>
      {children}
    </StyledLink>
  );
}

export default Link;
