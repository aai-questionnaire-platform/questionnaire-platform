import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface FormDebuggerProps {
  values: any;
  errors?: any;
}

const FormDebugger = ({ values, errors }: FormDebuggerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return process.env.NODE_ENV === 'development' ? (
    <Box border="2px solid yellow">
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <div>Show form values (in dev only):</div>
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          ▼
        </button>
      </Box>

      {isOpen && (
        <>
          <Typography
            sx={{ fontFamily: 'monospace', whiteSpace: 'break-spaces' }}
          >
            {JSON.stringify(values, null, 2)}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'break-spaces',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
            }}
          >
            {JSON.stringify(errors, null, 2)}
          </Typography>
        </>
      )}
    </Box>
  ) : null;
};

export default FormDebugger;
