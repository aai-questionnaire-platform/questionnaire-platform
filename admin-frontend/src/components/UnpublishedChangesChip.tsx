import Chip, { ChipProps } from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

const UnpublishedChangesChip = ({ sx, ...rest }: ChipProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      sx={{
        ...sx,
        borderRadius: 0,
        fontStyle: 'italic',
        fontWeight: 500,
        pointerEvents: 'none',
      }}
      label={t('unpublishedChanges')}
      variant="filled"
      color="warning"
      {...rest}
    />
  );
};

export default UnpublishedChangesChip;
