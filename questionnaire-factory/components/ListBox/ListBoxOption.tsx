import classNames from 'classnames';
import { always } from 'ramda';
import {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
  FunctionComponent,
  ReactNode,
} from 'react';

import { ChildContext } from '@/components/ListBox/util';
import { onEnterOrSpace, stopPropagation } from '@/util';

interface ListBoxOptionProps {
  label: string | ReactNode;
  value: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const ListBoxOption: FunctionComponent<ListBoxOptionProps> = forwardRef(
  function ListBoxOptionForwardRef(
    { label, value, className, id, disabled = false },
    ref
  ) {
    const elementRef = useRef<HTMLLIElement>(null);
    const {
      onChange,
      value: currentValue,
      isMultiSelect,
    } = useContext(ChildContext);

    const isSelected = isMultiSelect
      ? currentValue?.split(',').includes(value)
      : currentValue === value;

    const onValueChange = useCallback(() => onChange(value), [onChange, value]);

    useImperativeHandle(ref, () => ({
      hasFocus: () => elementRef.current === window.document.activeElement,
      isSelected: always(isSelected),
      focus: () => elementRef.current?.focus(),
    }));

    return (
      <li
        id={id}
        ref={elementRef}
        className={classNames('ListBox__option', className, {
          'ListBox__option--active': isSelected,
          'ListBox__option--disabled': disabled,
        })}
        role="option"
        tabIndex={-1}
        aria-selected={isSelected}
        onFocus={stopPropagation()}
        onClick={stopPropagation(onValueChange)}
        onKeyUp={onEnterOrSpace(stopPropagation(onValueChange))}
      >
        {label}
      </li>
    );
  }
);

export default ListBoxOption;
