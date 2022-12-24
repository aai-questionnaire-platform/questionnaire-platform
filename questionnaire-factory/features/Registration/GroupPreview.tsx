import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useSWRConfig } from 'swr';

import { useFetcher } from '@/api/hooks';
import Button from '@/components/Button';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Heading from '@/components/Heading';
import NetworkErrorDialog from '@/components/NetworkErrorDialog';
import Spacer from '@/components/Spacer';
import SpinnerButton from '@/components/SpinnerButton';
import Typography from '@/components/Typography';
import { Group, Organization } from '@/types';
import { findOrganization } from '@/util';

interface GroupPreviewProps {
  group: Group;
  user: { userId: string; [key: string]: any };
  organizations: Organization[];
  isLoading: boolean;
  onCancel: VoidFunction;
}

const DefinitionList = styled.dl`
  & > * {
    display: block;
    margin: 0;
  }

  & > dd {
    margin-bottom: 1rem;
  }
`;

const GroupPreviewContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2.5rem 0;
`;

const SubmitButton = styled(SpinnerButton)`
  align-self: center;
  margin-top: 2.5rem;
  margin-bottom: 2rem;
`;

const CancelButton = styled(Button)`
  align-self: center;
  margin-top: 2rem;
`;

function GroupPreview({
  group,
  user,
  organizations,
  isLoading: isParentLoading,
  onCancel,
}: GroupPreviewProps) {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const fetcher = useFetcher();
  const parent = findOrganization(organizations, group.parent_organization_id);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const onConfirm = async () => {
    setError(undefined);
    setLoading(true);

    try {
      await fetcher('groupmember', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.userId,
          group,
        }),
      });
      mutate('settings');
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GroupPreviewContainer>
      <NetworkErrorDialog
        error={error}
        message={t('registration.groupPreview.joinError')}
      />

      <Container ph={40}>
        <Spacer mb={32}>
          <Heading variant="h1">
            {t('registration.groupPreview.heading')}
          </Heading>
        </Spacer>

        <DefinitionList>
          <Typography as="dt" weight="bold">
            {t('registration.groupPreview.groupLabel')}:
          </Typography>

          <Typography as="dd">{group.name}</Typography>

          <Typography as="dt" weight="bold">
            {t('registration.groupPreview.organizationLabel')}:
          </Typography>

          <Typography as="dd">{parent?.name}</Typography>

          <Typography as="dt" weight="bold">
            {t('registration.groupPreview.groupAdmin')}:
          </Typography>

          <Typography as="dd">{/* TODO: Group admin name */}-</Typography>
        </DefinitionList>
      </Container>

      {t('registration.groupPreview.description') && (
        <>
          <Divider />
          <Container ph={40}>
            <Typography>
              {t('registration.groupPreview.description')}
            </Typography>
          </Container>
        </>
      )}

      <SubmitButton
        variant="primary"
        type="submit"
        isLoading={isLoading || isParentLoading}
        onClick={onConfirm}
        data-cy="group-preview-confirm"
      >
        {t('registration.groupPreview.confirm')}
      </SubmitButton>

      <Divider />

      <CancelButton onClick={onCancel} data-cy="group-preview-cancel">
        {t('registration.groupPreview.cancel')}
      </CancelButton>
    </GroupPreviewContainer>
  );
}

export default GroupPreview;
