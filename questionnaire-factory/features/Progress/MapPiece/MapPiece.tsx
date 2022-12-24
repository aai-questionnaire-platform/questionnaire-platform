import { Children, PropsWithChildren } from 'react';

import MapEndLeft from '@/features/Progress/MapPiece/MapEndLeft';
import MapEndRight from '@/features/Progress/MapPiece/MapEndRight';
import MapPieceLeft from '@/features/Progress/MapPiece/MapPieceLeft';
import MapPieceRight from '@/features/Progress/MapPiece/MapPieceRight';
import MapStart from '@/features/Progress/MapPiece/MapStart';

interface MapPieceProps {
  index: number;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  scale?: number;
}

const MapPiece = ({
  children,
  index,
  isFirstItem = false,
  isLastItem = false,
  scale = 1,
}: PropsWithChildren<MapPieceProps>) => {
  const buttons = Children.toArray(children);

  if (isFirstItem) {
    return <MapStart buttons={buttons} scale={scale} />;
  }

  const isRightSide = index % 2 === 0;

  if (isLastItem) {
    return isRightSide ? (
      <MapEndRight buttons={buttons} scale={scale} />
    ) : (
      <MapEndLeft buttons={buttons} scale={scale} />
    );
  }

  return isRightSide ? (
    <MapPieceRight buttons={buttons} scale={scale} />
  ) : (
    <MapPieceLeft buttons={buttons} scale={scale} />
  );
};

export default MapPiece;
