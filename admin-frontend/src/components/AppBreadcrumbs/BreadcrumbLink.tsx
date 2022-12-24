import Link from '@mui/material/Link';
import * as R from 'ramda';
import { Link as RouterLink } from 'react-router-dom';
import { withUrlParams } from '../../api/utils';
import { useQueryParams } from '../../util/hooks';
import { getRoutePath, paramsToObject } from './utils';
import paths from '../../routes/paths';
import BreadcrumbLabel from './BreadcrumbLabel';

interface BreadcrumbLinkProps {
  route: string;
}

function pickParams(path: string, queryParams: URLSearchParams) {
  switch (path) {
    case paths.QUESTIONNAIRE:
    case paths.CONTENT_MANAGEMENT:
    case paths.USER_MANAGEMENT:
      return R.pick(['questionnaireId'], paramsToObject(queryParams));
    case paths.EDIT_CATEGORY:
      return R.pick(
        ['questionnaireId', 'categoryId'],
        paramsToObject(queryParams)
      );
    default:
      return {};
  }
}

const BreadcrumbLink = ({ route }: BreadcrumbLinkProps) => {
  const queryParams = useQueryParams();
  const path = getRoutePath(route);

  return (
    <Link
      component={RouterLink}
      to={withUrlParams(path, pickParams(path, queryParams))}
      underline="hover"
      color="inherit"
    >
      <BreadcrumbLabel route={route} />
    </Link>
  );
};

export default BreadcrumbLink;
