import { ReactChild, ReactFragment, ReactPortal } from 'react';

import MapButtonContainer from '@/features/Progress/MapPiece/MapButtonContainer';
import MapPieceContainer from '@/features/Progress/MapPiece/MapPieceContainer';
import Path from '@/features/Progress/MapPiece/paths/Path';

interface MapPieceLeftProps {
  buttons: (ReactChild | ReactFragment | ReactPortal)[];
  scale?: number;
}

const MapPieceLeft = ({ buttons, scale = 1 }: MapPieceLeftProps) => {
  return (
    <MapPieceContainer>
      <Path />

      {buttons.length === 1 && (
        <MapButtonContainer top="34%" left="27%" scale={scale}>
          {buttons[0]}
        </MapButtonContainer>
      )}

      {buttons.length === 2 && (
        <>
          <MapButtonContainer top="20%" left="18%" scale={scale}>
            {buttons[0]}
          </MapButtonContainer>
          <MapButtonContainer top="45%" left="40%" scale={scale}>
            {buttons[1]}
          </MapButtonContainer>
        </>
      )}
    </MapPieceContainer>
  );
};

export default MapPieceLeft;
