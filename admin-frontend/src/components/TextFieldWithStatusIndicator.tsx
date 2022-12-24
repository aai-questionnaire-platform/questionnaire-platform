import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import * as R from 'ramda';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectAfterMount } from '../util/hooks';

type TextFieldWithStatusIndicatorProps = TextFieldProps & {
  submitForm: () => Promise<any>;
};

/**
 * The amount of time in ms after which the success indicator (check mark) is hidden
 */
const SUCCESS_INDICATOR_TIMEOUT = 2000;

const TextFieldWithStatusIndicator = (
  props: TextFieldWithStatusIndicatorProps
) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSynced, setSynced] = useState(false);
  const initialValue = useRef(props.value);
  const onSubmitStart = () => {
    setIsSubmitting(true);
    props.submitForm().then(onSubmitDone);
  };
  const onSubmitDone = () => {
    setIsSubmitting(false);
    setSynced(true);
    initialValue.current = props.value;
  };

  useEffectAfterMount(() => {
    let timeout: NodeJS.Timeout;

    // when the form stops submitting and the current field is not being focused
    if (isSynced) {
      // clear the success indicator after [SUCCESS_INDICATOR_TIMEOUT]ms
      timeout = setTimeout(() => {
        setSynced(false);
      }, SUCCESS_INDICATOR_TIMEOUT);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isSynced]);

  return (
    <TextField
      {...R.omit(['submitForm'], props)}
      onFocus={(e) => {
        props.onFocus?.(e);
        setSynced(false);
      }}
      onBlur={(e) => {
        props.onBlur?.(e);
        // only submit the form if the value of this field has changed
        if (props.value !== initialValue.current) {
          onSubmitStart();
        }
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isSubmitting && (
              <CircularProgress
                color="primary"
                size={24}
                aria-label={t('saving')}
                data-cy="text-field-loading-indicator"
              />
            )}
            {!isSubmitting && isSynced && (
              <CheckIcon
                color="success"
                fontSize="medium"
                aria-label={t('saved')}
                data-cy="text-field-success-indicator"
              />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default TextFieldWithStatusIndicator;
