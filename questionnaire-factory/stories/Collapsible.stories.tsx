import { ComponentStory, ComponentMeta } from '@storybook/react';

import CollapsibleComponent from '@/components/Collapsible';

export default {
  title: 'Molecules/Collapsible',
  component: CollapsibleComponent,
} as ComponentMeta<typeof CollapsibleComponent>;

const Template: ComponentStory<typeof CollapsibleComponent> = (props) => (
  <CollapsibleComponent {...props}>
    <ol>
      <li>Dream</li>
      <li>Rest</li>
      <li>Relax</li>
    </ol>
  </CollapsibleComponent>
);

export const Collapsible = Template.bind({});
Collapsible.args = {
  heading: <span>Todo</span>,
};
