import styled from 'styled-components';

const Divider = styled.hr`
  height: 0px;
  width: 100%;
  border: none;
  border-top: 1px solid ${({ theme, color }) => color || theme.divider};
  margin: 1.5rem 0;
`;

export default Divider;
