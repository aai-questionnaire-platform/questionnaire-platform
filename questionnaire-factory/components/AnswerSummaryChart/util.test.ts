import {
  AnswerSummaryChartData,
  calculateChartData,
  formatOwnAnswer,
} from '@/components/AnswerSummaryChart/util';
import { AnswerSummaryOption } from '@/types';

describe('Answers/AnswerCard/util', () => {
  const answerSet: AnswerSummaryOption[] = [
    {
      answerCount: 5,
      label: 'Answer 1',
      value: '1',
    },
    { answerCount: 2, label: 'Answer 2', value: '2' },
    { answerCount: 3, label: 'Answer 3', value: '3' },
  ];

  describe('calculateChartData', () => {
    it('should return correctly calculated chart data', () => {
      const expectedAnswerChartData: AnswerSummaryChartData = [
        { label: 'Answer 1', value: 0.5, isOwnAnswer: true },
        { label: 'Answer 2', value: 0.2, isOwnAnswer: false },
        { label: 'Answer 3', value: 0.3, isOwnAnswer: false },
      ];

      expect(calculateChartData(answerSet, '1')).toEqual(
        expectedAnswerChartData
      );
    });

    it('should return correctly calculated chart data on multi-select questions', () => {
      const expectedMultiAnswerChartData: AnswerSummaryChartData = [
        { label: 'Answer 1', value: 0.5, isOwnAnswer: true },
        { label: 'Answer 2', value: 0.2, isOwnAnswer: false },
        { label: 'Answer 3', value: 0.3, isOwnAnswer: true },
      ];

      expect(calculateChartData(answerSet, '1,3')).toEqual(
        expectedMultiAnswerChartData
      );
    });
  });

  describe('formatOwnAnswer', () => {
    it('should return correctly formatted answers', () => {
      expect(formatOwnAnswer(answerSet, '1')).toEqual('Answer 1');
      expect(formatOwnAnswer(answerSet, '2')).toEqual('Answer 2');
      expect(formatOwnAnswer(answerSet, '3')).toEqual('Answer 3');
      expect(formatOwnAnswer(answerSet, '1,2')).toEqual('Answer 1, Answer 2');
      expect(formatOwnAnswer(answerSet, '1,2,3')).toEqual(
        'Answer 1, Answer 2, Answer 3'
      );
    });
  });
});
