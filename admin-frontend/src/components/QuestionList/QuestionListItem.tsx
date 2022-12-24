import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveQuestionMutation } from '../../api/hooks';
import { Question, QuestionDto, Questionnaire } from '../../types';
import DraggableListItem from '../DraggableListItem';
import ListItemRemoveButton from '../ListItemRemoveButton';
import QuestionFormDialog from './QuestionFormDialog';

interface QuestionListItemProps {
  question: Question;
  questionnaire: Questionnaire;
  index: number;
  rank: number;
  onSubmit: (values: QuestionDto) => Promise<any>;
}

const QuestionListItem = ({
  question,
  questionnaire,
  index,
  rank,
  onSubmit,
}: QuestionListItemProps) => {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [removeQuestion] = useRemoveQuestionMutation(
    question.uuid,
    question.categoryUuid,
    questionnaire.uuid
  );

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  return (
    <>
      <DraggableListItem
        aria-label={t('editLabel', { label: question.label })}
        label={question.label}
        id={question.id}
        index={index}
        key={question.id}
        onClick={openDialog}
        rank={rank}
        secondaryAction={
          <ListItemRemoveButton
            data-cy="question-remove-button"
            aria-label={t('deleteQuestion', {
              label: question.label,
            })}
            onClick={() => removeQuestion(question)}
          />
        }
        isDraft={question.meta.status === 'draft'}
      />

      <QuestionFormDialog
        isOpen={showDialog}
        close={closeDialog}
        onSubmit={onSubmit}
        question={question}
      />
    </>
  );
};

export default QuestionListItem;
