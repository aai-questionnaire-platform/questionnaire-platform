import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Icon from '@/components/Icon';

const ToastWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2;
`;

const SingleToast = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.white};
`;

interface ToastProps {
  message: string;
}

function Toast({ message }: ToastProps) {
  const { t } = useTranslation();

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setToastMessage(message);
    setInterval(() => {
      setToastMessage('');
    }, 3000);
  }, [message]);

  if (!toastMessage) {
    return null;
  }
  return (
    <ToastWrapper>
      <SingleToast>
        <Icon alt={t('home.navigation.info')} icon="info" size={30} />
        {toastMessage}
      </SingleToast>
    </ToastWrapper>
  );
}

export default Toast;
