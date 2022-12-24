import Head from 'next/head';
import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetcher } from '@/api/hooks';
import { generateAnswerSet, withUrlParams } from '@/api/util';
import Button from '@/components/Button';
import CardCarousel from '@/components/CategoryCommon/CardCarousel';
import CardDeck from '@/components/CategoryCommon/CardDeck';
import ChantCard from '@/components/CategoryCommon/ChantCard';
import QuestionCard from '@/components/CategoryCommon/QuestionCard';
import {
  getCategoryMessage,
  isAnswerNotRequiredOrSelectedForCard,
} from '@/components/CategoryCommon/util';
import ChangeAnnouncer from '@/components/ChangeAnnouncer';
import Flex from '@/components/Flex';
import Icon from '@/components/Icon';
import NetworkErrorDialog from '@/components/NetworkErrorDialog';
import Spacer from '@/components/Spacer';
import { useAppConfig } from '@/components/WithAppContext';
import withSettingsGuard from '@/components/withSettingsGuard';
import {
  actions,
  reducer,
  resolveInitialState,
} from '@/features/Category/Category.state';
import { Answer } from '@/types';
import { mergeTitles } from '@/util';
import UniqueQueue from '@/util/UniqueQueue';
import { useEffectAfterMount } from '@/util/hooks';

import { useCategoryContext } from './CategoryContext';
import { CategoryContentContainer } from './CategoryLayout';
import withCategoryContext from './withCategoryContext';

const answerQueue = new UniqueQueue<Answer, string>(R.prop('question_id'));

function CategoryView() {
  const {
    answers: initialAnswers,
    category,
    config,
    progress,
    questionnaire,
    userSettings,
  } = useCategoryContext();
  const { t } = useTranslation();
  const router = useRouter();
  const { title } = useAppConfig();
  const fetcher = useFetcher();
  const [answerError, setError] = useState();
  const [state, dispatchAction] = useReducer(
    reducer,
    resolveInitialState({
      answers: initialAnswers,
      category,
      progress,
    })
  );

  const selectAnswer = useCallback((answer: Answer) => {
    answerQueue.add(answer);
    dispatchAction(actions.selectAnswer(answer));
  }, []);

  const sendAnswers = useCallback(() => {
    const unsavedAnswers = answerQueue.dropAll();
    const answerSet = generateAnswerSet(
      userSettings.organization_hierarchy,
      questionnaire,
      unsavedAnswers
    );

    setError(undefined);

    fetcher('answers', {
      method: 'POST',
      body: JSON.stringify(answerSet),
    }).catch((e: any) => {
      unsavedAnswers.forEach((answer) => answerQueue.add(answer));
      setError(e);
    });
  }, [fetcher, questionnaire, userSettings.organization_hierarchy]);

  const onCardDeckClick = useCallback(() => {
    if (state.activeCardIndex === -1) {
      dispatchAction(actions.nextCard());
    }
  }, [state.activeCardIndex]);

  const nextCard = useCallback(() => {
    if (answerQueue.size()) {
      sendAnswers();
    }
    dispatchAction(actions.nextCard());
  }, [sendAnswers]);

  const prevCard = useCallback(() => dispatchAction(actions.prevCard()), []);

  const activeCard = state.cards[state.activeCardIndex];
  const isAnswerSelected = isAnswerNotRequiredOrSelectedForCard(
    state.cards[state.activeCardIndex],
    state.answers
  );

  useEffect(() => {
    if (initialAnswers?.length) {
      dispatchAction(actions.setAnswers(initialAnswers));
    }
  }, [initialAnswers]);

  useEffectAfterMount(() => {
    if (!category) {
      router.replace('/404');
    }
  }, [category]);

  useEffect(() => {
    if (state.activeCardIndex > -1 && !activeCard) {
      router.replace(
        withUrlParams(`/${router.query.appId}/category/end`, {
          id: router.query.id as string,
        })
      );
    }
  }, [state.activeCardIndex, activeCard, router]);

  return (
    <>
      <Head>
        <title>{mergeTitles(title, category.description)}</title>
      </Head>

      <NetworkErrorDialog
        error={answerError}
        message={t('category.saveError')}
      />

      <ChangeAnnouncer
        message={
          state.activeCardIndex > -1 && activeCard
            ? t('category.cardProgress', {
                current: state.activeCardIndex + 1,
                total: state.cards.length,
              })
            : ''
        }
      />

      <CardDeck
        currentCardIndex={state.activeCardIndex}
        onClick={onCardDeckClick}
      >
        <CardDeck.Front>
          <CardCarousel
            cardComponent={QuestionCard}
            cards={state.cards}
            activeCard={activeCard}
            category={state.category}
            disableNext={!isAnswerSelected}
            selectAnswer={selectAnswer}
            answers={state.answers}
            prev={prevCard}
            next={nextCard}
          />
        </CardDeck.Front>

        <CardDeck.Back>
          <ChantCard
            title={category.description}
            message={getCategoryMessage('entryMessages', category)}
            image={category.image}
            imageAlt={t('category.cardImageAlt')}
          />
        </CardDeck.Back>
      </CardDeck>

      {state.activeCardIndex < state.cards.length && (
        <Spacer mv={16}>
          <Flex as={CategoryContentContainer} justify="space-between">
            {state.activeCardIndex > 0 ? (
              <Button
                variant={config.navigation?.buttonVariant ?? 'secondary'}
                startIcon={<Icon icon="chevron-left" size={12} />}
                onClick={prevCard}
                style={{ font: config.navigation?.font }}
                data-cy="category-prev-card"
              >
                {t('category.prev')}
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant={config.navigation?.buttonVariant ?? 'secondary'}
              disabled={!isAnswerSelected}
              endIcon={<Icon icon="chevron-right" size={12} />}
              onClick={nextCard}
              style={{ font: config.navigation?.font }}
              data-cy="category-next-card"
            >
              {t('category.next')}
            </Button>
          </Flex>
        </Spacer>
      )}
    </>
  );
}

export default withSettingsGuard(withCategoryContext(CategoryView));
