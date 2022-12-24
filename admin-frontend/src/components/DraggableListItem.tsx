import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useState, ReactNode } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import UnpublishedChangesChip from './UnpublishedChangesChip';

interface DraggableListItemProps {
  id: string;
  index: number;
  label: string;
  onClick?: () => void;
  rank: number;
  secondaryAction?: ReactNode;
  isDraft?: boolean;
}

const DraggableListItem = ({
  id,
  index,
  label,
  onClick,
  rank,
  secondaryAction,
  isDraft = false,
  ...rest
}: DraggableListItemProps) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          disablePadding
          divider
          secondaryAction={secondaryAction}
        >
          <ListItemButton
            {...rest}
            onClick={onClick}
            data-cy="draggable-entry-edit-button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              'p': 0,
              'pr': 6,
              ...(snapshot.isDragging && {
                bgcolor: 'primary.light',
              }),
              '&:hover': {
                'backgroundColor': 'primary.light',
                '& .MuiTypography-root': {
                  textDecoration: 'underline',
                },
              },
            }}
          >
            <Box
              {...provided.dragHandleProps}
              display="flex"
              height="64px"
              width="56px"
              mr={1}
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              {hovered || snapshot.isDragging ? (
                <DragHandleIcon />
              ) : (
                <Typography sx={{ fontWeight: 500 }}>{rank}</Typography>
              )}
            </Box>
            <ListItemText primary={label} sx={{ py: 1 }} />

            {isDraft && (
              <UnpublishedChangesChip
                sx={{ mr: 3 }}
                data-cy="list-item-draft-chip"
              />
            )}

            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 3 }}>
              <EditIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
