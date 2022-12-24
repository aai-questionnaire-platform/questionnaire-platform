import { useQuery } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useCreateCategoryMutation } from '../api/hooks';
import { QUESTIONNAIRE } from '../api/queries';
import { findLargestSortIndex } from '../util';
import { useQueryParams } from '../util/hooks';
import { listCategoriesLens, listQuestionnairesDataLens } from '../util/lenses';
import CategoryList from '../components/CategoryList';
import Error from '../components/Error';
import FloatingActionButton from '../components/FloatingActionButton';
import Loader from '../components/Loader';
import UnpublishedChangesChip from '../components/UnpublishedChangesChip';
import { Category, CategoryDto } from '../types';

const QuestionnaireContentManagement = () => {
  const id = useQueryParams().get('questionnaireId');
  const { t } = useTranslation();
  const [createCategory] = useCreateCategoryMutation(id);
  const { loading, error, data } = useQuery(QUESTIONNAIRE, {
    variables: { uuid: id },
    context: { clientName: 'manage' },
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const { meta, uuid } = R.view(listQuestionnairesDataLens, data)[0];
  const categories = R.filter<Category>(
    R.propEq('questionnaireUuid', uuid),
    R.view(listCategoriesLens, data)
  );

  const createCategoryForQuestionnaire = (): CategoryDto => ({
    description: t('newCategoryEntry'),
    questionnaireUuid: uuid,
    uuid: uuidv4(),
    entryMessages: [],
    exitMessages: [],
    sortIndex: findLargestSortIndex(categories) + 1,
  });

  const isDraft = meta.status === 'draft';

  return (
    <>
      <Box display="flex" flexDirection="row" alignItems="center" mb={4}>
        <Typography variant="h1" sx={{ mb: 0 }}>
          {t('editGame')}
        </Typography>
        <UnpublishedChangesChip
          label={t(isDraft ? 'draft' : 'published')}
          sx={{ ml: 3 }}
          color={isDraft ? 'warning' : 'success'}
          data-cy="content-management-draft-chip"
        />
      </Box>

      <Typography id="category-list-title" variant="h2">
        {t('gameCategories')}
      </Typography>
      {!!categories.length && (
        <Typography>{t('gameCategoriesDescription')}</Typography>
      )}

      <Box pt={4} pb={12}>
        <CategoryList categories={categories} labelId="category-list-title" />
      </Box>

      <FloatingActionButton
        icon={<AddIcon />}
        label={t('addCategory')}
        onClick={R.pipe(createCategoryForQuestionnaire, createCategory)}
        data-cy="add-category-button"
      />
    </>
  );
};

export default QuestionnaireContentManagement;
