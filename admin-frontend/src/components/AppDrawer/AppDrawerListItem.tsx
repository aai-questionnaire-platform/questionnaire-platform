import ListItemButton, {
  ListItemButtonProps,
} from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { PropsWithChildren } from 'react';

const StyledListItem = styled(ListItemButton)(
  (props: ListItemButtonProps & { indent: number }) => ({
    'paddingLeft': 16 + 8 * props.indent * 2,
    'width': '100%',
    'fontWeight': 500,
    'borderRadius': 2,
    '&:hover': {
      backgroundColor: 'primary.light',
      textDecoration: 'underline',
    },
  })
);

const AppDrawerListItem = ({ children, ...rest }: PropsWithChildren<any>) => (
  <StyledListItem {...rest}>
    <Typography sx={{ fontWeight: 'inherit' }}>{children}</Typography>
  </StyledListItem>
);

export default AppDrawerListItem;
