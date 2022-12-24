import Fab, { FabProps } from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

interface FloatingActionButtonProps extends FabProps {
  icon?: ReactNode;
  label: string;
}

const FloatingActionButton = ({
  icon = null,
  label,
  ...rest
}: FloatingActionButtonProps) => {
  return (
    <Fab
      {...rest}
      color="primary"
      sx={{ position: 'fixed', bottom: 32, right: 32 }}
      variant="extended"
    >
      {icon}
      <Typography
        sx={{
          color: 'inherit',
          fontSize: 16,
          fontWeight: 500,
          mx: 1,
          textTransform: 'none',
        }}
      >
        {label}
      </Typography>
    </Fab>
  );
};

export default FloatingActionButton;
