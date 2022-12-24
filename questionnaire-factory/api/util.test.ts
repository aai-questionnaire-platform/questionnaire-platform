import {
  anyLoading,
  findError,
  mapFetchData,
  normalizeAnswers,
} from '@/api/util';

describe('api/utils', () => {
  describe('mapFetchData', () => {
    it('should return an object', () => {
      expect(mapFetchData({})).toEqual({});
    });

    it('should map data props', () => {
      const fetches = {
        questionnaire: { data: {} },
      };
      expect(mapFetchData(fetches)).toEqual({ questionnaire: {} });
    });
  });

  describe('anyLoading', () => {
    it('should return false if none is loading', () => {
      const fetches = {
        questionnaire: { loading: false },
      };
      expect(anyLoading(fetches)).toBe(false);
    });

    it('should return false if is loading', () => {
      const fetches = {
        questionnaire: { loading: true },
      };
      expect(anyLoading(fetches)).toBe(true);
    });

    it('should return false if any is loading', () => {
      const fetches = {
        fetch1: { loading: false },
        fetch2: { loading: true },
      };
      expect(anyLoading(fetches)).toBe(true);
    });
  });

  describe('findError', () => {
    it('should return false if no error', () => {
      const fetches = {
        questionnaire: {},
      };
      expect(findError(fetches)).toBe(undefined);
    });

    it('should return error if found', () => {
      const error = {};
      const fetches = {
        questionnaire: { error },
      };
      expect(findError(fetches)).toBe(error);
    });

    it('should return first non null error', () => {
      const error = {};
      const fetches = {
        fetch1: { error: null },
        fetch2: { error },
      };
      expect(findError(fetches)).toBe(error);
    });

    it('should return first error if more than one', () => {
      const error = {};
      const fetches = {
        fetch1: { error },
        fetch2: { error: {} },
      };
      expect(findError(fetches)).toBe(error);
    });
  });

  describe('normalizeAnswers', () => {
    it('should return an empty array if answers is nil', () => {
      expect(normalizeAnswers()).toStrictEqual([]);
      // just in case the server returns null instead of undefined
      expect(normalizeAnswers(null as any)).toStrictEqual([]);
    });

    it('should combine all answers by id', () => {
      const answers = [
        { question_id: '1', answer_value: '1' },
        { question_id: '2', answer_value: '1' },
        { question_id: '1', answer_value: '2' },
      ];

      const expectedAnswers = [
        { question_id: '1', answer_value: '1,2' },
        { question_id: '2', answer_value: '1' },
      ];

      expect(normalizeAnswers(answers)).toStrictEqual(expectedAnswers);
    });
  });
});
