import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import { DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useSortCategoriesMutation } from '../../api/hooks';
import { withUrlParams } from '../../api/utils';
import { createSortChangeSet } from '../../util/drag-and-drop';
import { useQueryParams } from '../../util/hooks';
import paths from '../../routes/paths';
import { Category } from '../../types';
import DragAndDropList from '../DragAndDropList';
import CategoryListItem from './CategoryListItem';

interface CategoryListProps {
  categories: Category[];
  labelId: string;
}

const CategoryList = ({ categories, labelId }: CategoryListProps) => {
  const history = useHistory();
  const { t } = useTranslation();
  const questionnaireUuid = useQueryParams().get('questionnaireId') as string;

  const [sortCategories] = useSortCategoriesMutation(questionnaireUuid);

  const editCategory = (category: Category) => {
    history.push(
      withUrlParams(paths.EDIT_CATEGORY, {
        questionnaireId: category.questionnaireUuid,
        categoryId: category.uuid,
      })
    );
  };

  const sortedCategories = R.sortBy(R.prop('sortIndex'), categories);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || source.index === destination.index) {
      return;
    }

    const changeSet = createSortChangeSet(
      sortedCategories,
      source.index,
      destination.index
    );

    sortCategories(changeSet);
  };

  return (
    <DragAndDropList
      aria-labelledby={labelId}
      data-cy="categories-list"
      id="categories-list"
      onDragEnd={handleDragEnd}
    >
      {categories.length ? (
        sortedCategories.map((category, index) => (
          <CategoryListItem
            key={category.id}
            category={category}
            index={index}
            onClick={() => editCategory(category)}
            rank={index + 1}
          />
        ))
      ) : (
        <ListItem>
          <Typography sx={{ my: 3 }}>{t('noCategoriesAdded')}</Typography>
        </ListItem>
      )}
    </DragAndDropList>
  );
};

export default CategoryList;
