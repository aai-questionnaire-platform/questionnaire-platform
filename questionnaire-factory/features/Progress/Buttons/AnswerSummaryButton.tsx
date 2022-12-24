import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { CategoryState } from '@/enums';

import { useProgressContext } from '../ProgressContext';
import ProgressButton from './ProgressButton';

interface AnswerSummaryButtonProps {
  state: CategoryState;
  categoryId: string;
}

const AnswerSummaryButton = ({
  state,
  categoryId,
}: AnswerSummaryButtonProps) => {
  const { config } = useProgressContext();
  const { t } = useTranslation();
  const router = useRouter();

  const { activeIcon, doneIcon, link, lockedIcon } =
    config.category.answerSummaryButton;
  const active = state === CategoryState.COMPLETED;
  const disabled =
    state === CategoryState.LOCKED || state === CategoryState.UNLOCKED;

  const icon = disabled ? lockedIcon : active ? activeIcon : doneIcon;

  const label = t(
    disabled
      ? 'progress.answerSummaryLocked'
      : active
      ? 'progress.answerSummaryActive'
      : 'progress.answerSummaryDone',
    { categoryId }
  );

  const handleClick = () => {
    router.push(`/${router.query.appId}/${link.slug}?id=${categoryId}`);
  };

  return (
    <ProgressButton
      aria-label={label}
      data-cy={`answer-summary-button-${categoryId}`}
      active={active}
      disabled={disabled}
      onClick={handleClick}
      size={72}
      state={state}
    >
      <img src={icon} alt="" />
    </ProgressButton>
  );
};

export default AnswerSummaryButton;
