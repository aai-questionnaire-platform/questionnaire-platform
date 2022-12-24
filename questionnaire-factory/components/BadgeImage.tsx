import styled from 'styled-components';

const BadgeImage = styled.img`
  clip-path: circle();
`;

BadgeImage.defaultProps = {
  width: 100,
  height: 100,
};

export default BadgeImage;
