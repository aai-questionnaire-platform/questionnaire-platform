import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import BreadcrumbLabel from './BreadcrumbLabel';
import BreadcrumbLink from './BreadcrumbLink';

const AppBreadcrumbs = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const routes = pathname.split('/');

  return (
    <Breadcrumbs
      aria-label={t('breadcrumbs')}
      data-cy="breadcrumbs"
      sx={{ mb: 6 }}
    >
      {routes.map((route, index) =>
        index >= routes.length - 1 ? (
          <Typography color="text.primary" key={index}>
            <BreadcrumbLabel route={route} />
          </Typography>
        ) : (
          <BreadcrumbLink route={route} key={index} />
        )
      )}
    </Breadcrumbs>
  );
};

export default AppBreadcrumbs;
