import AddIcon from '@mui/icons-material/Add';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import { useContext, useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import {
  useCreateQuestionMutation,
  useSortQuestionsMutation,
  useUpdateQuestionMutation,
} from '../../api/hooks';
import { findLargestSortIndex } from '../../util';
import { createSortChangeSet } from '../../util/drag-and-drop';
import {
  listQuestionnairesDataLens,
  listQuestionsLens,
} from '../../util/lenses';
import { QuestionnaireContext, QuestionsContext } from '../../contexts';
import { Category, Question } from '../../types';
import DragAndDropList from '../DragAndDropList';
import FloatingActionButton from '../FloatingActionButton';
import QuestionFormDialog from './QuestionFormDialog';
import QuestionListItem from './QuestionListItem';

interface QuestionListProps {
  category: Category;
  labelId: string;
}

const QuestionList = ({ category, labelId }: QuestionListProps) => {
  const { t } = useTranslation();
  const { query } = useContext(QuestionnaireContext);
  const questionnaire = R.view(listQuestionnairesDataLens, query)[0];
  const questions = R.filter<Question>(
    R.propEq('categoryUuid', category.uuid),
    R.view(listQuestionsLens, query)
  );
  const [createQuestion] = useCreateQuestionMutation(questionnaire.uuid);
  const [updateQuestion] = useUpdateQuestionMutation(questionnaire.uuid);
  const [sortQuestions] = useSortQuestionsMutation(questionnaire.uuid);
  const [showDialog, setShowDialog] = useState(false);

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  const sortedQuestions = R.sortBy(R.prop('sortIndex'), questions);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || source.index === destination.index) {
      return;
    }

    const changeSet = createSortChangeSet(
      sortedQuestions,
      source.index,
      destination.index
    );

    sortQuestions(changeSet);
  };

  return (
    <QuestionsContext.Provider
      value={{ sortIndex: findLargestSortIndex(questions) + 1 }}
    >
      <DragAndDropList
        aria-labelledby={labelId}
        data-cy="questions-list"
        id="questions-list"
        onDragEnd={handleDragEnd}
      >
        {sortedQuestions.map((question, index) => (
          <QuestionListItem
            index={index}
            key={question.id}
            question={question}
            questionnaire={questionnaire}
            onSubmit={updateQuestion}
            rank={index + 1}
          />
        ))}

        {!questions.length && (
          <ListItem>
            <Typography component="span" sx={{ my: 3 }}>
              {t('noQuestionsAdded')}
            </Typography>
          </ListItem>
        )}
      </DragAndDropList>

      <FloatingActionButton
        icon={<AddIcon />}
        label={t('addQuestion')}
        onClick={openDialog}
        data-cy="add-question-button"
      />

      <QuestionFormDialog
        isOpen={showDialog}
        close={closeDialog}
        onSubmit={createQuestion}
      />
    </QuestionsContext.Provider>
  );
};

export default QuestionList;
