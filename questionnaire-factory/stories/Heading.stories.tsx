import { ComponentStory, ComponentMeta } from '@storybook/react';

import Heading from '@/components/Heading';

export default {
  title: 'Atoms/Heading',
  component: Heading,
} as ComponentMeta<typeof Heading>;

const Template: ComponentStory<typeof Heading> = ({ children, ...rest }) => (
  <Heading {...rest}>{children}</Heading>
);

export const Heading1 = Template.bind({});
Heading1.args = {
  children: 'Heading level 1',
  variant: 'h1',
};

export const Heading2 = Template.bind({});
Heading2.args = {
  children: 'Heading level 2',
  variant: 'h2',
};

export const Heading3 = Template.bind({});
Heading3.args = {
  children: 'Heading level 3',
  variant: 'h3',
};
