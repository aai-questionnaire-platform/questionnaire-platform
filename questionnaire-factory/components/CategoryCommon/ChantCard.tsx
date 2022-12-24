import styled from 'styled-components';

import BadgeImage from '@/components/BadgeImage';
import Card from '@/components/CategoryCommon/Card';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Typography from '@/components/Typography';

interface ChantCardProps {
  title: string;
  message?: string;
  image?: string;
  imageAlt?: string;
}

const FlexCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  padding: 1.25rem 1rem;
  border-bottom: 1px solid currentColor;
`;

const ContentContainer = styled(Flex)`
  padding: 3rem;
`;

function ChantCard({ title, message, image, imageAlt }: ChantCardProps) {
  return (
    <FlexCard>
      <TitleContainer>
        <Heading variant="h2" as="h1" align="center">
          {title}
        </Heading>
      </TitleContainer>

      <ContentContainer
        direction="column"
        align="center"
        justify="center"
        grow={1}
        data-cy="chant-card-content"
      >
        {image && (
          <BadgeImage
            src={image}
            alt={imageAlt ?? ''}
            width={160}
            height={160}
          />
        )}

        {message && (
          <Typography italic align="center">
            {message}
          </Typography>
        )}
      </ContentContainer>
    </FlexCard>
  );
}

export default ChantCard;
