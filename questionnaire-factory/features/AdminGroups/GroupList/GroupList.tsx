import { useTranslation } from 'react-i18next';

import Heading from '@/components/Heading';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { Group } from '@/types';

import GroupListItem from './GroupListItem';

interface GroupListProps {
  groups: Group[];
}

function GroupList({ groups }: GroupListProps) {
  const { t } = useTranslation();

  return (
    <>
      <Spacer mb={24}>
        <Heading variant="h2" align="center">
          {t('adminGroups.groupListheading')}
        </Heading>
      </Spacer>

      <ul data-cy="groups-list">
        {!!groups.length &&
          groups.map((group, idx) => (
            <GroupListItem key={group.id} group={group} order={idx}>
              {group.name}
            </GroupListItem>
          ))}

        {!groups.length && (
          <Typography as="li" italic align="center">
            {t('adminGroups.noGroups')}
          </Typography>
        )}
      </ul>
    </>
  );
}

export default GroupList;
