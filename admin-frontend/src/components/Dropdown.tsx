import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectProps } from '@mui/material/Select';
import { useRef } from 'react';
import { uniqueId } from '../util';

type DropdownProps = Omit<
  SelectProps,
  'labelId' | 'aria-label' | 'aria-labelledby'
> & {
  name: string;
  label: string;
  helperText?: any;
};

const Dropdown = ({
  children,
  name,
  label,
  error,
  helperText,
  ...rest
}: DropdownProps) => {
  const id = useRef(uniqueId('dropdown-label'));

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel id={id.current}>{label}</InputLabel>
      <Select {...rest} name={name} labelId={id.current} label={label}>
        {children}
      </Select>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Dropdown;
