import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useServices } from '@/api/hooks';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ServiceCard from '@/components/ServiceCard';

function Service() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: services } = useServices();

  const currentService = services?.find((service) => service.id === id);

  return currentService ? (
    <>
      <Header
        icon={<Icon alt={t('back')} icon="arrow-left" size={30} />}
        text={'Header'}
        linkProps={{ to: '/' }}
      />
      <ServiceCard service={currentService} open={true} />
    </>
  ) : null;
}

export default Service;
