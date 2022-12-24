import Typography from '@/components/Typography';

interface InputErrorProps {
  id: string;
  error?: string;
}

function InputError({ id, error }: InputErrorProps) {
  return (
    <Typography as="div" id={id} variant="small" role="alert" italic>
      {error}
    </Typography>
  );
}

export default InputError;
