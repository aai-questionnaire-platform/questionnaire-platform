import { useSession } from 'next-auth/react';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useOrganizations } from '@/api/hooks';
import Flex from '@/components/Flex';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { ColorOrBackgroundImage } from '@/schema/Components';
import { findOrganization } from '@/util';

interface AdminGroupsHeaderProps {
  logo?: ColorOrBackgroundImage;
}

const ImagePlaceHolder = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background-color: ${({ color }) => color};
`;

const LogoBadge = styled.div<{ src: string }>`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: ${({ src }) => `url(${src})`};
  background-position: center;
`;

function AdminGroupsHeader({ logo }: AdminGroupsHeaderProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { data: organizations = [] } = useOrganizations(true);
  const organizationName = findOrganization(
    organizations,
    R.last(session!.user.organizationIds)!
  )?.name;

  return (
    <Flex direction="row" align="center">
      <Spacer mr={16}>
        {logo?.type === 'IMAGE' && <LogoBadge src={logo.value} />}

        {logo?.type === 'COLOR' && <ImagePlaceHolder color={logo.value} />}
      </Spacer>

      <div>
        <Typography as="div">{organizationName}</Typography>
        <Typography as="div" weight="bold">
          {session?.user.name}
        </Typography>
      </div>
    </Flex>
  );
}

export default AdminGroupsHeader;
