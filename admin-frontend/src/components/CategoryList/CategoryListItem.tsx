import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveCategoryMutation } from '../../api/hooks';
import { Category } from '../../types';
import ConfirmationDialog from '../ConfirmationDialog';
import DraggableListItem from '../DraggableListItem';
import ListItemRemoveButton from '../ListItemRemoveButton';

interface CategoryListItemProps {
  onClick?: () => void;
  index: number;
  rank: number;
  category: Category;
}

const CategoryListItem = ({
  category,
  index,
  onClick,
  rank,
}: CategoryListItemProps) => {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);

  const [removeCategory] = useRemoveCategoryMutation(
    category.uuid,
    category.questionnaireUuid
  );

  const openDialog = () => {
    setShowDialog(true);
  };

  const confirmDelete = () => {
    removeCategory(category);
    closeDialog();
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <DraggableListItem
        aria-label={t('editLabel', { label: category.description })}
        id={category.id}
        index={index}
        label={category.description}
        onClick={onClick}
        rank={rank}
        secondaryAction={
          <ListItemRemoveButton
            data-cy="editable-entry-remove-button"
            aria-label={t('deleteCategory', {
              description: category.description,
            })}
            onClick={openDialog}
          />
        }
        isDraft={category.meta.status === 'draft'}
      />

      <ConfirmationDialog
        description={t('deleteCategoryConfirmationDescription')}
        onCancel={closeDialog}
        onConfirm={confirmDelete}
        open={showDialog}
        title={t('deleteCategoryConfirmationTitle', {
          categoryName: category.description,
        })}
      />
    </>
  );
};

export default CategoryListItem;
