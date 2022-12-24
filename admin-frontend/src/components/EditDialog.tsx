import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { rejectBackdropClick } from '../util';
import FloatingIconButton from './AppDrawer/FloatingIconButton';

interface EditDialogProps {
  modalDescription?: string;
  modalInputLabel: string;
  modalTitle: string;
  originalValue: string;
  onSave: (v: string) => void;
  rows?: number;
}

const EditDialog = ({
  modalDescription,
  modalInputLabel,
  modalTitle,
  onSave,
  originalValue,
  rows,
}: EditDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(originalValue);
  const handleOpen = () => setOpen(true);

  const handleCancel = () => {
    setValue(originalValue);
    setOpen(false);
  };

  const handleSave = () => {
    onSave(value);
    setOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <>
      <FloatingIconButton
        onClick={handleOpen}
        sx={{
          'ml': 3,
          'transition': '0.3s all',
          '&:hover': {
            color: 'primary.dark',
          },
        }}
      >
        <RenameIcon />
      </FloatingIconButton>

      <Dialog
        open={open}
        onClose={rejectBackdropClick(handleCancel)}
        sx={{
          '& .MuiDialog-paper': {
            minWidth: 448,
          },
        }}
      >
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          {modalDescription && (
            <DialogContentText sx={{ mb: 2 }}>
              {modalDescription}
            </DialogContentText>
          )}
          <TextField
            fullWidth
            label={modalInputLabel}
            margin="dense"
            onChange={handleChange}
            type="name"
            variant="outlined"
            value={value}
            multiline={!!rows}
            rows={rows}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditDialog;
