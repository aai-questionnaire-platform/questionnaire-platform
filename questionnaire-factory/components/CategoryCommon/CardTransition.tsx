import { animated, useTransition } from '@react-spring/web';
import { PropsWithChildren, useRef } from 'react';
import styled from 'styled-components';

type CardTransitionProps = PropsWithChildren<{
  activeIndex: number;
  items: JSX.Element[];
}>;

const CardTransitionWrapper = styled(animated.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
  z-index: 0;
`;

enum DIRECTION {
  NEXT = 1,
  PREV = -1,
}

/**
 * Animation configuration when the direction of the carousel is next.
 * The current card "flies" to the left and next card is revealed underneath.
 */
const animationNext = {
  enter: {
    transform: `translate3d(0%,0,0) rotateZ(0deg)`,
    opacity: 3, // Value 3 here makes the card visible longer. Anything over 1 means 100% opacity
  },
  leave: {
    zIndex: 1,
    transform: `translate3d(-150%,0,0) rotateZ(-2deg)`,
    opacity: 0,
  },
};

/**
 * Animation configuration when the direction of the carousel is prev.
 * The previous card "flies" from the left.
 */
const animationPrev = {
  from: {
    zIndex: 1,
    opacity: 0,
    transform: `translate3d(-150%,0,0) rotateZ(2deg)`,
  },
  enter: {
    transform: `translate3d(0%,0,0) rotateZ(0deg)`,
    opacity: 2, // Value 2 here makes the card visible earlier. Anything over 1 means 100% opacity
  },
  leave: {},
};

function CardTransition({ activeIndex = 0, items }: CardTransitionProps) {
  const current = useRef(activeIndex);
  const direction =
    current.current > activeIndex ? DIRECTION.PREV : DIRECTION.NEXT;
  const transitions = useTransition(activeIndex, {
    ...(direction === DIRECTION.PREV ? animationPrev : animationNext),
    config: { friction: 75, tension: 380 },
    onStart: () => (current.current = activeIndex),
  });

  return (
    <>
      {transitions((styles, i) => (
        <CardTransitionWrapper key={i} style={styles}>
          {items[i]}
        </CardTransitionWrapper>
      ))}
    </>
  );
}

export default CardTransition;
