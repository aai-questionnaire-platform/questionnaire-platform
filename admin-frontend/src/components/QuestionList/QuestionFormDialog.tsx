import { useQuery } from '@apollo/client';
import { Theme, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/system/Box';
import * as R from 'ramda';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_OPTIONS } from '../../api/queries';
import { rejectBackdropClick } from '../../util';
import {
  listOptionsLens,
  listQuestionTypesLens,
  listTopicsLens,
  viewOr,
} from '../../util/lenses';
import { QuestionnaireContext } from '../../contexts';
import {
  Option,
  Question,
  QuestionDto,
  QuestionType,
  Topic,
} from '../../types';
import Loader from '../Loader';
import UnpublishedChangesChip from '../UnpublishedChangesChip';
import QuestionForm from './QuestionForm';

interface QuestionFormDialogProps {
  onSubmit: (values: QuestionDto) => Promise<any>;
  close: VoidFunction;
  isOpen: boolean;
  question?: Question;
}

const QuestionFormDialog = ({
  question,
  isOpen,
  close,
  onSubmit,
}: QuestionFormDialogProps) => {
  const { t } = useTranslation();
  const { query, categoryId } = useContext(QuestionnaireContext);
  const topics: Topic[] = R.view(listTopicsLens, query);
  const questionTypes: QuestionType[] = R.view(listQuestionTypesLens, query);
  const { data: optionsQuery, loading } = useQuery(LIST_OPTIONS, {
    variables: { questionUuid: question?.uuid },
    skip: !question || !isOpen,
    context: { clientName: 'manage' },
    fetchPolicy: 'network-only',
  });
  const options: Option[] = viewOr([], listOptionsLens, optionsQuery);
  const isEditMode = !!question;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  return (
    <Dialog
      open={isOpen}
      onClose={rejectBackdropClick(close)}
      fullWidth
      fullScreen={isMobile}
      data-cy="question-form-dialog"
      maxWidth="md"
    >
      <DialogTitle>
        {isEditMode ? t('editQuestion') : t('addQuestion')}
        {question?.meta.status === 'draft' && (
          <UnpublishedChangesChip
            label={t('unpublishedChanges')}
            sx={{ ml: 2 }}
            data-cy="question-form-draft-chip"
          />
        )}
      </DialogTitle>

      {loading ? (
        <Box py={6} pl={1}>
          <Loader />
        </Box>
      ) : (
        <QuestionForm
          close={close}
          onSubmit={onSubmit}
          question={question}
          categoryId={categoryId}
          topics={topics}
          questionTypes={questionTypes}
          options={options}
        />
      )}
    </Dialog>
  );
};

export default QuestionFormDialog;
