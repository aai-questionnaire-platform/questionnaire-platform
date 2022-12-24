import Image from 'next/image';
import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useQuestionnaire } from '@/api/hooks';
import Background from '@/components/Background';
import Heading from '@/components/Heading';
import LinkButton from '@/components/LinkButton';
import NetworkError from '@/components/NetworkError';
import PlayerAppHeader from '@/components/PlayerAppHeader';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { CategoryEndComponent } from '@/schema/Components';
import { Category } from '@/types';
import { asImageDef, getQueryParam } from '@/util';
import { useAppTheme } from '@/util/hooks';
import { categoryLens } from '@/util/lenses';

const CategoryEndBackground = styled(Background)`
  display: flex;
  flex-direction: column;
`;

const CatgoryEndMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2.5rem;
  ${({ theme }) =>
    theme.categoryEnd?.fgColor && `color: ${theme.categoryEnd?.fgColor};`}
`;

function CategoryEnd(props: CategoryEndComponent['props']) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { data: questionnaire, loading, error } = useQuestionnaire();
  const router = useRouter();
  const categoryId = getQueryParam('id', router);
  const { link, image, background } = props;

  if (loading) {
    return null;
  }

  if (error) {
    return <NetworkError error={error} />;
  }

  const category: Category = R.view(categoryLens(categoryId), questionnaire);
  const bg = category.backgroundImage
    ? { ...(background ?? {}), ...asImageDef(category.backgroundImage) }
    : background;

  return (
    <CategoryEndBackground bg={bg}>
      <PlayerAppHeader color={theme.categoryEnd?.playerAppHeader?.color} />

      <CatgoryEndMain data-cy="category-end-card">
        <Spacer mb={40}>
          <Heading variant="h1" align="center">
            {t('category.endTitle')}
          </Heading>
        </Spacer>

        <Spacer mb={40}>
          <Typography align="center">{t('category.endContent')}</Typography>
        </Spacer>

        {link && (
          <LinkButton slug={link.slug} label={t('category.endButton')} />
        )}

        {image && (
          <Spacer mt={40}>
            <Image
              src={image.src}
              alt={t('category.endImageAlt')}
              width={image.width}
              height={image.height}
            />
          </Spacer>
        )}
      </CatgoryEndMain>
    </CategoryEndBackground>
  );
}

export default CategoryEnd;
