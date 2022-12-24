import classNames from 'classnames';
import {
  cloneElement,
  useCallback,
  useContext,
  useRef,
  Children,
  KeyboardEvent,
} from 'react';

import { ListBoxProps } from '@/components/ListBox/types';
import {
  ChildContext,
  focusOn,
  focusNext,
  focusPrev,
} from '@/components/ListBox/util';
import { uniqueId } from '@/util';

type ListBoxListProps = Omit<
  ListBoxProps,
  'onChange' | 'value' | 'maxSelectedOptions'
>;

function ListBoxList({ children, className, ...rest }: ListBoxListProps) {
  const id = useRef(uniqueId());
  const optionRefs = useRef([] as any[]);
  const { onChange } = useContext(ChildContext);

  const onFocus = useCallback(() => {
    const selected = optionRefs.current.find((child) => child.isSelected());
    (selected || optionRefs.current[0]).focus();
  }, []);

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const hasAlt = e.getModifierState('Alt');

      switch (e.code) {
        case 'ArrowUp':
          focusPrev(optionRefs.current, hasAlt ? onChange : undefined);
          break;
        case 'ArrowDown':
          focusNext(optionRefs.current, hasAlt ? onChange : undefined);
          break;
        case 'Home':
          focusOn(0, optionRefs.current);
          break;
        case 'End':
          focusOn(optionRefs.current.length - 1, optionRefs.current);
          break;
      }
    },
    [optionRefs, onChange]
  );

  return (
    <ul
      role="listbox"
      tabIndex={0}
      className={classNames('ListBox', className)}
      onFocus={onFocus}
      onKeyDown={onKeyUp}
      {...rest}
    >
      {Children.map(children, (child: any, index) =>
        cloneElement(child, {
          id: `listbox-option-${id.current}-${index}`,
          ref: (element: any) => {
            optionRefs.current[index] = element;
          },
        })
      )}
    </ul>
  );
}

export default ListBoxList;
