import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/api/hooks';
import { RegistrationComponent } from '@/schema/Components';
import { Organization } from '@/types';

import GroupPreview from '../GroupPreview';
import PinCodeStep from './PinCodeStep';
import { useGroup } from './util';

type PinCodeProps = Omit<
  RegistrationComponent['props'],
  'method' | 'background'
> & {
  organizations: Organization[];
  user: { userId: string; [key: string]: any };
};

function PinCode({ nextButton, organizations, user }: PinCodeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: settings, loading: settingsLoading } = useSettings();
  const [inputValue, setInputValue] = useState('');
  const [correctPin, setCorrectPin] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const {
    data: group,
    loading: isLoading,
    error: fetchError,
  } = useGroup(correctPin);

  useEffect(() => {
    setError(fetchError ? 'groupNotFound' : undefined);
  }, [fetchError]);

  // when settings contains the organization hierarchy then redirect
  // user away from this page
  useEffect(() => {
    if (settings?.organization_hierarchy) {
      router.replace(`/${router.query.appId}/${nextButton.slug}`);
    }
  }, [settings, router, nextButton.slug]);

  const onPinChange = (value: string) => {
    setError(undefined);
    setInputValue(value);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (inputValue.length < 5) {
      setError('codeTooShort');
      return;
    }

    setCorrectPin(inputValue);
  };

  const cancel = () => {
    setCorrectPin(undefined);
    setInputValue('');
  };

  return group ? (
    <GroupPreview
      group={group}
      user={user}
      organizations={organizations}
      isLoading={settingsLoading}
      onCancel={cancel}
    />
  ) : (
    <PinCodeStep
      pin={inputValue}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onPinChange={onPinChange}
      error={error && t(`registration.pin.error.${error}`)}
    />
  );
}

export default PinCode;
