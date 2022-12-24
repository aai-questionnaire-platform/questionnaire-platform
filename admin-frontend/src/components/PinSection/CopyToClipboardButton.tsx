import CheckIcon from '@mui/icons-material/Check';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Zoom from '@mui/material/Zoom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { visuallyHidden } from '@mui/utils';

interface CopyToClipboardButtonProps {
  label: string;
  text: string;
  iconChangeTimeout?: number;
}

const CopyToClipboardButton = ({
  label,
  text,
  iconChangeTimeout = 2000,
}: CopyToClipboardButtonProps) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    setIsCopied(true);
    copyToClipboard(text);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isCopied) {
      timer = setTimeout(() => {
        setIsCopied(false);
      }, iconChangeTimeout);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isCopied, iconChangeTimeout]);

  return (
    <IconButton aria-label={label} edge="end" onClick={handleClick}>
      <div aria-live="polite">
        {isCopied && <div style={visuallyHidden}>{t('copiedToClipboard')}</div>}
      </div>

      {isCopied ? (
        <Zoom in>
          <Fade in style={{ transitionDelay: '100ms' }}>
            <CheckIcon color="success" />
          </Fade>
        </Zoom>
      ) : (
        <Fade in exit>
          <ContentCopyOutlinedIcon />
        </Fade>
      )}
    </IconButton>
  );
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export default CopyToClipboardButton;
