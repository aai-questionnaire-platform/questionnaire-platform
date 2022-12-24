import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { postWithAuth } from '@/api/rest-connector';

const StyledButton = styled(Button)<{ contentVisible: boolean }>`
  border: none;
  transition: all 0.2s ease-in-out;
  background-color: ${({ theme }) => theme.primary};

  ${({ contentVisible }) =>
    contentVisible &&
    `
      color: #000;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
    `}
`;

interface CodeButtonProps {
  serviceId: string;
}

function CodeButton({ serviceId }: CodeButtonProps) {
  const [codeVisible, setCodeVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<number | null>(null);
  const [code, setCode] = useState('');

  const toggleShowCode = async () => {
    setCodeVisible(!codeVisible);

    try {
      setLoading(true);
      setError(null);

      const response = await postWithAuth(
        JSON.stringify({ serviceId }),
        'code'
      );

      setCode(response.code);
    } catch (error: any) {
      setError(error.status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledButton
      disabled={loading || !!error}
      onClick={toggleShowCode}
      contentVisible={codeVisible}
    >
      <ButtonContent
        codeVisible={codeVisible}
        loading={loading}
        error={error}
        code={code}
      />
    </StyledButton>
  );
}

interface ButtonContentProps {
  codeVisible: boolean;
  loading: boolean;
  error: number | null;
  code: string;
}

function ButtonContent({
  codeVisible,
  loading,
  error,
  code,
}: ButtonContentProps) {
  const { t } = useTranslation();

  if (!codeVisible) {
    return <>{t('services.showCode')}</>;
  }

  if (loading) {
    return <Loader color="#000" />;
  }

  if (error) {
    return (
      <>
        {error === 404
          ? t(`order.code.error.${error}`)
          : t('order.code.error.*')}
      </>
    );
  }

  return <>{code}</>;
}

export default CodeButton;
