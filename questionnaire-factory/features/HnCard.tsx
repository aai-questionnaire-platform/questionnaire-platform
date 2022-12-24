import styled from 'styled-components';

import Card from '@/components/CategoryCommon/Card';

const HnCard = styled(Card)`
  height: auto;
  max-height: 648px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px;
  border: 1px solid #f2f2f2;
  border-radius: 50px;
  margin-bottom: 24px;
`;

export default HnCard;
