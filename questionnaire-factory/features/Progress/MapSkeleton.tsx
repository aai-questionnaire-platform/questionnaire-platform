import styled from 'styled-components';

import Skeleton from '@/components/Skeleton';
import MapPiece from '@/features/Progress/MapPiece';
import ProgressLayout from '@/features/Progress/ProgressLayout';
import { ColorOrBackgroundImage } from '@/schema/Components';
import { SMALL_VIEWPORT_WIDTH_MAX } from '@/util/constants';
import { useAppTheme, useWindowDimensions } from '@/util/hooks';

const SkeletonContainer = styled.div`
  color: ${({ theme }) => theme.progress?.skeleton?.fgColor};
`;

const ShadowContainer = styled.div`
  border-radius: 50%;
  box-shadow: 0px 0.5px 4px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

interface MapSkeletonProps {
  pathLength?: number;
  background?: ColorOrBackgroundImage;
}

const MapSkeleton = ({ background, pathLength = 5 }: MapSkeletonProps) => {
  const { width } = useWindowDimensions();
  const scale =
    width > SMALL_VIEWPORT_WIDTH_MAX ? 1 : width / SMALL_VIEWPORT_WIDTH_MAX;
  const { progress } = useAppTheme();

  return (
    <ProgressLayout background={background}>
      <SkeletonContainer>
        {[...Array(pathLength)].map((_, i) => (
          <MapPiece
            index={i}
            isFirstItem={i === 0}
            isLastItem={i >= pathLength - 1}
            key={i}
            scale={scale}
          >
            <ShadowContainer>
              <Skeleton
                height={100}
                width={100}
                variant="circle"
                color={progress?.skeleton?.bgColor || '#fff'}
                animation="pulse-dark"
              />
            </ShadowContainer>
            <ShadowContainer>
              <Skeleton
                height={72}
                width={72}
                variant="circle"
                color={progress?.skeleton?.bgColor || '#fff'}
                animation="pulse-dark"
              />
            </ShadowContainer>
          </MapPiece>
        ))}
      </SkeletonContainer>
    </ProgressLayout>
  );
};

export default MapSkeleton;
