import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveGroupMutation } from '../../api/hooks';
import { Group, Organization } from '../../types';
import ConfirmationDialog from '../ConfirmationDialog';
import EditableListItem from '../EditableListItem';
import ListItemRemoveButton from '../ListItemRemoveButton';
import GroupEditDialog from './GroupEditDialog';

interface EditableGroupEntryProps {
  organizationHierarchy: Organization[];
  group: Group;
  saveGroup: any;
}

const EditableGroupEntry = ({
  group,
  organizationHierarchy,
  saveGroup,
}: EditableGroupEntryProps) => {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [removeGroup] = useRemoveGroupMutation(
    group.entryId,
    group.organizationUuid
  );

  const openDeleteDialog = () => setShowDeleteDialog(true);
  const openEditDialog = () => setShowEditDialog(true);
  const closeDeleteDialog = () => setShowDeleteDialog(false);
  const closeEditDialog = () => setShowEditDialog(false);

  const confirmDelete = () => {
    removeGroup(group);
    closeDeleteDialog();
  };

  return (
    <>
      <EditableListItem
        aria-label={t('editLabel', { name: group.name })}
        label={group.name}
        onClick={openEditDialog}
        secondaryAction={
          <ListItemRemoveButton
            data-cy="editable-entry-remove-button"
            aria-label={t('removeLabel', { name: group.name })}
            onClick={openDeleteDialog}
          />
        }
      />

      <GroupEditDialog
        group={group}
        organizationHierarchy={organizationHierarchy}
        open={showEditDialog}
        saveGroup={saveGroup}
        close={closeEditDialog}
      />

      <ConfirmationDialog
        description={t('deleteGroupConfirmationDescription')}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        open={showDeleteDialog}
        title={t('deleteGroupConfirmationTitle', {
          groupName: group.name,
        })}
      />
    </>
  );
};

export default EditableGroupEntry;
