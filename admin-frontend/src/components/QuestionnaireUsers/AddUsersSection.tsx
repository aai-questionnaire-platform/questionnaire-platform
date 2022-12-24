import PersonAdd from '@mui/icons-material/PersonAdd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createUser } from '../../api/api';
import FloatingActionButton from '../../components/FloatingActionButton';
import { Organization } from '../../types';
import AddUserDialog from '../AddUserDialog';

interface AddUsersSectionProps {
  areaName: string;
  unit: Organization;
}

const AddUsersSection = ({ areaName, unit }: AddUsersSectionProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation();

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <FloatingActionButton
        onClick={handleOpenDialog}
        data-cy="open-create-user-form"
        icon={<PersonAdd />}
        label={t('addUser')}
      />

      {showDialog && (
        <AddUserDialog
          open
          areaName={areaName}
          unit={unit}
          onSubmit={createUser}
          onClose={handleCloseDialog}
          title={t('addUser')}
          submitLabel={t('addUser')}
        />
      )}
    </>
  );
};

export default AddUsersSection;
