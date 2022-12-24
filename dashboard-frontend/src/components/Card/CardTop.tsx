import styled from 'styled-components';

const CardTop = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 250px;
  background: ${({ backgroundImage }) =>
    `url(${backgroundImage}) no-repeat center center`};
  background-size: cover;
  display: flex;
  justify-content: center;
  border-radius: 25px 25px 0 0;
`;

export default CardTop;
