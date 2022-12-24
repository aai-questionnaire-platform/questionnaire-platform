import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import * as R from 'ramda';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface UserAutoCompleteProps {
  isLoading: boolean;
  value: User[];
  options: User[];
  onChange: any;
}

const UserAutoComplete = ({
  isLoading,
  options,
  value,
  onChange,
}: UserAutoCompleteProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <InputLabel>
      {t('selectAdminsForGroup')}
      <Autocomplete
        id="group-admins-list"
        multiple
        autoComplete
        disableCloseOnSelect
        open={open}
        loading={isLoading}
        options={options}
        value={value}
        isOptionEqualToValue={R.eqProps('email') as any}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={(_e, v) => onChange(v)}
        clearText={t('clear')}
        closeText={t('close')}
        loadingText={`${t('loading')}...`}
        noOptionsText={t('noAdminUsers')}
        openText={t('openAdminList')}
        getOptionLabel={(option) => option.name || option.email}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.email}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
              checked={selected}
            />
            {option.name || option.email}
          </li>
        )}
      />
    </InputLabel>
  );
};

export default UserAutoComplete;
