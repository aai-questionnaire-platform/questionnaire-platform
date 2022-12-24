import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useEditCategoryMutation } from '../../api/hooks';
import { useEffectAfterMount } from '../../util/hooks';
import { formatMultiLine, toCategoryDto } from './utils';
import { Category } from '../../types';
import FormDebugger from '../FormDebugger';
import QuestionList from '../QuestionList';
import TextFieldWithStatusIndicator from '../TextFieldWithStatusIndicator';
import { CategoryFormValues } from './types';

interface CategoryEditFormProps {
  category: Category;
}

const validationSchema = yup.object().shape({
  description: yup.string().required('required'),
});

const pickInitialValues = R.pick([
  'description',
  'entryMessages',
  'exitMessages',
  'gameUuid',
]);

const CategoryEditForm = ({ category }: CategoryEditFormProps) => {
  const { t } = useTranslation();
  const [editCategory] = useEditCategoryMutation(category.questionnaireUuid);
  const {
    errors,
    values,
    touched,
    setFieldValue,
    handleChange,
    submitForm,
    resetForm,
  } = useFormik<CategoryFormValues>({
    onSubmit: async (formValues) =>
      editCategory(toCategoryDto(formValues, category) as Category),
    initialValues: pickInitialValues(category),
    validationSchema,
  });

  const formatAndSetMultiLineField = (fName: string) =>
    R.pipe(formatMultiLine, R.partial(setFieldValue, [fName]));

  // when changes are discarded it changes the status of the category from draft
  // to published, so we should reinitialize the form values here
  useEffectAfterMount(() => {
    if (category.meta.status === 'published') {
      resetForm({ values: pickInitialValues(category) });
    }
  }, [category.meta.status, resetForm]);

  return (
    <>
      <form aria-labelledby="edit-category-heading">
        <Typography variant="h2" sx={{ mb: 2 }}>
          {t('title')}
        </Typography>

        <Box mt={3} mb={6}>
          <TextFieldWithStatusIndicator
            id="category-title"
            submitForm={submitForm}
            label={t('categoryTitle')}
            inputProps={{
              'data-cy': 'edit-category-description',
            }}
            fullWidth
            variant="outlined"
            name="description"
            value={values.description}
            onChange={handleChange}
            error={touched.description && Boolean(errors.description)}
            helperText={
              touched.description &&
              errors.description &&
              t(`validationError`, {
                field: 'categoryTitle',
                error: errors.description,
              })
            }
          />
        </Box>

        <Typography variant="h2" sx={{ mb: 2 }}>
          {t('coverMessages')}
        </Typography>
        <Typography>{t('coverMessagesDescription')}</Typography>

        <Box mt={3} mb={6} ml={6}>
          <TextFieldWithStatusIndicator
            id="category-entry-message"
            label={t('entryMessage')}
            submitForm={submitForm}
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            inputProps={{
              'data-cy': 'edit-category-entryMessages',
            }}
            name="entryMessages"
            value={values.entryMessages.join('\n')}
            onChange={formatAndSetMultiLineField('entryMessages')}
            error={touched.entryMessages && Boolean(errors.entryMessages)}
            helperText={
              touched.entryMessages &&
              errors.entryMessages &&
              t(`validationError`, {
                field: 'categoryTitle',
                error: errors.entryMessages,
              })
            }
            sx={{ mb: 4 }}
          />

          <TextFieldWithStatusIndicator
            id="category-exit-message"
            label={t('exitMessage')}
            submitForm={submitForm}
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            inputProps={{
              'data-cy': 'edit-category-exitMessages',
            }}
            name="exitMessages"
            value={values.exitMessages.join('\n')}
            onChange={formatAndSetMultiLineField('exitMessages')}
            error={touched.exitMessages && Boolean(errors.exitMessages)}
            helperText={
              touched.exitMessages &&
              errors.exitMessages &&
              t(`validationError`, {
                field: 'categoryTitle',
                error: errors.exitMessages,
              })
            }
          />
        </Box>
      </form>

      <Typography id="questions-list-heading" variant="h2" sx={{ mb: 1 }}>
        {t('questions')}
      </Typography>
      <Typography>{t('questionsListDescription')}</Typography>

      <Box pb={12}>
        <QuestionList labelId="questions-list-heading" category={category} />
      </Box>

      <FormDebugger values={values} />
    </>
  );
};

export default CategoryEditForm;
