import styled from 'styled-components';

const CardCtaButton = styled.button`
  position: absolute;
  bottom: -32px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  min-width: 215px;
  padding: 0px 48px;
  box-sizing: border-box;
  border-radius: 35px;
  background-color: ${({ theme }) => theme.primary};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

  color: ${({ theme }) => theme.white};
  text-decoration: none;
  font-weight: 600;
  font-size: 18px;
`;

export default CardCtaButton;
