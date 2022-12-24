import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { FormikProps } from 'formik';
import * as R from 'ramda';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type OnSubmitErrorsProps = Pick<FormikProps<any>, 'errors' | 'isSubmitting'>;

const OnSubmitErrors = ({ errors, isSubmitting }: OnSubmitErrorsProps) => {
  const { t } = useTranslation();
  const displayErrors = !isSubmitting && !R.isEmpty(errors);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (displayErrors) {
      timeout = setTimeout(() => ref.current?.focus(), 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [displayErrors]);

  if (!displayErrors) {
    return null;
  }

  return (
    <Alert
      ref={ref}
      severity="error"
      sx={{ mb: 2 }}
      tabIndex={-1}
      data-cy="form-submit-errors"
    >
      <AlertTitle>{t('formErrors')}</AlertTitle>
      <ul>
        {Object.values(errors).map((value, index) => (
          <li key={index}>{t(`validationError`, value)}</li>
        ))}
      </ul>
    </Alert>
  );
};

const pickProps = R.pick(['isSubmitting']);

// only update the component when a new submit is happening not when errors change
export default React.memo(
  OnSubmitErrors,
  (prevProps: OnSubmitErrorsProps, nextProps: OnSubmitErrorsProps) =>
    R.equals(pickProps(prevProps), pickProps(nextProps))
);
