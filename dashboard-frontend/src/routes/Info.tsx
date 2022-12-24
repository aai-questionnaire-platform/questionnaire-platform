import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import TextCard from '@/components/Card/TextCard';
import Header from '@/components/Header';

function Info() {
  const { t } = useTranslation();
  const { subject } = useParams();

  return (
    <>
      <Header title={t('about.title')} />
      <main>
        {subject ? (
          <TextCard
            coverPhotoSrc="/auroraai_logo.jpg"
            content={t(`about.${subject}.long`)}
            bottomMargin={80}
          />
        ) : (
          <>
            <TextCard
              coverPhotoSrc="/auroraai_logo.jpg"
              content={t('about.general.short')}
              ctaLink={{
                href: '/info/general',
                label: t('about.readMore'),
              }}
              bottomMargin={80}
            />

            <TextCard
              coverPhotoSrc="/auroraai_logo.jpg"
              content={t('about.privacy.short')}
              ctaLink={{
                href: '/info/privacy',
                label: t('about.readMore'),
              }}
              bottomMargin={80}
            />
          </>
        )}
      </main>
    </>
  );
}

export default Info;
