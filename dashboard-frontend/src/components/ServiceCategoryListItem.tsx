import React from 'react';
import styled from 'styled-components';

import Link from '@/components/Link';

const ListItem = styled.div`
  display: flex;
  position: relative;
  min-height: 128px;
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 20px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
`;

const StyledLink = styled(Link)`
  position: absolute;
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
  align-items: flex-end;
`;

const Label = styled.span`
  flex: 1;
  padding: 16px;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.white};
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8) 30px);
`;

interface ServiceCategoryListItemProps {
  coverPhoto?: { src: string; alt: string };
  label: string;
  to: string;
}

function ServiceCategoryListItem({
  coverPhoto,
  label,
  to,
}: ServiceCategoryListItemProps) {
  return (
    <ListItem role="listitem">
      {coverPhoto && <Image src={coverPhoto.src} alt={coverPhoto.alt} />}
      <StyledLink to={to}>
        <Label>{label}</Label>
      </StyledLink>
    </ListItem>
  );
}

export default ServiceCategoryListItem;
