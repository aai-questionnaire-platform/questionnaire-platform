import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState, Children, ReactNode, SyntheticEvent } from 'react';

interface TabViewProps {
  children: ReactNode;
  labels: string[];
  name: string;
}

const TabView = ({ labels, name, children }: TabViewProps) => {
  const [value, setValue] = useState(0);

  if (Children.count(children) !== labels.length) {
    throw new Error('Lengths of labels and children should be equal');
  }

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box width="100%">
      <Box display="flex" flexDirection="row">
        <Tabs value={value} onChange={handleChange} aria-label={`${name}-tabs`}>
          {labels.map((label, index) => (
            <Tab
              key={index}
              label={label}
              sx={{
                bgcolor: index === value ? 'primary.light' : 'transparent',
              }}
              id={`${name}-tab-${index}`}
              data-cy={`${name}-tab-${index}`}
              aria-controls={`${name}-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      {Children.map(children, (child, index) => (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`${name}-tabpanel-${index}`}
          aria-labelledby={`${name}-tab-${index}`}
        >
          {value === index && child}
        </div>
      ))}
    </Box>
  );
};

export default TabView;
