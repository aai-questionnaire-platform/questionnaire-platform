import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useUpdateCategoryState } from '@/api/hooks';
import Flex from '@/components/Flex';
import SpinnerButton from '@/components/SpinnerButton';
import Typography from '@/components/Typography';
import { CategoryState } from '@/enums';
import { ButtonVariant } from '@/schema/Components';
import { CategoryWithProgress } from '@/types';

interface TopicAddressedBannerProps {
  category: CategoryWithProgress;
  organizationIds: string[];
  questionnaireId: string;
  buttonVariant?: ButtonVariant;
}

const Container = styled(Flex)`
  align-items: center;
  justify-content: space-between;

  margin-bottom: 32px;
  padding: 16px;

  color: ${({ theme }) =>
    theme.adminAnswerSummary.adminAnswerSummaryListItem.fgColor};
  background: ${({ theme }) =>
    theme.adminAnswerSummary.adminAnswerSummaryListItem.bgColor};
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;

const Description = styled(Typography)`
  margin: 0 8px;
`;

const StyledButton = styled(SpinnerButton)`
  border-radius: 12px;
`;

function TopicAddressedBanner({
  category,
  organizationIds,
  questionnaireId,
  buttonVariant,
}: TopicAddressedBannerProps) {
  const { t } = useTranslation();
  const { dispatch: updateCategoryState, loading } = useUpdateCategoryState(
    organizationIds,
    questionnaireId
  );

  const approveCategory = () => {
    updateCategoryState({
      category_id: category.id,
      status: CategoryState.APPROVED,
    });
  };

  const unlockCategory = () => {
    updateCategoryState({
      category_id: category.id,
      status: CategoryState.UNLOCKED,
    });
  };

  const isUnlocked = category.state === CategoryState.UNLOCKED;

  return (
    <Container data-cy="admin-answer-summary-topic-addressed-banner">
      <Description>
        {isUnlocked
          ? t('adminAnswerSummary.topicAddressed.unlockedDescription')
          : t('adminAnswerSummary.topicAddressed.approvedDescription')}
      </Description>

      <StyledButton
        variant={buttonVariant}
        onClick={isUnlocked ? approveCategory : unlockCategory}
        isLoading={loading}
        data-cy="admin-answer-summary-topic-addressed-button"
      >
        {isUnlocked
          ? t('adminAnswerSummary.topicAddressed.unlockedButtonLabel')
          : t('adminAnswerSummary.topicAddressed.approvedButtonLabel')}
      </StyledButton>
    </Container>
  );
}

export default TopicAddressedBanner;
