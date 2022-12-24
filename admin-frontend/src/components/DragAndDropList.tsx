import List, { ListProps } from '@mui/material/List';
import { ReactNode } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';

interface DragAndDropListProps extends Omit<ListProps, 'onDragEnd'> {
  children: ReactNode;
  id: string;
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
}

const DragAndDropList = ({
  children,
  id,
  onDragEnd,
  ...rest
}: DragAndDropListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={id} direction="vertical">
        {(provided) => (
          <List {...rest} ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragAndDropList;
