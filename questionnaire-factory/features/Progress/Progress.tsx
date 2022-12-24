import styled from 'styled-components';

import withSettingsGuard from '@/components/withSettingsGuard';
import { ProgressComponent } from '@/schema/Components';
import { SMALL_VIEWPORT_WIDTH_MAX } from '@/util/constants';
import { useWindowDimensions } from '@/util/hooks';

import AnswerSummaryButton from './Buttons/AnswerSummaryButton';
import CategoryButton from './Buttons/CategoryButton';
import FeedbackButton from './Buttons/FeedbackButton';
import MapPiece from './MapPiece';
import { useProgressContext } from './ProgressContext';
import ProgressLayout from './ProgressLayout';
import WithProgressContext from './withProgressContext';

const ProgressContainer = styled.div`
  color: ${({ theme }) => theme.progress.fgColor};
`;

const Progress = (props: ProgressComponent['props']) => {
  const { categories } = useProgressContext();
  const { width } = useWindowDimensions();
  const scale =
    width > SMALL_VIEWPORT_WIDTH_MAX ? 1 : width / SMALL_VIEWPORT_WIDTH_MAX;

  return (
    <ProgressLayout background={props.background}>
      <ProgressContainer>
        {categories.map((category, index) => (
          <MapPiece
            index={index}
            key={index}
            isFirstItem={index === 0}
            isLastItem={index >= categories.length - 1}
            scale={scale}
          >
            {category.type !== 'feedback' && (
              <CategoryButton
                index={index}
                categoryId={category.id}
                state={category.state}
              />
            )}
            {category.type !== 'feedback' && (
              <AnswerSummaryButton
                categoryId={category.id}
                state={category.state}
              />
            )}

            {category.type === 'feedback' && (
              <FeedbackButton state={category.state} />
            )}
          </MapPiece>
        ))}
      </ProgressContainer>
    </ProgressLayout>
  );
};

export default withSettingsGuard(WithProgressContext(Progress));
