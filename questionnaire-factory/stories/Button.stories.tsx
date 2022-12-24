import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default {
  title: 'Atoms/Button',
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = ({ children, ...rest }) => (
  <Button {...rest}>{children}</Button>
);

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary Button',
  variant: 'primary',
  disabled: false,
};

export const PrimaryWithIcon = Template.bind({});
PrimaryWithIcon.args = {
  children: 'Primary with icon',
  variant: 'primary',
  disabled: false,
  startIcon: <Icon icon="chevron-left" size={13} />,
};

export const PrimaryWithIconOnly = Template.bind({});
PrimaryWithIconOnly.args = {
  variant: 'primary',
  disabled: false,
  iconOnly: true,
  startIcon: <Icon icon="chevron-left" size={24} />,
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  variant: 'secondary',
  disabled: false,
};

export const SecondaryWithIconLeft = Template.bind({});
SecondaryWithIconLeft.args = {
  children: 'Secondary with icon',
  variant: 'secondary',
  disabled: false,
  startIcon: <Icon icon="chevron-left" size={13} />,
};

export const SecondaryWithIconRight = Template.bind({});
SecondaryWithIconRight.args = {
  children: 'Secondary with Text',
  variant: 'secondary',
  disabled: false,
  endIcon: <Icon icon="chevron-right" size={13} />,
};

export const SecondaryWithIconOnly = Template.bind({});
SecondaryWithIconOnly.args = {
  children: <Icon icon="chevron-left" size={13} />,
  variant: 'secondary',
  disabled: false,
  iconOnly: true,
};

export const FlatWithIconLeft = Template.bind({});
FlatWithIconLeft.args = {
  children: 'Flat button',
  variant: 'flat',
  disabled: false,
  startIcon: <Icon icon="chevron-left" size={13} />,
};

export const FlatWithIconRight = Template.bind({});
FlatWithIconRight.args = {
  children: 'Flat button',
  variant: 'flat',
  disabled: false,
  endIcon: <Icon icon="chevron-right" size={13} />,
};

export const FlatWithIconOnly = Template.bind({});
FlatWithIconOnly.args = {
  children: <Icon icon="chevron-right" size={13} />,
  variant: 'flat',
  disabled: false,
  iconOnly: true,
};
