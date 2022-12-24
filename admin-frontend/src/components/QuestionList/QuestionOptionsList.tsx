import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Field } from 'formik';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createOptionForQuestion } from './util';
import { Option, OptionDto } from '../../types';
import UnpublishedChangesChip from '../UnpublishedChangesChip';

interface QuestionOptionsListProps {
  options: Option[] | OptionDto[];
  questionUuid: string;
  add: Function;
  remove: Function;
}

const QuestionOptionsList: React.FC<QuestionOptionsListProps> = ({
  options,
  questionUuid,
  add,
  remove,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const onAddClick = () => {
    add(createOptionForQuestion(questionUuid, options));
    setTimeout(() => {
      if (ref.current && !ref.current.value) {
        ref.current.focus();
      }
    }, 0);
  };

  return (
    <>
      <List aria-label={t('options')} data-cy="options-list">
        {options.map((option, index) => (
          <ListItem
            key={option.uuid}
            disableGutters
            secondaryAction={
              <IconButton
                data-cy="option-remove-button"
                aria-label={t('deleteOption', option)}
                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                onClick={() => remove(index)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <Field name={`options.${index}.label`}>
              {({ field, meta }: any) => (
                <TextField
                  {...field}
                  id="option-label"
                  label={t('option', { index: index + 1 })}
                  fullWidth
                  variant="outlined"
                  error={!!(meta.touched && meta.error)}
                  inputProps={{
                    ref,
                  }}
                  InputProps={{
                    endAdornment: option.meta?.status === 'draft' && (
                      <InputAdornment position="end">
                        <UnpublishedChangesChip
                          sx={{ ml: 3 }}
                          data-cy="option-draft-chip"
                        />
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    meta.touched &&
                    meta.error &&
                    t(`validationError`, { ...meta.error, field: 'option' })
                  }
                />
              )}
            </Field>
          </ListItem>
        ))}

        {!options.length && (
          <ListItem>
            <Typography component="span">{t('noOptionsAdded')}</Typography>
          </ListItem>
        )}
      </List>

      <Button
        color="primary"
        variant="outlined"
        onClick={onAddClick}
        data-cy="add-option-button"
        sx={{ borderRadius: '999px', mb: 4 }}
      >
        <AddIcon fontSize="small" />
        &nbsp;
        {t('addOption')}
      </Button>
    </>
  );
};

export default QuestionOptionsList;
