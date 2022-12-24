import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import Collapsible from '@/components/Collapsible';
import Container from '@/components/Container';
import Typography from '@/components/Typography';

interface AdminAnswerSummaryListItemProps {
  heading: string;
}

const AnswerSummaryCollapsible = styled(Collapsible)`
  margin-bottom: 16px;
  color: ${({ theme }) =>
    theme.adminAnswerSummary.adminAnswerSummaryListItem.fgColor};
  background: ${({ theme }) =>
    theme.adminAnswerSummary.adminAnswerSummaryListItem.bgColor};
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;

function AdminAnswerSummaryListItem({
  children,
  heading,
  ...rest
}: PropsWithChildren<AdminAnswerSummaryListItemProps>) {
  return (
    <li>
      <AnswerSummaryCollapsible
        {...rest}
        heading={
          <Container pv={16}>
            <Typography variant="default" as="h2" weight={500} align="left">
              {heading}
            </Typography>
          </Container>
        }
      >
        {children}
      </AnswerSummaryCollapsible>
    </li>
  );
}

export default AdminAnswerSummaryListItem;
