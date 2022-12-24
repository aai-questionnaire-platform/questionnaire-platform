import { a, useSpring } from '@react-spring/web';
import * as R from 'ramda';
import { useEffect, useState, Children, FunctionComponent } from 'react';
import styled from 'styled-components';

import { onEnterOrSpace } from '@/util';

export interface CardDeckProps {
  currentCardIndex: number;
  onClick: (e: any) => void;
}

interface CardDeckComponent extends FunctionComponent<CardDeckProps> {
  Front: typeof CardDeckFront;
  Back: typeof CardDeckBack;
}

const CardDeckBack: FunctionComponent = ({ children }) => <>{children}</>;
CardDeckBack.displayName = 'CardDeckBack';

const CardDeckFront: FunctionComponent = ({ children }) => <>{children}</>;
CardDeckFront.displayName = 'CardDeckFront';

const CardDeckBase = styled.div`
  position: relative;
  width: 343px;
  height: 576px;
`;

const FlippedDeck = styled(CardDeckBase)`
  outline: none;
`;

const UnFlippedDeck = styled(CardDeckBase)`
  cursor: pointer;
  &:active {
    transform: scale(0.975);
  }
`;

const CardDeckSide = styled(a.div)`
  position: absolute;
  will-change: transform, opacity;
  user-select: none;
  width: 100%;
  height: 100%;
`;

const CardDeck: CardDeckComponent = ({
  currentCardIndex,
  children,
  onClick,
}) => {
  const [isFlipped, setFlipped] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: isFlipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${isFlipped ? -180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  useEffect(() => {
    if (currentCardIndex > -1 && !isFlipped) {
      setFlipped(true);
    } else if (currentCardIndex === -1 && isFlipped) {
      setFlipped(false);
    }
  }, [currentCardIndex, isFlipped]);

  if (Children.count(children) !== 2) {
    throw new Error(
      'CardDeck should have exactly two children: Front and Back'
    );
  }

  const childArray = Children.toArray(children);
  const front = childArray.find(
    R.pathEq(['type', 'displayName'], 'CardDeckFront')
  );
  const back = childArray.find(
    R.pathEq(['type', 'displayName'], 'CardDeckBack')
  );

  return (
    <CardDeckBase
      data-cy="card-deck"
      as={isFlipped ? FlippedDeck : UnFlippedDeck}
      flipped={isFlipped}
      tabIndex={isFlipped ? -1 : 0}
      onClick={onClick}
      onKeyUp={onEnterOrSpace(onClick)}
    >
      <CardDeckSide
        aria-hidden={isFlipped}
        style={{
          transform,
          opacity: opacity.to((o) => 1 - o),
          zIndex: isFlipped ? 0 : 1,
        }}
        data-cy="card-deck-back"
      >
        {back}
      </CardDeckSide>

      <CardDeckSide
        aria-hidden={!isFlipped}
        style={{
          opacity,
          transform: transform.to((t) => `${t} rotateY(180deg)`),
          zIndex: isFlipped ? 1 : 0,
        }}
        data-cy="card-deck-front"
      >
        {front}
      </CardDeckSide>
    </CardDeckBase>
  );
};

CardDeck.Back = CardDeckBack;
CardDeck.Front = CardDeckFront;

export default CardDeck;
