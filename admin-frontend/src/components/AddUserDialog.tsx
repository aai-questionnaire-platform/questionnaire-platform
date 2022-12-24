import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { setValidationsLocales } from '../locales/util';
import { rejectBackdropClick, toUserDto } from '../util';
import { Group, Organization, User } from '../types';
import FormDebugger from './FormDebugger';
import OnSubmitErrors from './OnSubmitErrors';
import UserGroupsList from './QuestionnaireUsers/UserGroupsList';

interface AddUserDialogProps {
  areaName: string;
  unit: Organization;
  onClose: VoidFunction;
  onSubmit: Function;
  groups?: Group[];
  groupId?: string;
  open: boolean;
  title?: string;
  user?: User;
  submitLabel: string;
}

setValidationsLocales(undefined);

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
});

const AddUserDialog = ({
  areaName,
  unit,
  onClose,
  onSubmit,
  groupId,
  groups = [],
  open,
  title = '',
  user,
  submitLabel = '',
}: AddUserDialogProps) => {
  const { t } = useTranslation();
  const {
    handleChange,
    handleReset,
    handleSubmit,
    errors,
    values,
    touched,
    isSubmitting,
  } = useFormik<User>({
    onSubmit: async (formValues, actions) => {
      try {
        await onSubmit(toUserDto(formValues));
        onClose();
      } catch (e) {
        // TODO: Handle error
      } finally {
        actions.setSubmitting(false);
      }
    },
    initialValues: {
      email: '',
      name: '',
      group_ids: groupId ? [groupId] : [],
      organization_id: unit.uuid,
      ...user,
    },
    validationSchema,
  });

  const handleCancel = (e: React.FormEvent<HTMLFormElement> | undefined) => {
    handleReset(e);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={rejectBackdropClick(onClose)}
      data-cy="add-user-modal"
    >
      <form
        onSubmit={handleSubmit}
        onReset={handleCancel}
        aria-labelledby="add-user-form-title"
      >
        <DialogTitle id="add-user-form-title">{title}</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            {`${areaName} / ${unit.name}`}
          </DialogContentText>

          <OnSubmitErrors errors={errors} isSubmitting={isSubmitting} />

          <TextField
            label={t('name')}
            name="name"
            data-cy="add-user-form-name"
            fullWidth
            onChange={handleChange}
            value={values.name}
            error={touched.name && Boolean(errors.name)}
            helperText={
              touched.name && errors.name && t(`validationError`, errors.name)
            }
            sx={{ my: 1 }}
          />
          <TextField
            label={t('email')}
            name="email"
            data-cy="add-user-form-email"
            fullWidth
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            value={values.email}
            disabled={!!values.id}
            helperText={
              touched.email &&
              errors.email &&
              t(`validationError`, errors.email)
            }
            sx={{ my: 1 }}
          />

          {user && <UserGroupsList user={user} groups={groups} />}
        </DialogContent>

        <Divider sx={{ mb: 3 }} />

        <DialogActions>
          <Button type="reset">{t('cancel')}</Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            data-cy="add-user-button"
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </form>

      <FormDebugger values={values} />
    </Dialog>
  );
};

export default AddUserDialog;
