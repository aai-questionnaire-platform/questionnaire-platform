import * as utils from './utils';

describe('services/utils', () => {
  describe('addToStringSet', () => {
    it('should add entry to the string set', () => {
      expect(utils.addToStringSet('a', [])).toEqual('a');
    });

    it('should not add entry twice', () => {
      expect(utils.addToStringSet('a', ['a'])).toEqual('a');
    });

    it('should not not add an empty value', () => {
      expect(utils.addToStringSet('', ['a'])).toEqual('a');
    });

    it('should join values with a comma', () => {
      expect(utils.addToStringSet('b', ['a'])).toEqual('a, b');
    });

    it('should default list to an emtpy array', () => {
      expect(utils.addToStringSet('b', undefined)).toEqual('b');
    });
  });

  describe('toStringSet', () => {
    it('should split a string set to an array of strings', () => {
      expect(utils.toStringSet('a, b')).toEqual(['a', 'b']);
    });

    it('should remove empty values', () => {
      expect(utils.toStringSet('a, , b, ')).toEqual(['a', 'b']);
    });

    it('should default list string to an empty string', () => {
      expect(utils.toStringSet(undefined)).toEqual([]);
    });
  });

  describe('arrayToListString', () => {
    it('should split a string set to an array of strings', () => {
      expect(utils.arrayToListString(['a', 'b'])).toEqual('a, b');
    });

    it('should remove empty values', () => {
      expect(utils.arrayToListString(['a', '', 'b'])).toEqual('a, b');
    });

    it('should default list string to an empty string', () => {
      expect(utils.arrayToListString(undefined)).toEqual('');
    });
  });
});
