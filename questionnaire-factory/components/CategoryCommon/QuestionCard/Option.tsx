import styled from 'styled-components';

import ListBoxOption from '@/components/ListBox/ListBoxOption';
import Typography from '@/components/Typography';

const Option = styled(ListBoxOption)`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;

  padding: 16px;
  color: ${({ theme }) => theme.category.option.default.fgColor};
  background: ${({ theme }) => theme.category.option.default.bgColor};
  border: 1px solid ${({ theme }) => theme.category.option.default.border};
  border-radius: 12px;
  ${({ theme }) =>
    theme.category.option.default.shadow &&
    `box-shadow: ${theme.category.option.default.shadow};`}

  cursor: pointer;
  outline: none;

  &:focus-visible {
    outline: ${({ theme }) => theme.category.option.default.bgColor} solid 3px;
  }

  &.ListBox__option--active {
    background: ${({ theme }) => theme.category.option.active.bgColor};
    color: ${({ theme }) => theme.category.option.active.fgColor};
    border-color: ${({ theme }) => theme.category.option.active.border};
    ${({ theme }) =>
      theme.category.option.active.shadow &&
      `box-shadow: ${theme.category.option.active.shadow};`}
  }

  ${({ disabled }) => disabled && 'pointer-events: none;'}
`;

export const OptionLabel = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  overflow-wrap: break-word;
`;

export default Option;
