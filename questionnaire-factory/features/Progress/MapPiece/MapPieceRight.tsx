import { ReactChild, ReactFragment, ReactPortal } from 'react';

import MapButtonContainer from '@/features/Progress/MapPiece/MapButtonContainer';
import MapPieceContainer from '@/features/Progress/MapPiece/MapPieceContainer';
import Path from '@/features/Progress/MapPiece/paths/Path';

interface MapPieceRightProps {
  buttons: (ReactChild | ReactFragment | ReactPortal)[];
  scale?: number;
}

const MapPieceRight = ({ buttons, scale = 1 }: MapPieceRightProps) => {
  return (
    <MapPieceContainer>
      <Path flipVertical />

      {buttons.length === 1 && (
        <MapButtonContainer top="16%" left="82%" scale={scale}>
          {buttons[0]}
        </MapButtonContainer>
      )}

      {buttons.length === 2 && (
        <>
          <MapButtonContainer top="0%" left="82%" scale={scale}>
            {buttons[0]}
          </MapButtonContainer>
          <MapButtonContainer top="32%" left="72%" scale={scale}>
            {buttons[1]}
          </MapButtonContainer>
        </>
      )}
    </MapPieceContainer>
  );
};

export default MapPieceRight;
