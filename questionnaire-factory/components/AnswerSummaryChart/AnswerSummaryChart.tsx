import { Trans } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';

import {
  AnswerSummaryChartData,
  calculateChartData,
  formatOwnAnswer,
  getLabelContent,
} from '@/components/AnswerSummaryChart/util';
import Typography from '@/components/Typography';
import { AnswerSummaryQuestion } from '@/types';

interface AnswerSummaryChartViewProps {
  question: AnswerSummaryQuestion;
  colors: {
    default: string;
    highlight: string;
    text: string;
  };
}

const Label = styled.text`
  font-size: 14px;
  line-height: 18px;
`;

function AnswerSummaryChart({ question, colors }: AnswerSummaryChartViewProps) {
  const { answers, ownAnswer } = question;
  const chartData: AnswerSummaryChartData = calculateChartData(
    answers,
    ownAnswer
  );

  const barSize = chartData.length > 5 ? 8 : 16;

  const renderLabel = ({ value, viewBox, index }: any) =>
    viewBox ? (
      <Label x={0} y={viewBox.y + 18 + barSize} fill={colors.text}>
        {`${String.fromCharCode(97 + index)}. ${value}`}
      </Label>
    ) : null;

  return (
    <div data-cy="answer-summary-chart">
      {ownAnswer && (
        <Typography
          variant="small"
          as="div"
          style={{ textAlign: 'left' }}
          data-cy="answer-summary-own-answer"
        >
          <Trans
            i18nKey="answerSummary.youAnswered"
            values={{ answer: formatOwnAnswer(answers, ownAnswer) }}
            components={{ italic: <Typography as="span" italic /> }}
          />
        </Typography>
      )}

      <ResponsiveContainer
        height={chartData.length * (chartData.length > 5 ? 48 : 56)}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <XAxis type="number" hide domain={[0, 1]} />
          <YAxis type="category" hide padding={{ top: -16, bottom: 8 }} />

          <Bar dataKey="value" barSize={barSize} minPointSize={4}>
            {chartData.map((entry, index) => (
              <Cell
                radius={2}
                key={`cell-${index}`}
                fill={entry.isOwnAnswer ? colors.highlight : colors.default}
              />
            ))}

            <LabelList dataKey={getLabelContent} content={renderLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnswerSummaryChart;
