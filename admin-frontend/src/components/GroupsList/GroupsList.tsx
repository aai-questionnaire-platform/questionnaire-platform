import { useQuery } from '@apollo/client';
import AddIcon from '@mui/icons-material/GroupAdd';
import List from '@mui/material/List';
import * as R from 'ramda';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateGroupMutation, useEditGroupMutation } from '../../api/hooks';
import { LIST_GROUPS } from '../../api/queries';
import { focusOn } from '../../util';
import { useEffectAfterMount } from '../../util/hooks';
import { getParentId, getSortedGroupsFromQueryResponse } from './util';
import { Organization } from '../../types';
import Error from '../Error';
import FloatingActionButton from '../FloatingActionButton';
import EditableGroupEntry from './EditableGroupEntry';
import GroupEditDialog from './GroupEditDialog';

interface GroupsListProps {
  organizationHierarchy: Organization[];
}

const GroupsList = ({ organizationHierarchy }: GroupsListProps) => {
  const { t } = useTranslation();
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [saveGroup] = useCreateGroupMutation();
  const [editGroup] = useEditGroupMutation();
  const toggleAddForm = () => setAddFormOpen(!isAddFormOpen);
  const parentId = getParentId(organizationHierarchy);
  const { data, error } = useQuery(LIST_GROUPS, {
    variables: { parentId },
  });

  useEffectAfterMount(() => {
    if (!isAddFormOpen) {
      focusOn('#groups-add-button');
    }
  }, [isAddFormOpen]);

  if (error) {
    return <Error error={error} />;
  }

  const groups = R.filter(
    R.propEq('organizationUuid', parentId),
    getSortedGroupsFromQueryResponse(data)
  );

  return (
    <>
      <List aria-label={t('groupsInUnit')} data-cy="groups-list">
        {groups.map((group, index) => (
          <EditableGroupEntry
            key={group.id || index}
            group={group}
            organizationHierarchy={organizationHierarchy}
            saveGroup={editGroup}
          />
        ))}
      </List>

      <FloatingActionButton
        id="groups-add-button"
        data-cy="open-create-user-form"
        icon={<AddIcon />}
        label={t('addGroup')}
        onClick={toggleAddForm}
      />

      {isAddFormOpen && (
        <GroupEditDialog
          open
          organizationHierarchy={organizationHierarchy}
          saveGroup={saveGroup}
          close={toggleAddForm}
        />
      )}
    </>
  );
};

export default GroupsList;
