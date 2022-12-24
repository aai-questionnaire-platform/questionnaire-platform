import { ComponentStory, ComponentMeta } from '@storybook/react';

import Typography from '@/components/Typography';

export default {
  title: 'Atoms/Typography',
  component: Typography,
} as ComponentMeta<typeof Typography>;

const Template: ComponentStory<typeof Typography> = ({ children, ...rest }) => (
  <Typography {...rest}>{children}</Typography>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Body text / default',
  variant: 'default',
  as: 'p',
};

export const Small = Template.bind({});
Small.args = {
  children: 'Body text / small',
  variant: 'small',
  as: 'p',
};
