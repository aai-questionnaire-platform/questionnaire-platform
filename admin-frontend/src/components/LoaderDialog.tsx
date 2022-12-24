import Check from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Error from '@mui/icons-material/ErrorOutline';
import { DialogTitle } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../types';

interface LoaderDialogProps {
  state: LoadingState;
  loadingLabel: string;
  successLabel: string;
  errorLabel: string;
}

const LoaderDialog = ({
  state,
  loadingLabel,
  successLabel,
  errorLabel,
  ...rest
}: LoaderDialogProps) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (state === 'loading') {
      setOpen(true);
    } else if (state === 'idle') {
      timer = setTimeout(() => {
        setOpen(false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Dialog
      {...rest}
      open={isOpen}
      onClose={() => setOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 8,
          pb: 6,
          width: 220,
          fontSize: 80,
        },
      }}
      PaperProps={{
        role: 'status',
      }}
    >
      {state === 'error' && (
        <DialogTitle>
          <IconButton
            aria-label={t('close')}
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            data-cy="loader-dialog-close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      <Zoom appear={false} in={state === 'loading'}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          data-cy="loader-dialog-state-loading"
        >
          <CircularProgress size={80} />
          <Typography sx={{ mt: 6 }}>{loadingLabel}</Typography>
        </Box>
      </Zoom>

      <Zoom in={state === 'error'} style={{ transitionDelay: '100ms' }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="absolute"
          data-cy="loader-dialog-state-error"
        >
          <Error color="error" fontSize="inherit" />
          <Typography sx={{ mt: 6 }}>{errorLabel}</Typography>
        </Box>
      </Zoom>

      <Zoom in={state === 'idle'} style={{ transitionDelay: '100ms' }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="absolute"
          data-cy="loader-dialog-state-idle"
        >
          <Check color="success" fontSize="inherit" />
          <Typography sx={{ mt: 6 }}>{successLabel}</Typography>
        </Box>
      </Zoom>
    </Dialog>
  );
};

export default LoaderDialog;
