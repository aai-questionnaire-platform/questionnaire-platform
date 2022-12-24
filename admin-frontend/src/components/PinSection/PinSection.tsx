import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import CopyToClipboardButton from './CopyToClipboardButton';

interface PinSectionProps {
  description: string;
  label: string;
  pin: string;
}

const PinSection = ({ description, label, pin }: PinSectionProps) => {
  const { t } = useTranslation();

  return (
    <Box
      role="region"
      aria-labelledby="pin-code-label"
      display="flex"
      flexDirection="row"
      borderRadius={1}
      p={2}
      pb={3}
      bgcolor="primary.light"
    >
      <Box mr={2} flexBasis="33%">
        <InputLabel
          id="pin-code-label"
          htmlFor="pin-code-input"
          sx={{ color: 'inherit' }}
        >
          {label}
        </InputLabel>

        <OutlinedInput
          id="pin-code-input"
          aria-describedby="pin-code-description"
          name="pinCode"
          value={pin}
          inputProps={{ readOnly: true }}
          endAdornment={
            <InputAdornment position="end" data-cy="copy-pin">
              <CopyToClipboardButton label={t('copyPin')} text={pin} />
            </InputAdornment>
          }
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>

      <Box display="flex" alignItems="flex-end">
        <Typography id="pin-code-description" variant="body2">
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default PinSection;
