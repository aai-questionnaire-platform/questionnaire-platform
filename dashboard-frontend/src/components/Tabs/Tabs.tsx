import { Children, cloneElement, useRef, useState } from 'react';
import styled from 'styled-components';

const TabsList = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  padding: 0 60px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  list-style-type: none;
`;

type TabsProps = { children: any[] };

let sequence = 0;

function Tabs({ children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const id = useRef(sequence++);

  return (
    <>
      <TabsList role="tablist">
        {Children.map(children, (tab, i) => {
          const active = i === activeTab;

          return cloneElement(tab, {
            active,
            'onClick': () => setActiveTab(i),
            'aria-selected': active,
            'aria-controls': `tabs-panel-${id.current}`,
          });
        })}
      </TabsList>

      <div id={`tabs-panel-${id.current}`}>
        {Children.map(children, (child, i) =>
          i === activeTab ? child.props.children : null
        )}
      </div>
    </>
  );
}

export default Tabs;
