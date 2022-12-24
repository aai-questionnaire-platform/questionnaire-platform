import { ReactChild, ReactFragment, ReactPortal } from 'react';

import MapButtonContainer from '@/features/Progress/MapPiece/MapButtonContainer';
import MapPieceContainer from '@/features/Progress/MapPiece/MapPieceContainer';
import PathEndLeft from '@/features/Progress/MapPiece/paths/PathEndLeft';

interface MapEndLeftProps {
  buttons: (ReactChild | ReactFragment | ReactPortal)[];
  scale?: number;
}

const MapEndLeft = ({ buttons, scale = 1 }: MapEndLeftProps) => {
  return (
    <MapPieceContainer>
      <PathEndLeft />

      {buttons.length === 1 && (
        <MapButtonContainer top="95%" left="48%" scale={scale}>
          {buttons[0]}
        </MapButtonContainer>
      )}

      {buttons.length === 2 && (
        <>
          <MapButtonContainer top="50%" left="22%" scale={scale}>
            {buttons[0]}
          </MapButtonContainer>
          <MapButtonContainer top="95%" left="48%" scale={scale}>
            {buttons[1]}
          </MapButtonContainer>
        </>
      )}
    </MapPieceContainer>
  );
};

export default MapEndLeft;
