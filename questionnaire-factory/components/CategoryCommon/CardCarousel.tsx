import { useDrag } from '@use-gesture/react';
import { useCallback } from 'react';

import { CardType } from '@/enums';
import { Answer, CategoryWithProgress } from '@/types';

import CardTransition from './CardTransition';
import ChantCard from './ChantCard';
import {
  Card as ICard,
  ChantCard as IChantCard,
  QuestionCard as IQuestionCard,
} from './types';
import { isCategoryLocked } from './util';

interface CardCarouselProps {
  cardComponent: Function;
  cards: ICard[];
  activeCard: ICard;
  category: CategoryWithProgress;
  answers: Answer[];
  prev: VoidFunction;
  next: VoidFunction;
  selectAnswer: (answer: Answer) => void;
  disableNext?: boolean;
  disableGestures?: boolean;
}

const MOVE_TRESHOLD = 25;

function CardCarousel({
  next,
  prev,
  activeCard,
  cards,
  category,
  disableGestures = false,
  answers,
  selectAnswer,
  cardComponent: CardComponent,
  disableNext = false,
}: CardCarouselProps) {
  const handleChangeIndex = useCallback(
    (newIndex: number) => {
      if (newIndex > activeCard.index && !disableNext) {
        next();
      } else if (newIndex < activeCard.index && newIndex >= 0) {
        prev();
      }
    },
    [activeCard, disableNext, next, prev]
  );

  const bind = useDrag(
    ({ active, direction: [xDir], tap, event }) => {
      if (tap || active) return;
      handleChangeIndex(activeCard.index + xDir * -1);
      event.stopPropagation();
    },
    {
      axis: 'x',
      eventOptions: { capture: true },
      threshold: MOVE_TRESHOLD,
      filterTaps: true,
    }
  );

  if (!activeCard) {
    return null;
  }

  return (
    <div {...(!disableGestures ? bind() : {})} style={{ touchAction: 'pan-x' }}>
      <CardTransition
        activeIndex={activeCard.index}
        items={cards.map((card) => {
          if (card.type === CardType.CHANT) {
            const c = card as IChantCard;
            return (
              <ChantCard
                key={card.index}
                title={category.description}
                message={c.message}
              />
            );
          } else {
            const c = card as IQuestionCard;
            return (
              <CardComponent
                key={card.index}
                card={c}
                question={c.question}
                category={category}
                answers={answers}
                questionCount={category.questions.length}
                isCategoryLocked={isCategoryLocked(category)}
                selectAnswer={selectAnswer}
              />
            );
          }
        })}
      />
    </div>
  );
}

export default CardCarousel;
