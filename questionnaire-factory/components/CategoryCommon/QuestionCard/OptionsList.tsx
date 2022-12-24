import styled from 'styled-components';

import ListBox from '@/components/ListBox';

const OptionsListBase = styled(ListBox)`
  display: flex;
  flex: 1;
  padding-top: 16px;
`;

export const OptionsList = styled(OptionsListBase)`
  flex-direction: column;
  justify-content: center;

  & > li:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const DenseOptionsList = styled(OptionsListBase)`
  flex-direction: row;
  flex-wrap: wrap;

  & > li {
    flex: 1 0 40%;
    margin: 4px;
  }
`;
