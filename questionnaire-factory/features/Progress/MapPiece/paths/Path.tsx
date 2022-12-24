import styled from 'styled-components';

export interface PathSVGProps {
  flipVertical?: boolean;
}

const SVG = styled.svg<PathSVGProps>`
  display: block;
  ${({ flipVertical }) => flipVertical && `transform: scale(1, -1);`}
`;

const Path = (props: PathSVGProps) => (
  <SVG {...props} viewBox="0 0 375 304" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M53 0C53 52.1695 69.5 102.678 184.74 155.818C299.29 208.648 323.48 250.109 323.48 304"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeMiterlimit="10"
    />
  </SVG>
);

SVG.defaultProps = {
  flipVertical: false,
};

export default Path;
