import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupsTab from '../components/GroupsTab';
import OrganizationSelect from '../components/QuestionnaireUsers/OrganizationSelect';
import UsersList from '../components/QuestionnaireUsers/UsersList';
import TabView from '../components/TabView';
import { Organization } from '../types';

const QuestionnaireUserManagement = () => {
  const { t } = useTranslation();
  const [area, setArea] = useState<Organization | undefined>(undefined);
  const [unit, setUnit] = useState<Organization | undefined>(undefined);

  return (
    <>
      <Typography variant="h1">{t('userManagement')}</Typography>
      <Typography component="p">{t('userManagementDescription')}</Typography>

      <Divider sx={{ my: 4 }} />

      <Typography component="p">{t('selectAreaAndUnitFirst')}</Typography>

      <Box pt={5} pb={4}>
        <OrganizationSelect
          area={area}
          unit={unit}
          onAreaSelect={setArea}
          onUnitSelect={setUnit}
        />
      </Box>

      {area && unit && (
        <TabView
          labels={[t('manageUsers'), t('manageGroups')]}
          name="user-management"
        >
          <UsersList area={area} unit={unit} />
          <GroupsTab area={area} unit={unit} />
        </TabView>
      )}
    </>
  );
};

export default QuestionnaireUserManagement;
