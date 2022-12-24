import { ReactChild, ReactFragment, ReactPortal } from 'react';

import MapButtonContainer from '@/features/Progress/MapPiece/MapButtonContainer';
import MapPieceContainer from '@/features/Progress/MapPiece/MapPieceContainer';
import PathStart from '@/features/Progress/MapPiece/paths/PathStart';

interface MapStartProps {
  buttons: (ReactChild | ReactFragment | ReactPortal)[];
  scale?: number;
}

const MapStart = ({ buttons, scale = 1 }: MapStartProps) => {
  return (
    <MapPieceContainer>
      <PathStart />

      <MapButtonContainer top="10%" left="70%" scale={scale}>
        {buttons[0]}
      </MapButtonContainer>

      {buttons[1] && (
        <MapButtonContainer top="20%" left="40%" scale={scale}>
          {buttons[1]}
        </MapButtonContainer>
      )}
    </MapPieceContainer>
  );
};

export default MapStart;
