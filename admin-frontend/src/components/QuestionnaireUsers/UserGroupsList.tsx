import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Group, User } from '../../types';

interface UserGroupsListProps {
  user: User;
  groups: Group[];
}

const UserGroupsList = ({ user, groups = [] }: UserGroupsListProps) => {
  const { t } = useTranslation();
  const usersGroups = groups.filter(({ uuid }) =>
    (user.group_ids ?? []).includes(uuid)
  );

  if (!usersGroups.length) {
    return (
      <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
        {t('userDoesntBelongToAnyGroup', { name: user.name || t('user') })}
      </Typography>
    );
  }

  return (
    <>
      <Typography
        id="user-groups-title"
        variant="body1"
        component="h4"
        sx={{ mt: 2 }}
      >
        {t('userBelongsToGroups', { name: user.name || t('user') })}
      </Typography>

      <List
        data-cy="user-groups-list"
        aria-labelledby="user-groups-title"
        disablePadding
        sx={{
          'display': 'flex',
          'flexWrap': 'wrap',
          'mt': 2,
          '& > :not(:last-child)': {
            mr: 1,
          },
        }}
      >
        {usersGroups.map(({ entryId, name }) => (
          <ListItem key={entryId} sx={{ width: 'auto', p: 0 }}>
            <Chip label={name} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default UserGroupsList;
