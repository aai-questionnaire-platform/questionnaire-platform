import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Card from './Card';
import CardCtaButton from './CardCtaButton';
import CardTop from './CardTop';

interface TextCardProps {
  coverPhotoSrc: string;
  content: string;
  bottomMargin?: number;
  ctaLink?: {
    href: string;
    label: string;
  };
}

const CardContent = styled.div`
  padding: 30px 25px 0 25px;
`;

const Title = styled.h2`
  font-size: 18px;
  line-height: 24px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  font-size: 1rem;
  line-height: 24px;
  font-weight: 600;
`;

const Paragraph = styled.p`
  font-size: 14px;
  line-height: 18px;
  margin: 0;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 26px;
`;

function TextCard({
  coverPhotoSrc,
  content,
  ctaLink,
  bottomMargin,
}: TextCardProps) {
  return (
    <Card bottomMargin={bottomMargin}>
      <CardTop backgroundImage={coverPhotoSrc} />
      <CardContent>
        <Trans
          i18nKey={content}
          components={{
            p: <Paragraph />,
            h2: <Title />,
            h3: <SubTitle />,
          }}
        />

        {ctaLink && (
          <ButtonContainer>
            <CardCtaButton as={Link} to={ctaLink.href}>
              {ctaLink.label}
            </CardCtaButton>
          </ButtonContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default TextCard;
