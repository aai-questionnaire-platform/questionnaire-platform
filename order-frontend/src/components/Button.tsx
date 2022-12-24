import styled from 'styled-components';

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  min-width: 225px;
  padding: 0px 20px;
  box-sizing: border-box;
  border: 0;
  border-radius: 35px;
  box-shadow: ${({ disabled }) =>
    !disabled
      ? '0px 4px 10px rgba(184, 184, 184, 0.25)'
      : '0px 4px 10px rgba(0, 0, 0, 0.1)'};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.disabled : theme.primary};
  color: ${({ theme }) => theme.white};
  text-decoration: none;
  font-weight: 600;
  font-size: 18px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`;

export default Button;
