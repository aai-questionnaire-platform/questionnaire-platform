import EditIcon from '@mui/icons-material/Edit';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ReactNode } from 'react';

interface EditableListItemProps {
  label: string;
  onClick?: () => void;
  secondaryAction: ReactNode;
}

const EditableListItem = ({
  label = '',
  onClick,
  secondaryAction,
  ...rest
}: EditableListItemProps) => {
  return (
    <ListItem disablePadding divider>
      <ListItemButton
        {...rest}
        onClick={onClick}
        data-cy="editable-entry-edit-button"
        sx={{
          '&:hover': {
            'backgroundColor': 'primary.light',
            '& span': {
              textDecoration: 'underline',
            },
          },
        }}
      >
        <ListItemText primary={label} sx={{ py: 1 }} />

        <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>
          <EditIcon />
        </ListItemIcon>
      </ListItemButton>
      {secondaryAction}
    </ListItem>
  );
};

export default EditableListItem;
