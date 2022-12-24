import styled from 'styled-components';

interface MapButtonContainerProps {
  top?: number | string;
  left?: number | string;
  scale?: number;
}

const MapButtonContainer = styled.div<MapButtonContainerProps>`
  position: absolute;
  top: ${({ top }) => (typeof top === 'string' ? top : `${top}px`)};
  left: ${({ left }) => (typeof left === 'string' ? left : `${left}px`)};
  transform: translate(-50%, -50%) scale(${({ scale }) => scale});
  z-index: 1;
`;

MapButtonContainer.defaultProps = {
  top: 0,
  left: 0,
  scale: 1,
};

export default MapButtonContainer;
