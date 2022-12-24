import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { CategoryState } from '@/enums';

import { useProgressContext } from '../ProgressContext';
import ProgressButton from './ProgressButton';

interface FeedbackButtonProps {
  state: CategoryState;
}

const FeedbackButton = ({ state }: FeedbackButtonProps) => {
  const { config } = useProgressContext();
  const { t } = useTranslation();
  const router = useRouter();

  const { image, link } = config.feedback!;

  const active = state === CategoryState.UNLOCKED;
  const disabled = state === CategoryState.LOCKED;

  const handleClick = () => {
    router.push(`/${router.query.appId}/${link.slug}`);
  };

  return (
    <ProgressButton
      aria-label={t('progress.feedbackButton')}
      data-cy="feedback-button"
      active={active}
      disabled={disabled}
      onClick={handleClick}
      size={100}
      state={state}
    >
      <img src={image?.src} alt="" />
    </ProgressButton>
  );
};

export default FeedbackButton;
