import styled from 'styled-components';

const Card = styled.div<{ bottomMargin?: number }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: ${({ bottomMargin = '32px' }) => `${bottomMargin}px`};
  border-radius: 25px;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
`;

export default Card;
