import styled from 'styled-components';

const TabButton = styled.button<{ active?: boolean }>`
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: 0;

  ${({ active }) =>
    active &&
    `&:after {
    content: '';
    height: 5px;
    width: 100%;
    background: #0afff4;
    display: block;
    border-radius: 50px;
    margin-top: 15px;
  }`}
`;

function Tab({ active, label, ...rest }: any) {
  return (
    <TabButton active={active} role="tab" {...rest}>
      {label}
    </TabButton>
  );
}

export default Tab;
