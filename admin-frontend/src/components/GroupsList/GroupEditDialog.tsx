import { useReactiveVar } from '@apollo/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useFetchUsersHook } from '../../api/hooks';
import { usersVar } from '../../api/reactiveVars';
import { setValidationsLocales } from '../../locales/util';
import { rejectBackdropClick, focusOn, sortUsers } from '../../util';
import { getParentId, GroupFormValues, toGroupDto } from './util';
import { Group, Organization, User } from '../../types';
import FormDebugger from '../FormDebugger';
import OnSubmitErrors from '../OnSubmitErrors';
import PinSection from '../PinSection';
import UserAutoComplete from '../UserAutoComplete';

interface GroupEditDialogProps {
  organizationHierarchy: Organization[];
  saveGroup: any;
  open: boolean;
  close: VoidFunction;
  group?: Group;
}

setValidationsLocales({
  name: 'groupName',
});

const validationSchema = yup.object().shape({
  name: yup.string().required().min(3),
});

const GroupEditDialog = ({
  group,
  organizationHierarchy,
  open,
  saveGroup,
  close,
}: GroupEditDialogProps) => {
  const { t } = useTranslation();
  const unit = organizationHierarchy[1];
  const { loading: isUsersloading } = useFetchUsersHook(unit.uuid);
  const userOptions = useReactiveVar(usersVar);
  const isEditMode = !!group;
  const {
    handleChange,
    handleReset,
    handleSubmit,
    setFieldValue,
    errors,
    values,
    touched,
    isSubmitting,
  } = useFormik<GroupFormValues>({
    onSubmit: async (savedValues) => {
      await saveGroup(toGroupDto(savedValues, isEditMode, group));
      close();
    },
    initialValues: {
      name: '',
      groupAdmins: group?.groupAdmins ?? [],
      organizationUuid: getParentId(organizationHierarchy),
      ...R.pick(['name', 'organizationUuid', 'gameUuid'], group || {}),
    },
    validationSchema,
  });

  const handleGroupAdminChange = (updated: User[]) => {
    const existing = values.groupAdmins;
    const added = R.difference(updated, existing);
    const removed = R.difference(existing, updated)
      .filter((u) => !added.find(R.propEq('email', u.email)))
      .map(R.assoc('removed', true));
    const update = R.uniqBy<any, any>(R.prop('email'), [
      ...removed,
      ...updated,
    ]);

    setFieldValue('groupAdmins', update);
  };

  const cancelEdit = R.pipe(handleReset, close);

  return (
    <Dialog
      open={open}
      data-cy="group-edit-form"
      onClose={rejectBackdropClick(close)}
    >
      <form
        onSubmit={handleSubmit}
        onReset={cancelEdit}
        aria-labelledby="group-edit-form-title"
      >
        <DialogTitle id="group-edit-form-title">
          {isEditMode ? group.name : t('addGroup')}
        </DialogTitle>

        <DialogContent sx={{ pb: 3, minWidth: { xs: 240, sm: 480 } }}>
          <DialogContentText sx={{ mb: 2 }}>
            {organizationHierarchy.map(R.prop('name')).join(' / ')}
          </DialogContentText>

          <OnSubmitErrors errors={errors} isSubmitting={isSubmitting} />

          <TextField
            fullWidth
            id="group-edit-form-name"
            label={t('groupName')}
            name="name"
            value={values.name}
            onChange={handleChange}
            disabled={isSubmitting}
            error={touched.name && Boolean(errors.name)}
            helperText={
              touched.name && errors.name && t(`validationError`, errors.name)
            }
            sx={{ my: 2 }}
          />

          {group && (
            <PinSection
              description={t('groupPinCodeDescription')}
              label={t('groupPinCode')}
              pin={group.pin}
            />
          )}

          <Box py={2}>
            <UserAutoComplete
              isLoading={isUsersloading}
              options={sortUsers(userOptions)}
              value={values.groupAdmins.filter(({ removed }) => !removed)}
              onChange={handleGroupAdminChange}
            />
          </Box>
        </DialogContent>

        <Divider sx={{ mb: 3 }} />

        <DialogActions>
          <Button type="reset">{t('cancel')}</Button>

          <Button
            data-cy="group-edit-done-button"
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            onClick={() =>
              !R.isEmpty(errors) &&
              setTimeout(() => focusOn('[aria-invalid="true'), 0)
            }
          >
            {t(isEditMode ? 'finishEdit' : 'addGroup')}
          </Button>
        </DialogActions>
      </form>

      <FormDebugger values={values} />
    </Dialog>
  );
};

export default GroupEditDialog;
