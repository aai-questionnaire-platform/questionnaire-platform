import AnswerSummaryChart from '@/components/AnswerSummaryChart';
import Typography from '@/components/Typography';
import AdminAnswerSummaryListItem from '@/features/AdminAnswerSummary/AdminAnswerSummaryListItem';
import { AnswerSummary, CategoryWithProgress } from '@/types';
import { formAnswerSummaryData } from '@/util';
import { useAppTheme } from '@/util/hooks';

interface AdminAnswerSummaryListProps {
  answerSummary?: AnswerSummary;
  category: CategoryWithProgress;
}

function AdminAnswerSummaryList({
  answerSummary,
  category,
}: AdminAnswerSummaryListProps) {
  const theme = useAppTheme();

  const answerSummaryData = formAnswerSummaryData(answerSummary, category);

  return (
    <ol data-cy="admin-answer-summary-list">
      {answerSummaryData.questions.length
        ? answerSummaryData.questions.map((question, index) => (
            <AdminAnswerSummaryListItem
              heading={`${index + 1}. ${question.label}`}
              key={index}
              data-cy={`admin-answer-summary-list-item-${index}`}
            >
              <AnswerSummaryChart
                question={question}
                colors={theme.adminAnswerSummary!.chart}
              />
            </AdminAnswerSummaryListItem>
          ))
        : category.questions.map((question, index) => (
            <AdminAnswerSummaryListItem
              heading={`${index + 1}. ${question.label}`}
              key={index}
              data-cy={`admin-answer-summary-list-item-${index}`}
            >
              {question.options.map((option, index) => (
                <Typography key={index} variant="small">
                  {`${String.fromCharCode(index + 97)}. ${option.label}`}
                </Typography>
              ))}
            </AdminAnswerSummaryListItem>
          ))}
    </ol>
  );
}

export default AdminAnswerSummaryList;
