import styled from 'styled-components';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  height: 576px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  ${({ theme }) =>
    theme.category.card?.fgColor && `color: ${theme.category.card.fgColor};`}
  ${({ theme }) =>
    theme.category.card?.bgColor &&
    `background: ${theme.category.card.bgColor};`}
`;

export default Card;
