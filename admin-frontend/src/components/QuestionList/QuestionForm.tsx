import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FieldArray, Form, Formik, FormikHelpers } from 'formik';
import * as R from 'ramda';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import * as yup from 'yup';
import { setValidationsLocales } from '../../locales/util';
import { flattenOptionErrors } from './util';
import { QuestionsContext } from '../../contexts';
import {
  Option,
  Question,
  QuestionDto,
  QuestionType,
  Topic,
} from '../../types';
import Dropdown from '../Dropdown';
import FormDebugger from '../FormDebugger';
import OnSubmitErrors from '../OnSubmitErrors';
import QuestionOptionsList from './QuestionOptionsList';

interface QuestionFormProps {
  onSubmit: (values: QuestionDto) => Promise<any>;
  close: VoidFunction;
  categoryId: string;
  topics: Topic[];
  questionTypes: QuestionType[];
  options: Option[];
  question?: Question;
}

const fieldMappings: Record<string, string> = {
  'label': 'questionLabel',
  'topicUuid': 'topic',
  'typeUuid': 'questionType',
  'options\\[\\d+\\]\\.label': 'option',
};

setValidationsLocales(fieldMappings);

const validationSchema = yup.object().shape({
  label: yup.string().required().min(3),
  typeUuid: yup.string().required(),
  options: yup.array().of(
    yup.object().shape({
      label: yup.string().required(),
    })
  ),
});

const QuestionForm: React.FC<QuestionFormProps> = ({
  close,
  onSubmit,
  question,
  categoryId,
  topics,
  questionTypes,
  options,
}) => {
  const { sortIndex } = useContext(QuestionsContext);
  const { t } = useTranslation();
  const isEditMode = !!question;
  const initialValues: QuestionDto = {
    uuid: uuidv4(),
    label: '',
    topicUuid: '',
    typeUuid: '',
    categoryUuid: categoryId,
    tags: [],
    options: R.sortBy(R.prop('sortIndex'), options),
    sortIndex,
    ...(isEditMode &&
      R.pick(
        [
          'id',
          'uuid',
          'label',
          'topicUuid',
          'typeUuid',
          'categoryUuid',
          'tags',
          'gameUuid',
          'sortIndex',
        ],
        question
      )),
  };
  const submit = async (
    savedValues: QuestionDto,
    helpers: FormikHelpers<any>
  ) => {
    await onSubmit(savedValues);
    helpers.resetForm();
    close();
  };

  return (
    <Formik
      onSubmit={submit}
      onReset={close}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleChange, errors, values, touched, isSubmitting }) => (
        <Form data-cy="question-edit-form">
          <DialogContent>
            <OnSubmitErrors
              errors={{
                ...R.omit(['options'], errors),
                ...flattenOptionErrors(errors),
              }}
              isSubmitting={isSubmitting}
            />

            <Box display="flex" justifyContent="space-between">
              <Dropdown
                sx={{ mr: 2 }}
                name="topicUuid"
                label={t('topic')}
                value={values.topicUuid}
                onChange={handleChange}
                error={touched.topicUuid && Boolean(errors.topicUuid)}
                helperText={
                  touched.topicUuid &&
                  errors.topicUuid &&
                  t(`validationError`, errors.topicUuid)
                }
              >
                <MenuItem value="">{t('noTopic')}</MenuItem>
                {R.sortBy(R.prop('label'), topics).map(({ label, uuid }) => (
                  <MenuItem key={uuid} value={uuid}>
                    {label}
                  </MenuItem>
                ))}
              </Dropdown>

              <Dropdown
                name="typeUuid"
                label={t('questionType')}
                value={values.typeUuid}
                onChange={handleChange}
                error={touched.typeUuid && Boolean(errors.typeUuid)}
                helperText={
                  touched.typeUuid &&
                  errors.typeUuid &&
                  t(`validationError`, errors.typeUuid)
                }
              >
                {R.sortBy(R.prop('label'), questionTypes).map(
                  ({ label, uuid }) => (
                    <MenuItem key={uuid} value={uuid}>
                      {label}
                    </MenuItem>
                  )
                )}
              </Dropdown>
            </Box>

            <TextField
              fullWidth
              name="label"
              label={t('questionLabel')}
              value={values.label}
              disabled={isSubmitting}
              onChange={handleChange}
              error={touched.label && Boolean(errors.label)}
              helperText={
                touched.label &&
                errors.label &&
                t(`validationError`, errors.label)
              }
              sx={{ my: 2 }}
            />

            <Box sx={{ pl: 6 }}>
              <FieldArray name="options">
                {({ push, remove }) => (
                  <QuestionOptionsList
                    options={values.options}
                    questionUuid={values.uuid}
                    add={push}
                    remove={remove}
                  />
                )}
              </FieldArray>
            </Box>
          </DialogContent>

          <Divider sx={{ mb: 3 }} />

          <DialogActions>
            <Button type="reset" disabled={isSubmitting}>
              {t('cancel')}
            </Button>

            <Button
              data-cy="group-edit-done-button"
              variant="contained"
              type="submit"
              disabled={isSubmitting}
            >
              {t('save')}
            </Button>
          </DialogActions>
          <FormDebugger values={values} errors={errors} />
        </Form>
      )}
    </Formik>
  );
};

export default QuestionForm;
