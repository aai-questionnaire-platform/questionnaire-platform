import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

const Link = styled(RouterLink)`
  text-decoration: none;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
    color: inherit;
  }
`;

export default Link;
