import { ReactChild, ReactFragment, ReactPortal } from 'react';

import MapButtonContainer from '@/features/Progress/MapPiece/MapButtonContainer';
import MapPieceContainer from '@/features/Progress/MapPiece/MapPieceContainer';
import PathEndRight from '@/features/Progress/MapPiece/paths/PathEndRight';

interface MapEndRightProps {
  buttons: (ReactChild | ReactFragment | ReactPortal)[];
  scale?: number;
}

const MapEndRight = ({ buttons, scale = 1 }: MapEndRightProps) => {
  return (
    <MapPieceContainer>
      <PathEndRight />

      {buttons.length === 1 && (
        <MapButtonContainer top="95%" left="52%" scale={scale}>
          {buttons[0]}
        </MapButtonContainer>
      )}

      {buttons.length === 2 && (
        <>
          <MapButtonContainer top="50%" left="78%" scale={scale}>
            {buttons[0]}
          </MapButtonContainer>
          <MapButtonContainer top="95%" left="52%" scale={scale}>
            {buttons[1]}
          </MapButtonContainer>
        </>
      )}
    </MapPieceContainer>
  );
};

export default MapEndRight;
