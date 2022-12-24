import { createContext } from 'react';

import { ListBoxProps } from '@/components/ListBox/types';

export const ChildContext = createContext<{
  maxSelectedOptions: number;
  isMultiSelect: boolean;
  onChange: ListBoxProps['onChange'];
  value?: string;
}>({
  maxSelectedOptions: 1,
  isMultiSelect: false,
  onChange: () => undefined,
  value: undefined,
});

export function focusOn(
  idx: number,
  children: any[],
  onChange?: ListBoxProps['onChange']
) {
  const lastIdx = children.length - 1;
  const clampedIdx = idx < 0 ? lastIdx : idx > lastIdx ? 0 : idx;
  const child = children[clampedIdx];
  child.focus();
  onChange?.(child.getValue());
}

export function focusPrev(
  children: any[],
  onChange?: ListBoxProps['onChange']
) {
  const currentIndex = children.findIndex((child) => child.hasFocus());
  focusOn(currentIndex - 1, children, onChange);
}

export function focusNext(
  children: any[],
  onChange?: ListBoxProps['onChange']
) {
  const currentIndex = children.findIndex((child) => child.hasFocus());
  focusOn(currentIndex + 1, children, onChange);
}
