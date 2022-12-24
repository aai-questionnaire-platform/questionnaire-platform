import { Location } from 'history';
import { NavLink, NavLinkProps } from 'react-router-dom';
import AppDrawerListItem from './AppDrawerListItem';

interface NavEntryProps extends NavLinkProps {
  indent?: number;
}

const NavEntry = ({
  children,
  to,
  exact = false,
  indent = 0,
}: NavEntryProps) => {
  return (
    <AppDrawerListItem
      component={NavLink}
      to={to}
      exact={exact}
      indent={indent}
      activeStyle={{ fontWeight: 'bold' }}
      isActive={(_: any, location: Location) =>
        to === `${location.pathname}${location.search}`
      }
    >
      {children}
    </AppDrawerListItem>
  );
};

export default NavEntry;
