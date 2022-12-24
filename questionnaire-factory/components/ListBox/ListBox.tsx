import { without } from 'ramda';
import { useCallback } from 'react';

import ListBoxList from '@/components/ListBox/ListBoxList';
import { ListBoxProps } from '@/components/ListBox/types';
import { ChildContext } from '@/components/ListBox/util';

function ListBox({
  onChange,
  value,
  maxSelectedOptions = 1,
  ...rest
}: ListBoxProps) {
  const isMultiSelect = maxSelectedOptions > 1;
  const onOptionSelect = useCallback(
    (newValue) => {
      let valueUpdate = newValue;

      if (isMultiSelect) {
        const valueArray = value?.split(',') || [];

        if (
          valueArray.length >= maxSelectedOptions &&
          !valueArray.includes(newValue)
        ) {
          return;
        }

        valueUpdate = (
          valueArray.includes(newValue)
            ? without([newValue], valueArray)
            : [...valueArray, newValue]
        ).join(',');
      }
      onChange(valueUpdate);
    },
    [onChange, isMultiSelect, maxSelectedOptions, value]
  );

  return (
    <ChildContext.Provider
      value={{
        value,
        maxSelectedOptions,
        isMultiSelect,
        onChange: onOptionSelect,
      }}
    >
      <ListBoxList {...rest} />
    </ChildContext.Provider>
  );
}

export default ListBox;
