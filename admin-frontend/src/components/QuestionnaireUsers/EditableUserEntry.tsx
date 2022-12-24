import * as R from 'ramda';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { editUser } from '../../api/api';
import { Group, Organization, User } from '../../types';
import AddUserDialog from '../AddUserDialog';
import EditableListItem from '../EditableListItem';
import ListItemRemoveButton from '../ListItemRemoveButton';

interface EditableUserEntryProps {
  organizationHierarchy: Organization[];
  user: User;
  groups: Group[];
  removable?: boolean;
}

const EditableUserEntry = ({
  organizationHierarchy,
  user,
  groups,
  removable = true,
}: EditableUserEntryProps) => {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const toggleDialog = () => setShowDialog(!showDialog);

  const deleteUser = () => {
    console.log('TODO: Delete user');
  };

  return (
    <>
      <EditableListItem
        aria-label={t('editUserTitle', { name: user.name })}
        label={user.name || user.email}
        onClick={toggleDialog}
        secondaryAction={
          removable ? (
            <ListItemRemoveButton
              aria-label={t('deleteUser')}
              onClick={deleteUser}
            />
          ) : undefined
        }
      />

      {showDialog && (
        <AddUserDialog
          open
          title={t(user.name || user.email)}
          user={user}
          groups={groups}
          areaName={R.head(organizationHierarchy)?.name ?? ''}
          unit={R.last(organizationHierarchy)!}
          onSubmit={editUser}
          onClose={toggleDialog}
          submitLabel={t('save')}
        />
      )}
    </>
  );
};

export default EditableUserEntry;
