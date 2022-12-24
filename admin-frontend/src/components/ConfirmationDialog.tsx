import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

const ConfirmationDialog = ({
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && (
          <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button
          onClick={onConfirm}
          data-cy="confirmation-dialog-confirm-button"
        >
          {t('confirmDelete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
