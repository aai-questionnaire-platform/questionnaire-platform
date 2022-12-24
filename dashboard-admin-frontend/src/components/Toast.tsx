import { useEffect, useState } from 'react';
import styled from 'styled-components';

import InfoIcon from '@mui/icons-material/Info';

const ToastWrapper = styled.div`
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 1200;
`;

const SingleToast = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 5px;
  border: 2px solid #1876d2;
  color: #1876d2;
`;

interface ToastProps {
  message: string;
}

function Toast({ message }: ToastProps) {
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
        <InfoIcon />
        {toastMessage}
      </SingleToast>
    </ToastWrapper>
  );
}

export default Toast;