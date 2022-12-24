import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import { QUESTIONNAIRE } from '../api/queries';
import { useQueryParams } from '../util/hooks';
import { categoryLens } from '../util/lenses';
import CategoryEditForm from '../components/CategoryForm';
import Error from '../components/Error';
import Loader from '../components/Loader';
import UnpublishedChangesChip from '../components/UnpublishedChangesChip';
import { QuestionnaireContext } from '../contexts';
import { Category } from '../types';

const EditCategory = () => {
  const { t } = useTranslation();
  const questionnaireId = useQueryParams().get('questionnaireId') as string;
  const categoryId = useQueryParams().get('categoryId') as string;
  const {
    data: questionnaire,
    loading,
    error,
  } = useQuery(QUESTIONNAIRE, {
    variables: { uuid: questionnaireId },
    context: { clientName: 'manage' },
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const category: Category = R.view(categoryLens(categoryId), questionnaire);

  return (
    <QuestionnaireContext.Provider
      value={{ query: questionnaire, categoryId, questionnaireId }}
    >
      <Box display="flex" flexDirection="row" alignItems="center" mb={4}>
        <Typography id="edit-category-heading" variant="h1" sx={{ mb: 0 }}>
          {t('editCategory')}
        </Typography>

        {category.meta.status === 'draft' && (
          <UnpublishedChangesChip
            sx={{ ml: 3 }}
            data-cy="edit-category-draft-chip"
          />
        )}
      </Box>

      <CategoryEditForm category={category} />
    </QuestionnaireContext.Provider>
  );
};

export default EditCategory;
