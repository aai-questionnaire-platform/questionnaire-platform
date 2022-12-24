import DeleteIcon from '@mui/icons-material/Delete';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import * as R from 'ramda';

const buttonSx = {
  '&:hover': { backgroundColor: 'primary.light' },
};

const ListItemRemoveButton = ({ sx, ...rest }: IconButtonProps) => {
  return (
    <IconButton {...rest} sx={sx ? R.mergeDeepRight(buttonSx, sx) : buttonSx}>
      <DeleteIcon />
    </IconButton>
  );
};

export default ListItemRemoveButton;
